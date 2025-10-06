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

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
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
const CHAVE_PRODUCAO_ACUMULADA = "@producao_acumulada";

export default function TelaPerfil() {
  const [usuario, setUsuario] = useState({ name: "", email: "", bio: "" });
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDicaIndex, setLoadingDicaIndex] = useState(0);
  const [producaoAcumulada, setProducaoAcumulada] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

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

  // AsyncStorage: carregar e salvar produção acumulada
  const carregarProducaoAcumulada = async () => {
    try {
      const valor = await AsyncStorage.getItem(CHAVE_PRODUCAO_ACUMULADA);
      return valor ? parseFloat(valor) : 0;
    } catch (err) {
      console.log("Erro ao carregar produção acumulada:", err);
      return 0;
    }
  };

  const salvarProducaoAcumulada = async (valor: number) => {
    try {
      await AsyncStorage.setItem(CHAVE_PRODUCAO_ACUMULADA, valor.toString());
      setProducaoAcumulada(valor);
    } catch (err) {
      console.log("Erro ao salvar produção acumulada:", err);
    }
  };

  const atualizarProducaoAcumulada = async (energiaNova: number) => {
    const acumuladoAtual = await carregarProducaoAcumulada();
    const novoAcumulado = acumuladoAtual + energiaNova;
    await salvarProducaoAcumulada(novoAcumulado);
    return novoAcumulado;
  };

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

  // NOVO: enviar energia para o backend
  const enviarEnergiaParaBackend = async (placa: Placa, energia: number) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;
    try {
      await fetch(`${API_USUARIO_URL}/panels/${placa.serial}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: placa.status || "Desconhecido",
          energia_kWh: energia,
        }),
      });
    } catch (err) {
      console.log("Erro ao enviar energia para backend:", err);
    }
  };

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

  // Função central para carregar e atualizar dados
  const atualizarDados = async () => {
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

        const placasAtualizadas = await Promise.all(
          placasData.map(async (placa) => {
            const energiaSimulada = placa.status === "Ativa" ? await buscarEnergiaSimulada(placa) : 0;

            if (placa.status === "Ativa") {
              await atualizarProducaoAcumulada(energiaSimulada);
            }

            // 🔥 agora envia a energia simulada para o backend
            await enviarEnergiaParaBackend(placa, energiaSimulada);

            await salvarHistorico({ ...placa, energia_kWh: energiaSimulada });
            return { ...placa, energia_kWh: energiaSimulada };
          })
        );

        setPlacas(placasAtualizadas);
        setUltimaAtualizacao(new Date());
      }

      // produção acumulada
      const acumulado = await carregarProducaoAcumulada();
      setProducaoAcumulada(acumulado);
    } catch (err) {
      console.log("Erro ao atualizar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza dados ao carregar a tela e a cada 1 minuto
  useEffect(() => {
    atualizarDados();
    const interval = setInterval(atualizarDados, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  // Alternar status da placa
  const alternarStatus = async (id: number) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return alert("Usuário não logado.");

    const placa = placas.find((p) => p.id === id);
    if (!placa) return;

    const novoStatus = placa.status === "Ativa" ? "Desativada" : "Ativa";

    try {
      const res = await fetch(`${API_USUARIO_URL}/panels/${placa.serial}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");

      const energiaSimulada = novoStatus === "Ativa" ? await buscarEnergiaSimulada(placa) : 0;
      if (novoStatus === "Ativa") await atualizarProducaoAcumulada(energiaSimulada);

      // também envia energia nova para backend
      await enviarEnergiaParaBackend({ ...placa, status: novoStatus }, energiaSimulada);

      const placaAtualizada = { ...placa, status: novoStatus, energia_kWh: energiaSimulada };
      setPlacas((prev) => prev.map((p) => (p.id === placa.id ? placaAtualizada : p)));
      await salvarHistorico(placaAtualizada);
      setUltimaAtualizacao(new Date());

      Alert.alert("Status da Placa", novoStatus === "Ativa" ? "Placa ligada!" : "Placa desligada!");
    } catch (err) {
      console.log(err);
      alert("Erro ao atualizar status");
    }
  };

  // Calcular totais
  const calcularTotais = (placas?: Placa[]) => {
    const arr = placas || [];
    const total_kWh = arr.filter((p) => p.status === "Ativa").reduce((acc, p) => acc + (p.energia_kWh || 0), 0);
    const economia = total_kWh * VALOR_KWH;
    const co2 = total_kWh * CO2_KWH;
    return { total_kWh, economia, co2 };
  };

  // Tempo desde última atualização
  const tempoDesdeAtualizacao = () => {
    if (!ultimaAtualizacao) return "Nunca atualizado";
    const diffMs = new Date().getTime() - ultimaAtualizacao.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffMin === 0) {
      if (diffSec < 10) return "Atualizado há alguns segundos";
      return `Atualizado há ${diffSec} segundos`;
    }
    if (diffMin === 1) return "Atualizado há 1 minuto";
    return `Atualizado há ${diffMin} minutos`;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="white-balance-sunny" size={30} color="#ffc125" />
        </Animated.View>
        <Text style={styles.loadingText}>Você sabia?</Text>
        <Text style={styles.loadingDica}>{dicas[loadingDicaIndex]}</Text>
      </View>
    );
  }

  const { total_kWh, co2 } = calcularTotais(placas);
  const economiaAcumulada = producaoAcumulada * VALOR_KWH;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image source={require("../../assets/perfil-avatar.png")} style={styles.avatar} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.nome}>{usuario.name || "Usuário Solar"}</Text>
              <Text style={styles.email}>{usuario.email}</Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{tempoDesdeAtualizacao()}</Text>
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
              <Text style={styles.smallCardLabel}>Produção Acumulada</Text>
              <Text style={styles.smallCardValue}>{producaoAcumulada.toFixed(2)} kWh</Text>
            </View>
            <View style={[styles.smallCard, styles.shadow]}>
              <Text style={styles.smallCardLabel}>Economia</Text>
              <Text style={styles.smallCardValue}>R$ {economiaAcumulada.toFixed(2)}</Text>
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

                {/* AVISO DE DEFEITO / MANUTENÇÃO */}
                {item.energia_kWh === 0 && item.status === "Ativa" && (
                  <View style={styles.avisoDefeito}>
                    <Feather name="alert-triangle" size={14} color="#B91C1C" />
                    <Text style={styles.avisoText}>Alerta: manutenção necessária</Text>
                  </View>
                )}
                {item.status !== "Ativa" && (
                  <View style={styles.avisoDesativada}>
                    <Feather name="alert-triangle" size={14} color="#D97706" />
                    <Text style={styles.avisoText}>Placa desligada</Text>
                  </View>
                )}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFF"
  },
  tela: {
    flex: 1,
    paddingHorizontal: 18
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FBFBFF"
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#333"
  },
  loadingDica: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    marginTop: 6
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  avatarContainer: {
    width: 78,
    height: 78,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#Ffc125",
    shadowColor: "#ffc744ff",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 16
  },
  userInfo:
  {
    marginLeft: 14,
    flexShrink: 1
  },
  nome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827"
  },
  email:
  {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2
  },
  editButton: {
    padding: 10,
    marginLeft: 12
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827"
  },
  resumoGeral: {
    marginTop: 6,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 18
  },
  resumoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  resumoChip: {
    backgroundColor: "#FFF8EA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16
  },
  resumoChipText: {
    color: "#ffc125",
    fontWeight: "700",
    fontSize: 12
  },
  resumoCards: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  smallCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fffcf7ff",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center"
  },
  smallCardLabel: {
    fontSize: 12,
    color: "#6B7280"
  },
  smallCardValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#000"
  },
  listaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8
  },
  subHeaderText: {
    color: "#9CA3AF",
    fontSize: 12
  },
  cardPlaca: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "space-between"
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#FFF"
  },
  nomePlaca: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15
  },
  serialPlaca: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4
  },
  energiaPlaca: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 6
  },
  acaoPlaca: {
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  moreButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FBFBFF"
  },
  emptyState: {
    marginTop: 18,
    alignItems: "center",
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 12
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: "#374151",
    fontWeight: "600"
  },
  emptySubText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center"
  },
  shadow: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  avisoDefeito: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  avisoDesativada: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
  },
  avisoText: {
    fontSize: 11,
    color: "#B91C1C",
    marginLeft: 4,
    fontWeight: "600",
  },

});