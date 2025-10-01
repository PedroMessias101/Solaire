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
  Animated,
  Easing,
} from "react-native";
import { MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";

const API_USUARIO_URL = "https://solaireapp.onrender.com";
const API_SIMULACAO_URL = "https://placa-api-eaho.onrender.com";

interface Placa {
  id: number;
  serial: string;
  location: string;
  model: string;
  status?: "Ativa" | "Desativada";
  energia_kWh: number;
}

const VALOR_KWH = 0.12;
const CO2_KWH = 0.001;

export default function TelaPerfil() {
  const [usuario, setUsuario] = useState({ name: "", email: "", bio: "" });
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [loading, setLoading] = useState(true);
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
  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  // dicas animadas
  const dicas = [
    "Usar energia solar pode reduzir até 1,5 tonelada de CO₂ por ano — o equivalente a plantar 40 árvores",
    "Painéis solares podem cortar até 95% da sua conta de luz",
    "A energia solar é silenciosa, renovável e não poluente",
    "Use lâmpadas de LED, consomem até 80% menos.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDicaIndex((prev) => (prev + 1) % dicas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Função para buscar energia da API de simulação
  const buscarEnergiaSimulada = async (placa: Placa) => {
    try {
      const res = await fetch(`${API_SIMULACAO_URL}/${placa.serial}`);
      if (!res.ok) throw new Error("Erro ao buscar energia simulada");
      const data = await res.json();
      return data.energia_kWh || 0;
    } catch (err) {
      console.log("Erro simulação:", err);
      return placa.energia_kWh || 0;
    }
  };

  // Função para salvar histórico no backend
  const salvarHistorico = async (placa: Placa) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    try {
      await fetch(`${API_USUARIO_URL}/historico`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placaId: placa.id,
          kwh_diario: placa.energia_kWh,
          kwh_mensal: placa.energia_kWh * 30,
        }),
      });
    } catch (err) {
      console.log("Erro ao salvar histórico:", err);
    }
  };

  // Carregar dados do usuário e placas
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        // usuário
        const resUser = await fetch(`${API_USUARIO_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUsuario({
            name: dataUser.name,
            email: dataUser.email,
            bio: dataUser.bio || "Usuário Solar",
          });
        }

        // placas
        const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resPlacas.ok) {
          const dataPlacas = await resPlacas.json();
          const placasData: Placa[] = dataPlacas.data || [];

          // Para cada placa, busca energia simulada e salva histórico
          const placasAtualizadas = await Promise.all(
            placasData.map(async (placa) => {
              const energiaSimulada = await buscarEnergiaSimulada(placa);
              const placaAtualizada = { ...placa, energia_kWh: energiaSimulada };
              await salvarHistorico(placaAtualizada);
              return placaAtualizada;
            })
          );

          setPlacas(placasAtualizadas);
        }
      } catch (err) {
        console.log("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Alternar status da placa (ligar/desligar)
  const alternarStatus = async (id: number) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return alert("Usuário não logado.");

    const placa = placas.find((p) => p.id === id);
    if (!placa) return;

    const novoStatus = placa.status === "Ativa" ? "Desativada" : "Ativa";

    try {
      // Atualiza status no backend
      const res = await fetch(`${API_USUARIO_URL}/panels/${placa.serial}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");

      // Buscar energia simulada se estiver ligando
      const energiaSimulada = novoStatus === "Ativa" ? await buscarEnergiaSimulada(placa) : 0;

      const placaAtualizada = {
        ...placa,
        status: novoStatus,
        energia_kWh: energiaSimulada,
      };

      setPlacas((prev) =>
        prev.map((p) => (p.id === placa.id ? placaAtualizada : p))
      );

      await salvarHistorico(placaAtualizada);

      Alert.alert(
        "Status da Placa",
        novoStatus === "Ativa" ? "Placa ligada!" : "Placa desligada!"
      );
    } catch (err) {
      console.log(err);
      alert("Erro ao atualizar status");
    }
  };

  const calcularTotais = (placas?: Placa[]) => {
    const arr = placas || [];
    const total_kWh = arr
      .filter((p) => p.status === "Ativa")
      .reduce((acc, p) => acc + (p.energia_kWh || 0), 0);
    const economia = total_kWh * VALOR_KWH;
    const co2 = total_kWh * CO2_KWH;
    return { total_kWh, economia, co2 };
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={50}
            color="#ffc125"
          />
        </Animated.View>
        <Text style={styles.loadingText}>Você sabia?</Text>
        <Text style={styles.loadingDica}>{dicas[loadingDicaIndex]}</Text>
      </View>
    );
  }

  const { total_kWh, economia, co2 } = calcularTotais(placas);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../../assets/perfil-avatar.png")}
                style={styles.avatar}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.nome}>{usuario.name || "Usuário Solar"}</Text>
              <Text style={styles.email}>{usuario.email}</Text>
              <Text style={styles.bio} numberOfLines={1}>
                {usuario.bio}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Feather name="settings" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Resumo Geral */}
        <View style={styles.resumoGeral}>
          <View style={styles.resumoHeader}>
            <Text style={styles.tituloSecao}>Resumo Geral</Text>
            <View style={styles.resumoChip}>
              <Text style={styles.resumoChipText}>{placas.length} placas</Text>
            </View>
          </View>
          <View style={styles.resumoCards}>
            <View style={[styles.smallCard, styles.shadow]}>
              <Text style={styles.smallCardLabel}>Produção</Text>
              <Text style={styles.smallCardValue}>{total_kWh.toFixed(2)} kWh</Text>
            </View>
            <View style={[styles.smallCard, styles.shadow]}>
              <Text style={styles.smallCardLabel}>Economia</Text>
              <Text style={styles.smallCardValue}>R$ {economia.toFixed(2)}</Text>
            </View>
            <View style={[styles.smallCard, styles.shadow]}>
              <Text style={styles.smallCardLabel}>CO₂ evitado</Text>
              <Text style={styles.smallCardValue}>{co2.toFixed(3)} t</Text>
            </View>
          </View>
        </View>

        {/* Lista de placas */}
        <View style={styles.listaHeader}>
          <Text style={styles.tituloSecao}>Suas Placas</Text>
          <Text style={styles.subHeaderText}>Toque no ícone para ligar/desligar</Text>
        </View>

        {placas.map((item) => (
          <View style={[styles.cardPlaca, styles.shadow]} key={item.id}>
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: item.status === "Ativa" ? "#FFD36B" : "#D1D5DB" },
                ]}
              />
              <View style={{ marginLeft: 12, flexShrink: 1 }}>
                <Text style={styles.nomePlaca}>{item.location}</Text>
                <Text style={styles.serialPlaca}>{item.serial}</Text>
                <Text style={styles.energiaPlaca}>
                  Produção: {item.energia_kWh?.toFixed(2) || "0.00"} kWh
                </Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <TouchableOpacity
                style={[
                  styles.acaoPlaca,
                  { backgroundColor: item.status === "Ativa" ? "#000" : "#F3F4F6" },
                ]}
                onPress={() => alternarStatus(item.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="power-settings-new"
                  size={22}
                  color={item.status === "Ativa" ? "#ffc125" : "#6B7280"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                <Feather name="chevrons-right" size={18} color="#777a7eff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {placas.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="info" size={28} color="#ffc125" />
            <Text style={styles.emptyText}>Nenhuma placa cadastrada ainda</Text>
            <Text style={styles.emptySubText}>
              Adicione placas pelo botão na navegação inferior
            </Text>
          </View>
        )}
      </ScrollView>

      <AnimatedBottomNavBar placas={placas} setPlacas={setPlacas} />
    </SafeAreaView>
  );
}

// Estilos (mantidos)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFF" },
  tela: { flex: 1, paddingHorizontal: 18 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: "#FBFBFF" },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: "600", color: "#333" },
  loadingDica: { marginTop: 8, fontSize: 14, color: "#555", textAlign: "center", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, marginTop: 6 },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarContainer: { width: 78, height: 78, borderRadius: 20, overflow: "hidden", backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#Ffc125", shadowColor: "#ffc744ff", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  avatar: { width: 70, height: 70, borderRadius: 16 },
  userInfo: { marginLeft: 14, flexShrink: 1 },
  nome: { fontSize: 18, fontWeight: "700", color: "#111827" },
  email: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  bio: { fontSize: 12, color: "#9CA3AF", marginTop: 6, maxWidth: "95%" },
  editButton: { padding: 10, marginLeft: 12 },
  tituloSecao: { fontSize: 18, fontWeight: "700", color: "#111827" },
  resumoGeral: { marginTop: 6, padding: 16, backgroundColor: "#FFFFFF", borderRadius: 14, marginBottom: 18 },
  resumoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resumoChip: { backgroundColor: "#FFF8EA", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  resumoChipText: { color: "#ffc125", fontWeight: "700", fontSize: 12 },
  resumoCards: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
  smallCard: { flex: 1, marginHorizontal: 4, backgroundColor: "#FFF8EA", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, alignItems: "center" },
  smallCardLabel: { fontSize: 12, color: "#6B7280" },
  smallCardValue: { marginTop: 6, fontSize: 16, fontWeight: "700", color: "#1F2937" },
  listaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  subHeaderText: { color: "#9CA3AF", fontSize: 12 },
  cardPlaca: { flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 12, justifyContent: "space-between" },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardRight: { flexDirection: "row", alignItems: "center" },
  statusIndicator: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: "#FFF" },
  nomePlaca: { color: "#111827", fontWeight: "700", fontSize: 15 },
  serialPlaca: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
  energiaPlaca: { color: "#6B7280", fontSize: 12, marginTop: 6 },
  acaoPlaca: { padding: 10, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 8 },
  moreButton: { padding: 8, borderRadius: 8, backgroundColor: "#FBFBFF" },
  emptyState: { marginTop: 18, alignItems: "center", padding: 18, backgroundColor: "#FFFFFF", borderRadius: 12 },
  emptyText: { marginTop: 10, fontSize: 15, color: "#374151", fontWeight: "600" },
  emptySubText: { marginTop: 6, fontSize: 12, color: "#9CA3AF", textAlign: "center" },
  shadow: { shadowColor: "#0B1220", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
});
