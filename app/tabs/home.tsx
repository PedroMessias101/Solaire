import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
      <ScrollView
        style={estilos.tela}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Header com avatar e engrenagem */}
        <View style={estilos.header}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={estilos.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={estilos.saudacao}>
              Olá, <Text style={estilos.username}>{user?.name || "Bem-vindo!"}</Text>
            </Text>
            {user?.email && <Text style={estilos.email}>{user.email}</Text>}
          </View>

          {/* Botão de configurações */}
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

        <View style={estilos.grid}>
          <View style={estilos.card}>
            <Feather name="thermometer" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Temperatura</Text>
            <Text style={estilos.cardValor}>42°C</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="flash" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Tensão</Text>
            <Text style={estilos.cardValor}>220V</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="current-ac" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Corrente</Text>
            <Text style={estilos.cardValor}>14A</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="percent" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Eficiência</Text>
            <Text style={estilos.cardValor}>87%</Text>
          </View>
        </View>

        <View style={[estilos.card, estilos.cardStatus]}>
          <MaterialCommunityIcons name="alert-circle-check" size={28} color="#2e7d32" />
          <View>
            <Text style={estilos.cardLabel}>Status</Text>
            <Text style={[estilos.cardValor, { color: "#2e7d32" }]}>Tudo funcionando bem</Text>
          </View>
        </View>
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  saudacao: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  username: {
    fontWeight: "700",
    color: "#000000ff",
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  settingsButton: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPrincipal: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardTitulo: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
  },
  cardValor: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  cardLegenda: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
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
  cardLabel: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    fontWeight: "500",
  },
  cardStatus: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
  },
  errorBox: {
    backgroundColor: "#ffece6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#b00020",
    marginBottom: 8,
  },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: "#FFC125" },
});
