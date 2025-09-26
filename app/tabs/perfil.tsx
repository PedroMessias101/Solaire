import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";

const API_URL = "https://solaireapp.onrender.com";
const PRECO_KWH = 0.12;

interface Placa {
  id: number;
  serial: string;
  location: string;
  model: string;
  status?: "Ativa" | "Desativada";
  energia_kWh: number;
}

export default function TelaPerfil() {
  const router = useRouter();
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [usuario, setUsuario] = useState({ name: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const dicas = [
    "Desligue aparelhos da tomada quando não estiver usando.",
    "Prefira eletrodomésticos com selo Procel A.",
    "Aproveite a luz natural e economize energia.",
    "Use lâmpadas de LED, consomem até 80% menos.",
  ];

  const [loadingDicaIndex, setLoadingDicaIndex] = useState(0);

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("userToken");
        if (!savedToken) return;
        setToken(savedToken);

        const resUser = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUsuario({
            name: dataUser.name,
            email: dataUser.email,
            bio: dataUser.bio || "Usuário Solar",
          });
        }

        const resPlacas = await fetch(`${API_URL}/panels`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!resPlacas.ok) throw new Error("Erro ao buscar painéis");
        const dataPlacas = await resPlacas.json();

        const placasComEnergia: Placa[] = await Promise.all(
          (dataPlacas.data || []).map(async (p: Placa) => {
            try {
              const resSummary = await fetch(
                `${API_URL}/measurements/panel/${p.id}/summary?days=1`,
                { headers: { Authorization: `Bearer ${savedToken}` } }
              );
              if (!resSummary.ok) throw new Error("Erro ao buscar resumo");
              const summary = await resSummary.json();
              return { ...p, energiaHoje: summary.total ?? 0, status: "Ativa" };
            } catch (err) {
              return { ...p, energiaHoje: 0, status: "Ativa" };
            }
          })
        );

        setPlacas(placasComEnergia);
      } catch (error) {
        console.log("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();

    const interval = setInterval(() => {
      setLoadingDicaIndex((prev) => (prev + 1) % dicas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const alternarStatus = (id: number) => {
    const novasPlacas = placas.map((p) => {
      if (p.id === id) {
        const novoStatus = p.status === "Ativa" ? "Desativada" : "Ativa";
        Alert.alert(
          "Status da Placa",
          novoStatus === "Ativa"
            ? "Placa ligada com sucesso!"
            : "Placa desligada com sucesso!"
        );
        return { ...p, status: novoStatus };
      }
      return p;
    });
    setPlacas(novasPlacas);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFC125" />
        <Text style={styles.voceSabia}>Você sabia?</Text>
        <Text style={styles.loadingDica}>{dicas[loadingDicaIndex]}</Text>
      </View>
    );
  }

  const placasAtivas = placas.filter((p) => p.status === "Ativa").length;
  const producaoHoje = placas
    .filter((p) => p.status === "Ativa")
    .reduce((acc, p) => acc + (p.energia_kWh || 0), 0);
  const economia = (producaoHoje * PRECO_KWH).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header minimalista lado a lado */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/perfil-avatar.png")}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.nome}>{usuario.name}</Text>
            <Text style={styles.email}>{usuario.email}</Text>
          </View>
        </View>

        {/* Indicadores */}
        <View style={styles.indicadores}>
          {[
            { icon: "wb-sunny", valor: `${producaoHoje.toFixed(2)} kWh`, label: "Produção Hoje" },
            { icon: "bolt", valor: economia, label: "Economia" },
            { icon: "solar-power", valor: `${placasAtivas} Ativa${placasAtivas !== 1 ? "s" : ""}`, label: "Placas" },
          ].map((item, i) => (
            <View key={i} style={styles.cardIndicador}>
              <MaterialIcons name={item.icon as any} size={28} color="#FFC125" />
              <Text style={styles.valorIndicador}>{item.valor}</Text>
              <Text style={styles.labelIndicador}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Lista de placas */}
        <View style={styles.secaoPlacas}>
          <View style={styles.headerPlacas}>
            <Text style={styles.tituloSecao}>Suas Placas</Text>
          </View>

          {placas.map((item) => (
            <View style={styles.cardPlaca} key={item.id}>
              <View style={[styles.statusIndicator, { backgroundColor: item.status === "Ativa" ? "#FFC125" : "#555" }]} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.nomePlaca}>{item.location}</Text>
                <Text style={styles.serialPlaca}>{item.serial}</Text>
                <Text style={styles.energiaPlaca}>
                  Produção: {item.energia_kWh?.toFixed(2) || 0} kWh
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.acaoPlaca, { backgroundColor: item.status === "Ativa" ? "#FFC125" : "#555" }]}
                onPress={() => alternarStatus(item.id)}
              >
                <MaterialIcons name="power-settings-new" size={22} color="#000" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Barra de navegação fixa */}
      <AnimatedBottomNavBar
        activeIndex={activeIndex}
        onTabPress={setActiveIndex}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },

  /* Header lado a lado */
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: "#FFC125" },
  nome: { fontSize: 18, fontWeight: "700", color: "#000" },
  email: { fontSize: 14, color: "#555", marginTop: 2 },

  /* Indicadores */
  indicadores: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20, marginHorizontal: 16 },
  cardIndicador: { alignItems: "center", padding: 12, minWidth: 100, borderRadius: 12, backgroundColor: "#f7f7f7" },
  valorIndicador: { color: "#000", fontWeight: "700", marginTop: 6 },
  labelIndicador: { color: "#555", fontSize: 12, marginTop: 2 },

  /* Placas */
  secaoPlacas: { marginHorizontal: 16 },
  headerPlacas: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  tituloSecao: { fontSize: 16, fontWeight: "700", color: "#000" },

  cardPlaca: { flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 12, backgroundColor: "#f7f7f7", borderRadius: 12 },
  statusIndicator: { width: 14, height: 14, borderRadius: 7 },
  nomePlaca: { color: "#000", fontWeight: "700", fontSize: 15 },
  serialPlaca: { color: "#888", fontSize: 12, marginTop: 2 },
  energiaPlaca: { color: "#555", fontSize: 12, marginTop: 2 },
  acaoPlaca: { padding: 10, borderRadius: 10, justifyContent: "center", alignItems: "center" },

  /* Loading */
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 20 },
  voceSabia: { fontSize: 16, fontWeight: "700", color: "#FFC125", marginTop: 16, textAlign: "center" },
  loadingDica: { fontSize: 14, color: "#555", textAlign: "center", marginTop: 6 },
});
