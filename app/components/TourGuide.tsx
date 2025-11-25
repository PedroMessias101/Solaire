import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutRectangle,
  Platform,
  TouchableOpacity,
  Text,
  UIManager,
  findNodeHandle,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
 
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TOUR_SEEN_KEY = "app_tour_seen_v1"; // chave usada para salvar se já viu o tour
 
type StepMeta = {
  key: string;
  title: string;
  description?: string;
  layout?: LayoutRectangle;
};
 
type Theme = {
  overlayColor: string;
  highlightColor: string;
  primary: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
};
 
const DEFAULT_THEME: Theme = {
  overlayColor: "rgba(6,10,17,0.62)",
  highlightColor: "#FFD54F",
  primary: "#2e86de",
  cardBackground: "#ffffff",
  textPrimary: "#0f1724",
  textSecondary: "#555",
  border: "rgba(15,20,30,0.04)",
};
 
type TourContextType = {
  registerStep: (key: string, meta: Omit<StepMeta, "layout">) => void;
  updateLayout: (key: string, layout: LayoutRectangle) => void;
  registerRef: (key: string, ref: any) => void;
  startTour: (opts?: { fromIndex?: number; force?: boolean }) => void;
  stopTour: () => void;
  isRunning: boolean;
  currentIndex: number;
  totalSteps: number;
  registerScrollRef?: (ref: React.RefObject<ScrollView>) => void;
  markSeen: () => Promise<void>;
};
 
const TourContext = createContext<TourContextType | null>(null);
 
export const useTour = (): TourContextType => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
};
 
export const TourProvider: React.FC<{
  children: React.ReactNode;
  autoStart?: boolean;
  scrollRef?: React.RefObject<ScrollView>;
  theme?: Partial<Theme>;
  // se quiser garantir que o tour sempre apareça ignore AsyncStorage (forceShow)
  forceShow?: boolean;
}> = ({ children, autoStart = false, scrollRef: initialScrollRef, theme: themeProp = {}, forceShow = false }) => {
  const theme = useMemo(() => ({ ...DEFAULT_THEME, ...themeProp }), [themeProp]);
 
  const [steps, setSteps] = useState<Record<string, StepMeta>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const stepRefs = useRef<Record<string, any>>({});
  const scrollRef = useRef<React.RefObject<ScrollView> | null>(initialScrollRef ?? null);
 
  // animações
  const overlayFade = useRef(new Animated.Value(0)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
 
  useEffect(() => {
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    pulseLoopRef.current.start();
    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [pulseAnim]);
 
  // registro de passos
  const registerStep = useCallback((key: string, meta: Omit<StepMeta, "layout">) => {
    setSteps((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), ...meta, key } }));
    setOrder((o) => (o.includes(key) ? o : [...o, key]));
  }, []);
 
  const updateLayout = useCallback((key: string, layout: LayoutRectangle) => {
    setSteps((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { key }), layout } }));
  }, []);
 
  const registerRef = useCallback((key: string, ref: any) => {
    stepRefs.current[key] = ref;
  }, []);
 
  const registerScrollRef = useCallback((ref: React.RefObject<ScrollView>) => {
    if (ref) scrollRef.current = ref;
  }, []);
 
  useEffect(() => {
    if (currentIndex >= order.length && order.length > 0) setCurrentIndex(0);
  }, [order, currentIndex]);
 
  // medir elemento (web/native)
  const measureStepByRef = useCallback(
    async (key: string) => {
      const ref = stepRefs.current[key];
      if (!ref) return;
      return new Promise<void>((resolve) => {
        if (Platform.OS === "web") {
          const node = ref.current ?? ref;
          // @ts-ignore
          const rect = node?.getBoundingClientRect?.();
          if (rect) {
            const { left: x, top: y, width, height } = rect;
            updateLayout(key, { x, y, width, height });
          }
          resolve();
          return;
        }
        const nodeHandle = findNodeHandle(ref.current ?? ref);
        if (!nodeHandle || !UIManager.measureInWindow) {
          resolve();
          return;
        }
        UIManager.measureInWindow(nodeHandle, (x: number, y: number, width: number, height: number) => {
          if (typeof x === "number") updateLayout(key, { x, y, width, height });
          resolve();
        });
      });
    },
    [updateLayout]
  );
 
  // garante visibilidade: rola e remede
  const ensureCurrentVisible = useCallback(
    async (idx: number) => {
      const key = order[idx];
      if (!key) return;
      await measureStepByRef(key);
      const meta = steps[key] ?? ({} as StepMeta);
      const layout = meta.layout;
      if (!layout) return;
      const sref: any = scrollRef.current?.current ?? scrollRef.current;
      if (sref && typeof sref.scrollTo === "function") {
        const offsetY = Math.max(0, layout.y - Math.round(SCREEN_HEIGHT * 0.25));
        try {
          sref.scrollTo?.({ y: offsetY, animated: true });
        } catch {
          try {
            (sref as any)?.scrollTo?.(0, offsetY);
          } catch {}
        }
        await new Promise((r) => setTimeout(r, 360));
        await measureStepByRef(key);
      }
    },
    [measureStepByRef, order, steps]
  );
 
  // start (levemente modificado para respeitar AsyncStorage)
  const startTour = useCallback(
    async (opts?: { fromIndex?: number; force?: boolean }) => {
      const fromIndex = opts?.fromIndex ?? 0;
      const force = opts?.force ?? false;
 
      // se não exigido forçar, checar se já foi visto
      if (!force && !forceShow) {
        try {
          const seen = await AsyncStorage.getItem(TOUR_SEEN_KEY);
          if (seen === "1") {
            return; // já viu -> não inicia
          }
        } catch {
          // ignorar erro de leitura, continuar
        }
      }
 
      if (order.length === 0) return;
      setCurrentIndex(Math.max(0, Math.min(fromIndex, order.length - 1)));
      setIsRunning(true);
      overlayFade.setValue(0);
      tooltipAnim.setValue(0);
      Animated.parallel([
        Animated.timing(overlayFade, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(tooltipAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    },
    [order.length, overlayFade, tooltipAnim, forceShow]
  );
 
  // marcar como visto (persiste)
  const markSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      // ignorar falha
    }
  }, []);
 
  // stop robusto
  const stopTour = useCallback(() => {
    // parar animações
    overlayFade.stopAnimation();
    tooltipAnim.stopAnimation();
    pulseLoopRef.current?.stop();
 
    // saída suave
    Animated.timing(overlayFade, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setIsRunning(false);
      setCurrentIndex(0);
      // reiniciar loop do pulso para próxima execução
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    });
  }, [overlayFade, tooltipAnim, pulseAnim]);
 
  // next/prev
  const next = useCallback(() => {
    setCurrentIndex((i) => {
      const nextIdx = i + 1;
      if (nextIdx >= order.length) {
        // finaliza e marca como visto
        markSeen().then(stopTour);
        return i;
      }
      return nextIdx;
    });
    tooltipAnim.setValue(0);
    Animated.timing(tooltipAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [order.length, stopTour, tooltipAnim, markSeen]);
 
  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    tooltipAnim.setValue(0);
    Animated.timing(tooltipAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [tooltipAnim]);
 
  // pular: marca visto e fecha imediatamente
  const skip = useCallback(() => {
    markSeen().then(() => {
      stopTour();
    });
  }, [markSeen, stopTour]);
 
  // garantir visibilidade ao trocar index
  useEffect(() => {
    if (!isRunning) return;
    let mounted = true;
    (async () => {
      await ensureCurrentVisible(currentIndex);
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [currentIndex, ensureCurrentVisible, isRunning]);
 
  // autoStart (respeita AsyncStorage/forceShow)
  useEffect(() => {
    if (!autoStart) return;
    if (!isRunning && order.length > 0) {
      const t = setTimeout(() => startTour({ fromIndex: 0, force: false }), 220);
      return () => clearTimeout(t);
    }
  }, [autoStart, order.length, isRunning, startTour]);
 
  const currentKey = order[currentIndex];
  const currentStep = currentKey ? steps[currentKey] : undefined;
 
  const computeTooltip = (layout?: LayoutRectangle) => {
    const W = Math.min(SCREEN_WIDTH - 48, 420);
    if (!layout) return { top: SCREEN_HEIGHT * 0.35, left: 24, width: W, arrowLeft: 36, arrowDown: true };
    const { x, y, width, height } = layout;
    const spaceBelow = SCREEN_HEIGHT - (y + height);
    const preferBelow = spaceBelow > 160;
    const top = preferBelow ? y + height + 14 : Math.max(14, y - 160);
    const left = Math.max(12, Math.min(x + width / 2 - W / 2, SCREEN_WIDTH - W - 12));
    const centerX = x + width / 2;
    const arrowLeft = Math.max(16, Math.min(centerX - left - 10, W - 32));
    const arrowDown = !preferBelow;
    return { top, left, width: W, arrowLeft, arrowDown };
  };
 
  const tooltip = computeTooltip(currentStep?.layout);
 
  const value = useMemo(
    () => ({
      registerStep,
      updateLayout,
      registerRef,
      startTour,
      stopTour,
      isRunning,
      currentIndex,
      totalSteps: order.length,
      registerScrollRef,
      markSeen,
    }),
    [registerStep, updateLayout, registerRef, startTour, stopTour, isRunning, currentIndex, order.length, registerScrollRef, markSeen]
  );
 
  return (
    <TourContext.Provider value={value}>
      {children}
 
      {isRunning && currentStep && (
        <Animated.View pointerEvents="auto" style={[styles.overlayContainer, { opacity: overlayFade }]}>
          <View style={[styles.dim, { backgroundColor: theme.overlayColor }]} />
 
          {currentStep.layout && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.highlight,
                {
                  left: currentStep.layout.x - 8,
                  top: currentStep.layout.y - 8,
                  width: currentStep.layout.width + 16,
                  height: currentStep.layout.height + 16,
                  borderColor: theme.highlightColor,
                  transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }],
                },
              ]}
            />
          )}
 
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.tooltipCard,
              {
                top: tooltip.top,
                left: tooltip.left,
                maxWidth: tooltip.width,
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                transform: [
                  { translateY: tooltipAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
                  { scale: tooltipAnim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
                ],
                opacity: tooltipAnim,
              },
            ]}
          >
            <Text style={[styles.tooltipTitle, { color: theme.textPrimary }]}>{currentStep?.title}</Text>
            {currentStep?.description ? <Text style={[styles.tooltipBody, { color: theme.textSecondary }]}>{currentStep.description}</Text> : null}
 
            <View style={styles.progressRow}>
              <View style={styles.progressLabel}>
                <Text style={[styles.progressTxt, { color: theme.textSecondary }]}>{currentIndex + 1}/{order.length}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(((currentIndex + 1) / Math.max(1, order.length)) * 100)}%`, backgroundColor: theme.primary }]} />
              </View>
            </View>
 
            <View style={styles.controlsRow}>
              <TouchableOpacity onPress={prev} disabled={currentIndex === 0} style={[styles.ghostBtn, currentIndex === 0 && styles.ghostDisabled]}>
                <Text style={[styles.ghostTxt, currentIndex === 0 && styles.ghostTxtDisabled]}>Anterior</Text>
              </TouchableOpacity>
 
              <View style={{ flex: 1 }} />
 
              <TouchableOpacity
                onPress={() => {
                  if (currentIndex + 1 >= order.length) {
                    markSeen().then(stopTour);
                  } else next();
                }}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.primaryTxt}>{currentIndex + 1 === order.length ? "Concluir" : "Próximo"}</Text>
              </TouchableOpacity>
            </View>
 
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <TouchableOpacity onPress={skip}>
                <Text style={[styles.skipTxt, { color: theme.textSecondary }]}>Pular</Text>
              </TouchableOpacity>
 
              <TouchableOpacity onPress={async () => { await markSeen(); stopTour(); }}>
                <Text style={[styles.closeTxt, { color: theme.textSecondary }]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </TourContext.Provider>
  );
};
 
/* ----------------- TourStep ----------------- */
export const TourStep: React.FC<
  React.PropsWithChildren<{
    stepKey: string;
    title: string;
    description?: string;
  }>
> = ({ children, stepKey, title, description }) => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("TourStep must be used inside TourProvider");
 
  useEffect(() => {
    ctx.registerStep(stepKey, { key: stepKey, title, description });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, title, description]);
 
  const ref = useRef<any>(null);
 
  useEffect(() => {
    ctx.registerRef(stepKey, ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const measure = () => {
    if (Platform.OS === "web") {
      const node = ref.current ?? ref;
      // @ts-ignore
      const rect = node?.getBoundingClientRect?.();
      if (rect) {
        const { left: x, top: y, width, height } = rect;
        ctx.updateLayout(stepKey, { x, y, width, height });
      }
      return;
    }
    const nodeHandle = findNodeHandle(ref.current ?? ref);
    if (!nodeHandle || !UIManager.measureInWindow) return;
    UIManager.measureInWindow(nodeHandle, (x: number, y: number, width: number, height: number) => {
      if (typeof x === "number") ctx.updateLayout(stepKey, { x, y, width, height });
    });
  };
 
  useEffect(() => {
    const t = setTimeout(measure, 60);
    if (Platform.OS === "web") {
      const onResize = () => setTimeout(measure, 80);
      window.addEventListener("resize", onResize);
      return () => {
        clearTimeout(t);
        window.removeEventListener("resize", onResize);
      };
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  return (
    <View ref={ref} onLayout={measure} collapsable={false}>
      {children}
    </View>
  );
};
 
/* ----------------- StartTourButton (exportável, use se precisar) ----------------- */
export const StartTourButton: React.FC<{ style?: any; label?: string }> = ({ style, label = "Iniciar Tour" }) => {
  const ctx = useTour();
  return (
    <TouchableOpacity onPress={() => ctx.startTour?.({ force: true })} style={[styles.floatingStart, style]}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  overlayContainer: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, zIndex: 99999 },
  dim: { ...StyleSheet.absoluteFillObject },
  highlight: { position: "absolute", borderRadius: 12, borderWidth: 2.8, backgroundColor: "rgba(255,255,255,0.02)", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 20 },
  tooltipCard: { position: "absolute", padding: 16, borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 16, borderWidth: 1 },
  tooltipTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  tooltipBody: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  progressLabel: { marginRight: 10 },
  progressTxt: { fontSize: 12 },
  progressTrack: { flex: 1, height: 6, backgroundColor: "rgba(15,20,30,0.06)", borderRadius: 6, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 6 },
  controlsRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ghostBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  ghostTxt: { color: "#4b5563", fontWeight: "700" },
  ghostDisabled: { opacity: 0.38 },
  ghostTxtDisabled: { color: "#9aa0a6" },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryTxt: { color: "#fff", fontWeight: "800" },
  closeRow: { marginTop: 10, alignSelf: "flex-end" },
  closeTxt: { fontSize: 13 },
  skipTxt: { fontSize: 13, fontWeight: "700" },
  floatingStart: { position: "absolute", right: 18, bottom: 28, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, elevation: 10, zIndex: 99999, backgroundColor: "#2e86de" },
});
 
export { DEFAULT_THEME };
