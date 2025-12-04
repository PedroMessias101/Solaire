/* eslint-disable no-alert */

import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import ChatBot from "../components/ChatBot";
import GraficoBarras from "../components/grafico-barras";
import Notificacoes from "../components/notific";

// ====================================================================
// CONSTANTES E CORES DE TEMA
// ====================================================================

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_SIMULACAO_URL = "https://placa-api-eaho.onrender.com";
const THEME_STORAGE_KEY = "userThemePreference";

const CORES_TEMA = {
  primary: "#FFC125", // Amarelo Dourado
  backgroundLight: "#f5f5f5",
  backgroundDark: "#1f2937",
  cardLight: "#ffffff",
  cardDark: "#374151",
  textPrimaryLight: "#000",
  textPrimaryDark: "#f9fafc",
  textSecondaryLight: "#666",
  textSecondaryDark: "#bbbbbb",
  shadow: "#000000",
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
    tela: {
      flex: 1,
      backgroundColor: theme,
      paddingHorizontal: 16,
      paddingTop: 40,
    },
    loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: theme,
    },
    loadingText: {
      marginTop: 20,
      fontSize: 18,
      fontWeight: "600",
      color: textPrimary,
    },
    loadingDica: {
      marginTop: 8,
      fontSize: 14,
      color: textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    username: { fontWeight: "700", color: textPrimary },
    email: { fontSize: 12, color: textSecondary, marginTop: 2 },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 12,
      borderWidth: 2,
      borderColor: CORES_TEMA.primary,
    },
    settingsButton: { marginLeft: 12, justifyContent: "center", alignItems: "center" },

    themeToggle: {
      padding: 8,
      marginRight: 5,
      borderRadius: 10,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: isDark ? CORES_TEMA.cardDark : '#ccc',
    },

    cardPrincipal: { borderRadius: 20, padding: 24, marginBottom: 20 },
    cardTitulo: { fontSize: 16, color: "#fff", marginBottom: 6 },
    cardValor: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    cardLegenda: { fontSize: 14, color: "#fff", marginTop: 4 },

    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: {
      backgroundColor: cardBg,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      width: "47%",
      alignItems: "center",
      shadowColor: shadowColor,
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardVvalor: { fontSize: 22, fontWeight: "bold", color: textPrimary },
    cardLabel: { fontSize: 14, color: textSecondary, marginTop: 8, fontWeight: "500" },

    errorBox: { backgroundColor: "#ffece6", padding: 12, borderRadius: 10, marginBottom: 12 },
    errorText: { color: "#b00020", marginBottom: 8 },
    retryBtn: { alignSelf: "flex-start", backgroundColor: "#000", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    retryText: { color: "#FFC125" },
  });
};

// ====================================================================
// COMPONENTE PRINCIPAL HOMESCREEN
// ====================================================================

export default function HomeScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();

  // --- Estados e Lógica de Tema ---
  const [user, setUser] = useState<any>(null);
  const [placas, setPlacas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(null);
  const [loadingDicaIndex, setLoadingDicaIndex] = useState(0);



  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/auth/login");
  };

  const VALOR_KWH = 0.95;
  const CO2_KWH = 0.084;
  const dicas = [
    "Usar energia solar pode reduzir até 1,5 tonelada de CO₂ por ano — o equivalente a plantar 40 árvores",
    "Painéis solares podem cortar até 95% da sua conta de luz",
    "A energia solar é silenciosa, renovável e não poluente",
    "Use lâmpadas de LED, consomem até 80% menos.",
  ];

  // --- Animação do Sol (mantida) ---
  const spinValue = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  // --- Cálculo do Tema Atual e Estilos Dinâmicos ---
  const currentColorScheme: 'light' | 'dark' = useMemo(() => {
    return themeOverride || systemColorScheme || 'light';
  }, [themeOverride, systemColorScheme]);

  const estilos = useMemo(() => getDynamicStyles(currentColorScheme), [currentColorScheme]);

  // Cor dinâmica para os ícones do Header
  const headerIconColor = currentColorScheme === 'dark' ? CORES_TEMA.textPrimaryDark : CORES_TEMA.textPrimaryLight;

  // --- Função de Toggle do Tema ---
  const toggleTheme = async () => {
    const newTheme = currentColorScheme === 'light' ? 'dark' : 'light';
    setThemeOverride(newTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // --- Checar Token e Carregar Preferência de Tema ---
  useEffect(() => {
    const checkTokenAndLoadTheme = async () => {
      // 1. Token
      const storedToken = await AsyncStorage.getItem("userToken");
      if (!storedToken) {
        router.replace("/auth/login");
        return;
      }
      setToken(storedToken);
      setTokenChecked(true);

      // 2. Tema
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeOverride(storedTheme);
      }
    };
    checkTokenAndLoadTheme();
  }, []);

  // --- Buscar Dados ---
  useEffect(() => {
    if (tokenChecked && token) {
      fetchUserAndPanels();
    }
  }, [tokenChecked, token]);

  // ====================== FUNÇÕES DE API E CÁLCULOS (Mantidas) ======================
  const fetchUserAndPanels = async () => {
    setLoading(true);
    setError(null);

    try {
      // ========================================================================
      // 1) Buscar usuário logado
      // ========================================================================
      const resUser = await fetch(`${API_USUARIO_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resUser.status === 401) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        await AsyncStorage.clear();
        router.replace("/auth/login");
        return;
      }

      const userResponse = await resUser.json();
      if (userResponse.success) setUser(userResponse.data);
      else setError(userResponse.error || "Erro ao carregar usuário");

      // ========================================================================
      // 2) Buscar placas salvas no backend
      // ========================================================================
      const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const placasResponse = await resPlacas.json();
      if (!placasResponse.success) {
        setError(placasResponse.error || "Erro ao carregar placas");
        return;
      }

      const placasDoUsuario = placasResponse.data || [];

      // ========================================================================
      // 3) Para cada placa, buscar dados da simulação pela API externa
      // ========================================================================
      const placasComDados = await Promise.all(
        placasDoUsuario.map(async (placa) => {
          // Se não tiver serial, evitar erro
          if (!placa.serial) {
            return {
              ...placa,
              energia_kWh: 0,
              tensao: 0,
              corrente: 0,
              temperatura: 0,
            };
          }

          try {
            const resSim = await fetch(`${API_SIMULACAO_URL}/${placa.serial}`);
            const sim = await resSim.json();

            return {
              ...placa,
              energia_kWh: sim.energia_kWh || 0,
              tensao: sim.tensao || 0,
              corrente: sim.corrente || 0,
              temperatura: sim.temperatura || 0,
            };
          } catch (err) {
            console.log("❌ Erro ao buscar simulação da placa:", placa.serial, err);
            return {
              ...placa,
              energia_kWh: 0,
              tensao: 0,
              corrente: 0,
              temperatura: 0,
            };
          }
        })
      );
      setPlacas(placasComDados);

    } catch (err) {
      console.error("Erro geral:", err);
      setError("Erro inesperado ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDicaIndex((prev) => (prev + 1) % dicas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const calcularTotais = () => {
    const totalEnergia = placas.filter((p) => p.status === "Ativa").reduce((acc, p) => acc + (p.energia_kWh || 0), 0);
    const eficiencia = placas.length > 0 ? (placas.filter((p) => p.status === "Ativa").length / placas.length) * 100 : 0;
    const mediaTemperatura = placas.length > 0 ? placas.reduce((acc, p) => acc + (p.temperatura || 0), 0) / placas.length : 0;
    const mediaTensao = placas.length > 0 ? placas.reduce((acc, p) => acc + (p.tensao || 0), 0) / placas.length : 0;
    const mediaCorrente = placas.length > 0 ? placas.reduce((acc, p) => acc + (p.corrente || 0), 0) / placas.length : 0;
    return { totalEnergia, eficiencia, mediaTemperatura, mediaTensao, mediaCorrente };
  };

  const { totalEnergia, eficiencia, mediaTemperatura, mediaTensao, mediaCorrente } = calcularTotais();

  // --- Renderização: Loading ---
  if (!tokenChecked || loading) {
    return (
      <View style={estilos.loading}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={30}
            color={CORES_TEMA.primary} // CORRIGIDO: Acessando a cor diretamente
          />
        </Animated.View>
        <Text style={estilos.loadingText}>Você sabia?</Text>
        <Text style={estilos.loadingDica}>{dicas[loadingDicaIndex]}</Text>
      </View>
    );
  }

  // --- Renderização: Erro ---
  if (error) {
    return (
      <View style={estilos.loading}>
        <Feather name="alert-triangle" size={30} color="#D9534F" />
        <Text style={estilos.loadingText}>Ocorreu um erro</Text>
        <Text style={estilos.loadingDica}>{error}</Text>
        <TouchableOpacity onPress={fetchUserAndPanels} style={estilos.retryBtn}>
          <Text style={estilos.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Renderização: Principal ---
  return (
    <View style={{ flex: 1, backgroundColor: estilos.tela.backgroundColor }}>
      <ScrollView style={estilos.tela} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={estilos.header}>
          <Image source={require("../../assets/logo_residencial.png")} style={estilos.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.username}>{user?.name || "Bem-vindo!"}</Text>
            {user?.email && <Text style={estilos.email}>{user.email}</Text>}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>

            {/* BOTÃO DE TEMA SOL/LUA */}
            <TouchableOpacity onPress={toggleTheme} style={estilos.themeToggle}>
              {currentColorScheme === 'dark' ? (
                <Ionicons name="moon" size={24} color={headerIconColor} />
              ) : (
                <Ionicons name="sunny-sharp" size={24} color={CORES_TEMA.primary} />
              )}
            </TouchableOpacity>

            {/* NOTIFICAÇÕES (Ajustar se não aceitar prop 'color') */}
            <Notificacoes color={headerIconColor} />

            <TouchableOpacity
              style={estilos.settingsButton}
              onPress={() => router.push("../tabs/config")}
            >
              <Feather name="settings" size={25} color={headerIconColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
            <Feather name="log-out" size={24} color={estilos.username.color} />
          </TouchableOpacity>
        </View>

        {/* Card Principal: Gradient dinâmico */}
        <LinearGradient
          colors={currentColorScheme === 'dark' ? ["#1f2937", "#374151"] : ["#000", "#FFC125"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={estilos.cardPrincipal}
        >
          <Text style={estilos.cardTitulo}>Visão Geral</Text>
          <Text style={estilos.cardValor}>{totalEnergia.toFixed(2)} kWh</Text>
          <Text style={estilos.cardLegenda}>Geração Atual</Text>
        </LinearGradient>

        <GraficoBarras placas={placas} />

        {/* Grid de Métricas */}
        <View style={estilos.grid}>
          {/* Temperatura */}
          <View style={estilos.card}>
            <Feather name="thermometer" size={28} color={CORES_TEMA.primary} />
            <Text style={estilos.cardLabel}>Temperatura</Text>
            <Text style={estilos.cardVvalor}>{mediaTemperatura.toFixed(1)}°C</Text>
          </View>
          {/* Tensão */}
          <View style={estilos.card}>
            <MaterialCommunityIcons name="flash" size={28} color={CORES_TEMA.primary} />
            <Text style={estilos.cardLabel}>Tensão</Text>
            <Text style={estilos.cardVvalor}>{mediaTensao.toFixed(1)}V</Text>
          </View>
          {/* Corrente */}
          <View style={estilos.card}>
            <MaterialCommunityIcons name="current-ac" size={28} color={CORES_TEMA.primary} />
            <Text style={estilos.cardLabel}>Corrente</Text>
            <Text style={estilos.cardVvalor}>{mediaCorrente.toFixed(1)}A</Text>
          </View>
          {/* Eficiência */}
          <View style={estilos.card}>
            <MaterialCommunityIcons name="percent" size={28} color={CORES_TEMA.primary} />
            <Text style={estilos.cardLabel}>Eficiência</Text>
            <Text style={estilos.cardVvalor}>{eficiencia.toFixed(0)}%</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ position: "absolute", bottom: 80, right: 0 }}>
        <ChatBot />
      </View>
      <AnimatedBottomNavBar placas={placas} setPlacas={setPlacas} />
    </View>
  );
}