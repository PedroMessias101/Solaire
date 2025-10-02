import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import { useRouter } from "expo-router";
import GraficoBarras from "../components/grafico-barras";
import ChatBot from "../components/ChatBot";

const API_USUARIO_URL = "https://solaire-back-oficial.onrender.com";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [placas, setPlacas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const VALOR_KWH = 0.95; // preço médio R$/kWh (ajuste se quiser)
  const CO2_KWH = 0.084; // kg CO2 evitado por kWh

  const dicas = [
    "Usar energia solar pode reduzir até 1,5 tonelada de CO₂ por ano — o equivalente a plantar 40 árvores",
    "Painéis solares podem cortar até 95% da sua conta de luz",
    "A energia solar é silenciosa, renovável e não poluente",
    "Use lâmpadas de LED, consomem até 80% menos.",
  ];

  const [loadingDicaIndex, setLoadingDicaIndex] = useState(0);

  // animação do sol
  const spinValue = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const fetchUserAndPanels = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      // dados do usuário
      const resUser = await fetch(`${API_USUARIO_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await resUser.json();
      setUser(userData);

      // dados das placas
      const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataPlacas = await resPlacas.json();
      setPlacas(dataPlacas.data || []);
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndPanels();
    const interval = setInterval(() => {
      setLoadingDicaIndex((prev) => (prev + 1) % dicas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calcularTotais = () => {
    const totalEnergia = placas
      .filter((p) => p.status === "Ativa")
      .reduce((acc, p) => acc + (p.energia_kWh || 0), 0);

    const eficiencia =
      placas.length > 0
        ? (placas.filter((p) => p.status === "Ativa").length / placas.length) * 100
        : 0;

    const economia = totalEnergia * VALOR_KWH;
    const co2 = totalEnergia * CO2_KWH;

    return { totalEnergia, eficiencia, economia, co2 };
  };


  if (loading) {
    return (
      <View style={estilos.loading}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="white-balance-sunny" size={30} color="#FFc125" />
        </Animated.View>
        <Text style={estilos.loadingText}>Você sabia?</Text>
        <Text style={estilos.loadingDica}>{dicas[loadingDicaIndex]}</Text>
      </View>
    );
  }

  const { totalEnergia, eficiencia } = calcularTotais();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.tela} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={estilos.header}>
          <Image
            source={{
              uri: user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={estilos.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={estilos.saudacao}>
              Olá, <Text style={estilos.username}>{user?.name || "Bem-vindo!"}</Text>
            </Text>
            {user?.email && <Text style={estilos.email}>{user.email}</Text>}
          </View>
          <TouchableOpacity
            style={estilos.settingsButton}
            onPress={() => router.push("./config")}
          >
            <Feather name="settings" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={estilos.errorBox}>
            <Text style={estilos.errorText}>{error}</Text>
            <TouchableOpacity style={estilos.retryBtn} onPress={fetchUserAndPanels}>
              <Text style={estilos.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card Principal */}
        <LinearGradient
          colors={["#000", "#FFC125"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={estilos.cardPrincipal}
        >
          <Text style={estilos.cardTitulo}>Visão Geral</Text>
          <Text style={estilos.cardValor}>{totalEnergia.toFixed(2)} kWh</Text>
          <Text style={estilos.cardLegenda}>Geração Atual</Text>
        </LinearGradient>

        {/* gráfico */}
        <GraficoBarras placas={placas} />

        {/* Métricas rápidas */}
        <View style={estilos.grid}>
          <View style={estilos.card}>
            <Feather name="thermometer" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Temperatura</Text>
            <Text style={estilos.cardVvalor}>
              {placas.length > 0 ? `${placas[0].temperature || 0}°C` : "0°C"}
            </Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="flash" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Tensão</Text>
            <Text style={estilos.cardVvalor}>
              {placas.length > 0 ? `${placas[0].voltage || 0}V` : "0V"}
            </Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="current-ac" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Corrente</Text>
            <Text style={estilos.cardVvalor}>
              {placas.length > 0 ? `${placas[0].current || 0}A` : "0A"}
            </Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="percent" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Eficiência</Text>
            <Text style={estilos.cardVvalor}>{eficiencia.toFixed(0)}%</Text>
          </View>
        </View>
      </ScrollView>

      {/* ChatBot fixo acima da navbar */}
      <View style={{ position: "absolute", bottom: 80, right: 0 }}>
        <ChatBot />
      </View>

      <AnimatedBottomNavBar activeIndex={activeIndex} onTabPress={setActiveIndex} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loadingDica: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  saudacao: { fontSize: 20, fontWeight: "600", color: "#000" },
  username: { fontWeight: "700", color: "#000000ff" },
  email: { fontSize: 12, color: "#666", marginTop: 2 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  settingsButton: { marginLeft: 12, justifyContent: "center", alignItems: "center" },
  cardPrincipal: { borderRadius: 20, padding: 24, marginBottom: 20 },
  cardTitulo: { fontSize: 16, color: "#fff", marginBottom: 6 },
  cardValor: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  cardVvalor: { fontSize: 22, fontWeight: "bold", color: "#333" },
  cardLegenda: { fontSize: 14, color: "#fff", marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    width: "47%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: { fontSize: 14, color: "#333", marginTop: 8, fontWeight: "500" },
  errorBox: {
    backgroundColor: "#ffece6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: { color: "#b00020", marginBottom: 8 },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: "#FFC125" },
});
