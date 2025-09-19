import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const dicas = [
    "Desligue aparelhos da tomada quando não estiver usando.",
    "Prefira eletrodomésticos com selo Procel A.",
    "Aproveite a luz natural e economize energia.",
    "Use lâmpadas de LED, consomem até 80% menos.",
  ];
  const [dica, setDica] = useState("");

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      const res = await fetch("https://solaireapp.onrender.com/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      const userObj = data?.user || data?.data || data;

      if (!userObj || userObj?.message || userObj?.error) {
        setError(userObj?.message ?? userObj?.error ?? "Resposta inválida da API");
        setLoading(false);
        return;
      }

      setUser(userObj);
    } catch (err) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const random = Math.floor(Math.random() * dicas.length);
    setDica(dicas[random]);
  }, []);

  if (loading) {
    return (
      <View style={estilos.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

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
            <TouchableOpacity style={estilos.retryBtn} onPress={fetchUser}>
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
          <Text style={estilos.cardValor}>3.200W</Text>
          <Text style={estilos.cardLegenda}>Geração Atual</Text>
        </LinearGradient>

        {/* Gráfico */}
        <View style={estilos.chartBox}>
          <Text style={[estilos.cardLabel, { marginLeft: 12 }]}>
            Geração nos últimos 7 dias
          </Text>
          <LineChart
            data={{
              labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
              datasets: [{ data: [1200, 1500, 1000, 1800, 2000, 2200, 1900] }],
            }}
            width={Dimensions.get("window").width - 27} 
            height={Dimensions.get("window").width * 0.5} 
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={false}
            withShadow={true}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              decimalPlaces: 0,
              color: () => "#333",
              labelColor: () => "#333",
              fillShadowGradient: "#ffc125",
              fillShadowGradientOpacity: 0.3,
              strokeWidth: 2,
              propsForBackgroundLines: { strokeWidth: 0 },
            }}
            bezier
            style={{ marginVertical: 0, borderRadius: 16 }}
          />
        </View>


        {/* Métricas rápidas */}
        <View style={estilos.grid}>
          <View style={estilos.card}>
            <Feather name="thermometer" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Temperatura</Text>
            <Text style={estilos.cardVvalor}>42°C</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="flash" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Tensão</Text>
            <Text style={estilos.cardVvalor}>220V</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="current-ac" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Corrente</Text>
            <Text style={estilos.cardVvalor}>14A</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="percent" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Eficiência</Text>
            <Text style={estilos.cardVvalor}>87%</Text>
          </View>
        </View>

        {/* Economia acumulada */}
        <View style={estilos.card}>
          <MaterialCommunityIcons name="cash" size={28} color="#ffc125" />
          <Text style={estilos.cardLabel}>Economia acumulada</Text>
          <Text style={[estilos.cardValor, { color: "#333" }]}>R$ 560,00</Text>
        </View>

        {/* Status geral */}
        <View style={[estilos.card, estilos.cardStatus]}>
          <MaterialCommunityIcons name="alert-circle-check" size={28} color="#fffc125" />
          <View>
            <Text style={estilos.cardLabel}>Status</Text>
            <Text style={[estilos.cardValor, { color: "#333" }]}>
              Tudo funcionando bem
            </Text>
          </View>
        </View>

        {/* Dica do dia */}
        <View style={[estilos.card, { alignItems: "flex-start" }]}>
          <MaterialCommunityIcons name="leaf" size={28} color="#388e3c" />
          <Text style={[estilos.cardLabel, { marginTop: 6 }]}>Dica sustentável</Text>
          <Text style={{ marginTop: 6, color: "#444" }}>{dica}</Text>
        </View>

        {/* Botão Relatório */}
        <TouchableOpacity
          style={estilos.botaoRelatorio}
          onPress={() => router.push("./relatorio")}
        >
          <Text style={estilos.botaoTexto}>Ver Relatório Detalhado</Text>
        </TouchableOpacity>
      </ScrollView>

      <AnimatedBottomNavBar
        activeIndex={activeIndex}
        onTabPress={setActiveIndex}
      />
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  cardStatus: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
  },
  chartBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingVertical: 0,
  },
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
  botaoRelatorio: {
    backgroundColor: "#FFC125",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: { fontWeight: "700", color: "#000", fontSize: 16 },
});
