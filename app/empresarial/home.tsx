import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  useColorScheme,
  ActivityIndicator,
  Platform, // Importar Platform para hacks de ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// Componentes (Mantenha este caminho consistente com seu projeto)
import { NavBarEmpresarial } from "../components/NavBarEmpresarial"; 
import Notificacoes from "../components/notific";
import WeatherCard from "../components/Clima";
// TourProvider/TourStep (Assumindo que estão neste caminho)
import { TourProvider, TourStep, useTour } from "../components/TourGuide"; 

// ====================================================================
// TIPOS DE DADOS E CONSTANTES
// ====================================================================

interface UserData {
  name: string;
  email: string;
}

interface PlacaData {
  id: string;
  serial: string;
  status: "Ativa" | "Inativa" | string;
  energia_kWh: number;
  tensao: number;
  corrente: number;
  temperatura: number;
}

interface TotaisData {
  totalEnergia: number;
  mediaTensao: number;
  mediaCorrente: number;
  mediaTemperatura: number;
}

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_SIMULACAO_URL = "https://placa-api-eaho.onrender.com";
const THEME_STORAGE_KEY = "userThemePreference";
const TOUR_STORAGE_KEY = "tourSeen";

// Cores base para o tema
const CORES_TEMA = {
  primary: "#FFC125", // Amarelo (Destaque)
  secondary: "#2e86de", // Azul (Ações)
  backgroundLight: "#f9fafc",
  backgroundDark: "#1f2937",
  cardLight: "#ffffff",
  cardDark: "#374151",
  textPrimaryLight: "#111111",
  textPrimaryDark: "#f9fafc",
  textSecondaryLight: "#666666",
  textSecondaryDark: "#bbbbbb",
  shadow: "#000000",
};

// ====================================================================
// FUNÇÕES AUXILIARES (Lógica de Cálculo)
// ====================================================================

const calcularTotais = (placas: PlacaData[]): TotaisData => {
  const ativos = placas.filter((p) => p.status === "Ativa");

  const totalEnergia: number = ativos.reduce((a, p) => a + Number(p.energia_kWh || 0), 0);
  const somaTensao: number = ativos.reduce((a, p) => a + Number(p.tensao || 0), 0);
  const somaCorrente: number = ativos.reduce((a, p) => a + Number(p.corrente || 0), 0);
  const somaTemperatura: number = ativos.reduce((a, p) => a + Number(p.temperatura || 0), 0);

  const count = ativos.length;

  return {
    totalEnergia,
    mediaTensao: count > 0 ? somaTensao / count : 0,
    mediaCorrente: count > 0 ? somaCorrente / count : 0,
    mediaTemperatura: count > 0 ? somaTemperatura / count : 0,
  };
};

// ====================================================================
// FUNÇÃO DE ESTILOS DINÂMICOS
// ====================================================================

const getDynamicStyles = (currentScheme: 'light' | 'dark') => {
  const isDark = currentScheme === 'dark';
  const theme = isDark ? CORES_TEMA.backgroundDark : CORES_TEMA.backgroundLight;
  const cardBg = isDark ? CORES_TEMA.cardDark : CORES_TEMA.cardLight;
  const textPrimary = isDark ? CORES_TEMA.textPrimaryDark : CORES_TEMA.textPrimaryLight;
  const textSecondary = isDark ? CORES_TEMA.textSecondaryDark : CORES_TEMA.textSecondaryLight;
  const shadowColor = CORES_TEMA.shadow;

  return StyleSheet.create({
    container: { flex: 1, padding: 16, marginTop: 40, backgroundColor: theme },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme },
    errorText: { marginTop: 15, color: '#D9534F', fontSize: 16, textAlign: 'center' },
    retryButton: { marginTop: 20, backgroundColor: CORES_TEMA.secondary, padding: 10, borderRadius: 8 },
    retryButtonText: { color: CORES_TEMA.textPrimaryDark, fontWeight: 'bold' },

    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cardBg,
      padding: 14,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: shadowColor,
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 2, borderColor: CORES_TEMA.primary },
    username: { fontSize: 20, fontWeight: "700", color: textPrimary },
    email: { fontSize: 14, color: textSecondary, marginTop: 2 },
    
    themeToggle: { padding: 8, marginRight: 5, backgroundColor: cardBg, borderRadius: 10 },

    titulo: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: textPrimary },
    subtitulo: { marginTop: 25, fontSize: 18, fontWeight: "700", marginBottom: 12, color: textPrimary },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    gridItem: { flexBasis: "48%", marginBottom: 16, minHeight: 120, height: 120 },
    card: {
      flex: 1, backgroundColor: cardBg, borderRadius: 18, padding: 18, marginBottom: 16,
      shadowColor: shadowColor, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 5, elevation: 3,
      alignItems: "center", justifyContent: "center", minHeight: 120, height: 120,
    },
    cardLabel: { fontSize: 15, color: textSecondary, marginTop: 8, textAlign: "center" },
    cardValor: { fontSize: 20, fontWeight: "bold", color: textPrimary, marginTop: 6, textAlign: "center" },

    acoesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    botao: {
      flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12,
      shadowColor: shadowColor, shadowOpacity: isDark ? 0.2 : 0.08, shadowRadius: 4, elevation: 3,
      backgroundColor: cardBg, marginBottom: 12, marginRight: 12,
    },
    botaoTexto: { fontSize: 16, color: textPrimary, fontWeight: "600", marginLeft: 8 },
  });
};

// ====================================================================
// COMPONENTE FILHO: EMPRESARIAL CONTENT (Onde o useTour é chamado)
// ====================================================================

const EmpresarialContent = () => {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  
  // HOOK DE CONTEXTO DO TOUR (Deve estar dentro do provedor)
  const { startTour, registerScrollRef } = useTour();

  // --- Estados do Componente ---
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [placas, setPlacas] = useState<PlacaData[]>([]);
  const [tokenChecked, setTokenChecked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- Tema e Tour ---
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(null);
  const [tourSeen, setTourSeen] = useState<boolean | null>(null);
  const [forceStartTour, setForceStartTour] = useState<boolean>(false);

  // REFERÊNCIA DO SCROLLVIEW
  const scrollRef = useRef<ScrollView | null>(null);

  // --- Lógica da Animação do Sol ---
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  
  // --- CÁLCULO DO TEMA ATUAL ---
  const currentColorScheme: 'light' | 'dark' = useMemo(() => {
    return themeOverride || systemColorScheme || 'light';
  }, [themeOverride, systemColorScheme]);

  // --- ESTILOS DINÂMICOS (Otimizados) ---
  const estilos = useMemo(() => getDynamicStyles(currentColorScheme), [currentColorScheme]);

  // --- 1. AUTENTICAÇÃO, TEMA e TOUR (Ao carregar) ---
  useEffect(() => {
    const loadInitialData = async () => {
      // Token
      const storedToken = await AsyncStorage.getItem("userToken");
      if (!storedToken) {
        router.replace("/auth/login");
        return;
      }
      setToken(storedToken);
      setTokenChecked(true);

      // Preferência de Tema
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeOverride(storedTheme);
      }
      
      // Tour
      const flag = await AsyncStorage.getItem(TOUR_STORAGE_KEY);
      setTourSeen(flag === "true");
    };
    loadInitialData();
  }, [router]);

  // --- 2. FETCH DE DADOS (Restaurado com lógica de placas) ---
  const fetchUserAndPanels = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Busca Dados do Usuário
      const resUser = await fetch(`${API_USUARIO_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resUser.status === 401) {
        await AsyncStorage.removeItem("userToken");
        router.replace("/auth/login");
        return;
      }

      const userResponse = await resUser.json();
      if (userResponse.success) setUser(userResponse.data as UserData);

      // 2. Busca Dados das Placas
      const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const placasResponse = await resPlacas.json();
      const placasDoUsuario: any[] = placasResponse.data || [];

      // 3. Agrega Dados de Simulação
      const placasCompletas: PlacaData[] = await Promise.all(
        placasDoUsuario.map(async (placa: any) => {
          if (placa.status !== "Ativa") {
            return {
              ...placa,
              energia_kWh: 0,
              tensao: 0,
              corrente: 0,
              temperatura: 0,
            } as PlacaData;
          }

          try {
            const resSim = await fetch(`${API_SIMULACAO_URL}/${placa.serial}`);
            if (!resSim.ok) throw new Error("Falha na API de Simulação");
            
            const sim = await resSim.json();
            return {
              ...placa,
              energia_kWh: sim.energia_kWh || 0,
              tensao: sim.tensao || 0,
              corrente: sim.corrente || 0,
              temperatura: sim.temperatura || 0,
            } as PlacaData;
          } catch (e) {
            console.warn("Erro simulacao para placa:", placa.serial, e);
            return {
              ...placa,
              energia_kWh: 0,
              tensao: 0,
              corrente: 0,
              temperatura: 0,
            } as PlacaData;
          }
        })
      );

      setPlacas(placasCompletas);
    } catch (err) {
      console.error("Erro geral ao buscar dados:", err);
      setError("Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [token, router]);
  
  // Efeito para chamar a busca de dados
  useEffect(() => {
    if (tokenChecked && token) fetchUserAndPanels();
  }, [tokenChecked, token, fetchUserAndPanels]);

  // --- 3. LÓGICA DE CÁLCULO (Otimizada com useMemo) ---
  const { totalEnergia, mediaTensao, mediaCorrente, mediaTemperatura } = useMemo(
    () => calcularTotais(placas),
    [placas]
  );
  
  // --- 4. AÇÕES DE TEMA, TOUR e LOGOUT ---
  const toggleTheme = async () => {
      const newTheme = currentColorScheme === 'light' ? 'dark' : 'light';
      setThemeOverride(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/auth/login");
  };

  const iniciarTourManualmente = async () => {
    await AsyncStorage.removeItem(TOUR_STORAGE_KEY);
    setTourSeen(false);
    setForceStartTour(true);
    // Inicia o tour
    if (startTour) {
      setTimeout(() => startTour({ force: true }), 100); 
    }
  };

  // ====================================================================
  // FUNÇÕES DE REGISTRO DO SCROLLVIEW PARA CORREÇÃO DE TREMOR
  // ====================================================================

  const handleScrollLayout = useCallback(() => {
    // Registra a referência do ScrollView para que o Tour possa rastrear a rolagem
    if (scrollRef.current) {
      registerScrollRef(scrollRef);
    }
  }, [registerScrollRef]);

  // ====================================================================
  // RENDERIZAÇÃO CONDICIONAL
  // ====================================================================

  // 1. Loading
  if (tourSeen === null || !tokenChecked || loading) {
    return (
      <View style={estilos.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="white-balance-sunny" size={35} color={CORES_TEMA.primary} />
        </Animated.View>
        <ActivityIndicator size="large" color={CORES_TEMA.secondary} style={{ marginTop: 15 }} />
        <Text style={{ marginTop: 10, color: estilos.username.color, fontSize: 16 }}>
          Carregando dados empresariais...
        </Text>
      </View>
    );
  }
  
  // 2. Erro
  if (error) {
      return (
          <View style={estilos.loadingContainer}>
              <Feather name="alert-triangle" size={30} color="#D9534F" />
              <Text style={estilos.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchUserAndPanels} style={estilos.retryButton}>
                  <Text style={estilos.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
          </View>
      );
  }

  // 3. Conteúdo Principal
  return (
      <View style={{ flex: 1, backgroundColor: estilos.container.backgroundColor }}>
        <ScrollView
          ref={scrollRef}
          onLayout={handleScrollLayout} // Usa a função otimizada de registro
          style={estilos.container}
          // Adiciona o 'scrollEventThrottle' para melhor rastreamento da rolagem (Android/iOS)
          scrollEventThrottle={Platform.select({ ios: 1, android: 16 })}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* HEADER */}
          <View style={estilos.header}>
            {/* TOUR STEP 1: PERFIL */}
            <TourStep 
                stepKey="perfil" 
                title="Identificação do Gestor" 
                description={`Bem-vindo(a), ${user?.name ?? 'Gestor'}. Aqui você pode acessar configurações do perfil e dados contratuais.`}
            >
              <TouchableOpacity onPress={() => {}}>
                <Feather name="user" size={30} color={CORES_TEMA.primary} style={estilos.avatar} />
              </TouchableOpacity>
            </TourStep>

            <View style={{ flex: 1 }}>
              <Text style={estilos.username}>{user?.name ?? "Usuário"}</Text>
              <Text style={estilos.email}>{user?.email ?? "Painel Empresarial"}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              
              {/* TOUR STEP 2: TEMA */}
              <TourStep
                stepKey="tema"
                title="Modo Claro/Escuro"
                description="Alterne rapidamente para o modo escuro para reduzir o esforço visual em ambientes de pouca luz."
              >
                <TouchableOpacity onPress={toggleTheme} style={estilos.themeToggle}>
                  {currentColorScheme === 'dark' ? (
                    <Ionicons name="moon" size={24} color={estilos.username.color} />
                  ) : (
                    <Ionicons name="sunny-sharp" size={24} color={CORES_TEMA.primary} />
                  )}
                </TouchableOpacity>
              </TourStep>
              
              {/* TOUR STEP 3: NOTIFICAÇÕES */}
              <TourStep
                stepKey="notificacoes"
                title="Alertas do Sistema"
                description="Verifique esta seção para alertas críticos sobre a performance, manutenção ou segurança do seu sistema."
              >
                  <Notificacoes />
              </TourStep>
              
              <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
                <Feather name="log-out" size={24} color={estilos.username.color} /> 
              </TouchableOpacity>
            </View>
          </View>

          {/* DASHBOARD - MÉTRICAS PRINCIPAIS */}
          <Text style={estilos.titulo}>Métricas Operacionais</Text>

          <View style={estilos.grid}>
            {/* TOUR STEP 4: ENERGIA TOTAL */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="energia-total" title="Produção Total (kWh)" description="A métrica mais importante: total de energia gerada por todos os painéis ativos no período." position="bottom">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="solar-power" size={28} color={CORES_TEMA.primary} />
                  <Text style={estilos.cardLabel}>Energia Total</Text>
                  <Text style={estilos.cardValor}>{totalEnergia.toFixed(2)} kWh</Text>
                </View>
              </TourStep>
            </View>

            {/* TOUR STEP 5: TENSÃO MÉDIA */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="tensao-media" title="Tensão Média (V)" description="Tensão elétrica média medida. Mantenha esta métrica dentro dos limites operacionais seguros." position="bottom">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="flash" size={28} color={CORES_TEMA.primary} />
                  <Text style={estilos.cardLabel}>Tensão Média</Text>
                  <Text style={estilos.cardValor}>{mediaTensao.toFixed(1)} V</Text>
                </View>
              </TourStep>
            </View>

            {/* TOUR STEP 6: CORRENTE MÉDIA (Posição Top para estabilidade) */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="corrente-media" title="Corrente Média (A)" description="Fluxo de corrente elétrica. Quedas aqui podem indicar problemas de conexão ou sombreamento." position="top">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="current-ac" size={28} color={CORES_TEMA.primary} />
                  <Text style={estilos.cardLabel}>Corrente Média</Text>
                  <Text style={estilos.cardValor}>{mediaCorrente.toFixed(1)} A</Text>
                </View>
              </TourStep>
            </View>

            {/* TOUR STEP 7: TEMPERATURA MÉDIA (Posição Top para estabilidade) */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="temperatura-media" title="Temperatura Média (°C)" description="O calor afeta a eficiência. Monitore esta média para evitar superaquecimento dos painéis." position="top">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="thermometer" size={28} color={CORES_TEMA.primary} />
                  <Text style={estilos.cardLabel}>Temperatura Média</Text>
                  <Text style={estilos.cardValor}>{mediaTemperatura.toFixed(1)} °C</Text>
                </View>
              </TourStep>
            </View>
          </View>

          {/* CARD DE CLIMA */}
          <WeatherCard />

          {/* AÇÕES RÁPIDAS */}
          <Text style={estilos.subtitulo}>Ações Rápidas</Text>

          <View style={estilos.acoesContainer}>
            {/* TOUR STEP 8: SIMULADOR */}
            <TourStep stepKey="acao-simulador" title="Simulação de Cenários" description="Use esta ferramenta para planejar a expansão da sua instalação ou simular o retorno de investimento (ROI)." position="bottom">
              <TouchableOpacity
                style={estilos.botao}
                onPress={() => router.push("/empresarial/simulador")}
              >
                <Feather name="server" size={22} color={CORES_TEMA.primary} />
                <Text style={estilos.botaoTexto}>Simulador</Text>
              </TouchableOpacity>
            </TourStep>

            {/* TOUR STEP 9: AGENDAMENTO */}
            <TourStep stepKey="acao-agendamento" title="Agendar Manutenção" description="Acesse a agenda para marcar visitas técnicas, manutenções preventivas ou inspeções de segurança." position="bottom">
              <TouchableOpacity
                style={estilos.botao}
                onPress={() => router.push("/empresarial/agendamento")}
              >
                <Feather name="calendar" size={22} color={CORES_TEMA.primary} />
                <Text style={estilos.botaoTexto}>Agendamento</Text>
              </TouchableOpacity>
            </TourStep>

            <TouchableOpacity
              style={estilos.botao}
              onPress={() => router.push("/empresarial/configuracao")}
            >
              <Feather name="settings" size={22} color={CORES_TEMA.primary} />
              <Text style={estilos.botaoTexto}>Configurações</Text>
            </TouchableOpacity>

            {/* TOUR STEP 10: VER TOUR (Manual) */}
            <TourStep stepKey="ver-tour" title="Revisitar Guia" description="Clique aqui a qualquer momento para refazer este Tour de introdução." position="bottom">
              <TouchableOpacity
                style={estilos.botao}
                onPress={iniciarTourManualmente}
              >
                <Feather name="help-circle" size={22} color={CORES_TEMA.secondary} />
                <Text style={estilos.botaoTexto}>Ver Tour</Text>
              </TouchableOpacity>
            </TourStep>
          </View>
        </ScrollView>

        <NavBarEmpresarial placas={placas} setPlacas={setPlacas} />
      </View>
  );
}


// ====================================================================
// COMPONENTE PAI: HOMEEMPRESARIAL (Envolve o conteúdo com o TourProvider)
// ====================================================================

export default function HomeEmpresarial() {
    const [tourSeen, setTourSeen] = useState(false);
    
    // Efeito para carregar o estado do tour
    useEffect(() => {
      const loadTourStatus = async () => {
        const flag = await AsyncStorage.getItem(TOUR_STORAGE_KEY);
        setTourSeen(flag === "true");
      };
      loadTourStatus();
    }, []);

    return (
        <TourProvider
            autoStart={!tourSeen} // Inicia se não foi visto
            onStop={() => { 
                AsyncStorage.setItem(TOUR_STORAGE_KEY, "true"); 
                setTourSeen(true); 
            }} // Marca como visto
            theme={{ primary: CORES_TEMA.secondary, highlightColor: CORES_TEMA.primary }}
        > 
            {/* O conteúdo da tela com o useTour() é renderizado AQUI */}
            <EmpresarialContent />
        </TourProvider>
    );
}