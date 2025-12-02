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
import { MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavBarEmpresarial } from "../components/NavBarEmpresarial";
import { useRouter } from "expo-router";

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_SIMULACAO_URL = "https://placa-api-eaho.onrender.com";

// ===== Interfaces =====
interface Placa {
  id: number;
  serial: string;
  location: string;
  model: string;
  status?: "Ativa" | "Desativada";
  energia_kWh: number;
  tensao?: number;
  temperatura?: number;
}

interface Usuario {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

const VALOR_KWH = 0.12;
const CO2_KWH = 0.001;
const CHAVE_PRODUCAO_ACUMULADA = "@producao_acumulada";

export default function TelaPerfil() {
  const [usuario, setUsuario] = useState<Usuario>({ name: "", email: "", bio: "", avatar: "" });
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDicaIndex, setLoadingDicaIndex] = useState(0);
  const [producaoAcumulada, setProducaoAcumulada] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [tempoDecorrido, setTempoDecorrido] = useState<string>("Nunca atualizado");
  const router = useRouter();
  const [atualizandoManual, setAtualizandoManual] = useState(false);

  // ===== Animação do sol =====
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

  // ===== Função para calcular tempo decorrido com precisão =====
  const calcularTempoDecorrido = (data: Date | null): string => {
    if (!data) return "Nunca atualizado";

    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    const diffMinutos = Math.floor(diffSegundos / 60);
    const diffHoras = Math.floor(diffMinutos / 60);

    if (diffSegundos < 10) return "Agora mesmo";
    if (diffSegundos < 60) return `Atualizado há ${diffSegundos} segundos`;
    if (diffMinutos === 1) return "Atualizado há 1 minuto";
    if (diffMinutos < 60) return `Atualizado há ${diffMinutos} minutos`;
    if (diffHoras === 1) return "Atualizado há 1 hora";
    if (diffHoras < 24) return `Atualizado há ${diffHoras} horas`;

    // Para mais de 24 horas, mostrar a data completa
    return `Atualizado em ${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  // ===== Atualizar tempo decorrido em tempo real =====
  useEffect(() => {
    if (!ultimaAtualizacao) return;

    // Atualizar imediatamente
    setTempoDecorrido(calcularTempoDecorrido(ultimaAtualizacao));

    // Atualizar a cada 10 segundos para manter a precisão
    const interval = setInterval(() => {
      setTempoDecorrido(calcularTempoDecorrido(ultimaAtualizacao));
    }, 10000);

    return () => clearInterval(interval);
  }, [ultimaAtualizacao]);

  // ===== AsyncStorage =====
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

  // ===== Buscar energia simulada (placas e grupos) =====
  const buscarEnergiaSimulada = async (placa: Placa) => {
    try {
      const res = await fetch(`${API_SIMULACAO_URL}/${placa.serial}`);
      if (!res.ok) throw new Error("Erro ao buscar dados simulados");
      const data = await res.json();

      // Caso venha grupo de placas
      if (Array.isArray(data)) {
        const totalEnergia = data.reduce((acc, p) => acc + (p.energia_kWh || 0), 0);
        const mediaTensao =
          data.reduce((acc, p) => acc + (p.tensao || 0), 0) / data.length || 0;
        const mediaTemp =
          data.reduce((acc, p) => acc + (p.temperatura || 0), 0) / data.length || 0;

        return {
          energia_kWh: totalEnergia,
          tensao: mediaTensao,
          temperatura: mediaTemp,
        };
      }

      // Caso venha uma única placa
      return {
        energia_kWh: data.energia_kWh || 0,
        tensao: data.tensao || 0,
        temperatura: data.temperatura || 0,
      };
    } catch (err) {
      console.log("Erro simulação:", err);
      return { energia_kWh: 0, tensao: 0, temperatura: 0 };
    }
  };

  const enviarMedicoes = async (code, dados) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    await fetch("https://solaire-z8mw.onrender.com/panels/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
        tensao: dados.tensao,
        corrente: dados.corrente,
        temperatura: dados.temperatura,
        economia: dados.economia_R$,
        co2: dados.co2_kg,
      }),
    });
  };


  const enviarEnergiaParaBackend = async (placa: Placa, energia_kWh: number) => {
    try {
          console.log("DEBUG placa:", placa);
    console.log("DEBUG placa.id:", placa?.id);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      // Converter energia kWh para W (aprox. instantâneo)
      // Se a API já aceita kWh diretamente, apenas envie energia_kWh.
      const potencia_W = energia_kWh * 1000;

      const response = await fetch(`${API_USUARIO_URL}/measurements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          panelId: placa.id,                // ID da placa (backend espera número)
          potencia_W,                       // potência calculada
          tensao: placa.tensao ?? 0,
          corrente: placa.tensao ? potencia_W / placa.tensao : 0, // evita erro
          temperatura: placa.temperatura ?? 0,
          intervaloSegundos: 5,
          status: placa.status === "Ativa" ? "Ativa" : "Desativada"
        }),
      });

      const result = await response.json();
      console.log("✔ Backend recebeu:", result);

      if (!response.ok) {
        console.log("⚠ Erro resposta backend:", result);
      }

    } catch (err) {
      console.log("❌ Erro ao enviar energia para backend:", err);
    }
  };



  const salvarHistorico = async (placa: Placa) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      await fetch(`${API_USUARIO_URL}/historico`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: placa.serial,
          kwh_diario: placa.energia_kWh,
          kwh_mensal: placa.energia_kWh * 30,
        }),
      });
    } catch (err) {
      console.log("Erro ao salvar histórico:", err);
    }
  };

  // ===== Atualizar dados =====
  const atualizarDados = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const resUser = await fetch(`${API_USUARIO_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resUser.ok) {
        const userResponse = await resUser.json();
        const u = userResponse.data;
        setUsuario({
          name: u?.name || "Usuário Solar",
          email: u?.email || "",
          bio: u?.bio || "",
          avatar: u?.avatar || "",
        });
      }

      const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resPlacas.ok) {
        const placasResponse = await resPlacas.json();
        const placasData: Placa[] = placasResponse.data || [];

        const placasAtualizadas = await Promise.all(
          placasData.map(async (placa) => {
            const simulacao = placa.status === "Ativa" ? await buscarEnergiaSimulada(placa) : { energia_kWh: 0, tensao: 0, temperatura: 0 };
            if (placa.status === "Ativa") await atualizarProducaoAcumulada(simulacao.energia_kWh);

            await enviarEnergiaParaBackend(placa, simulacao.energia_kWh);
            await salvarHistorico({ ...placa, energia_kWh: simulacao.energia_kWh });

            return { ...placa, ...simulacao };
          })
        );

        setPlacas(placasAtualizadas);
        const agora = new Date();
        setUltimaAtualizacao(agora);
        setTempoDecorrido(calcularTempoDecorrido(agora));
      }

      const acumulado = await carregarProducaoAcumulada();
      setProducaoAcumulada(acumulado);
    } catch (err) {
      console.log("Erro ao atualizar dados:", err);
    } finally {
      setLoading(false);
    }
  };
  const atualizarManual = async () => {
    try {
      setAtualizandoManual(true);
      await atualizarDados();
    } catch (err) {
      console.log("Erro ao atualizar manualmente:", err);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    } finally {
      setAtualizandoManual(false);
    }
  };


  useEffect(() => {
    atualizarDados();
    const interval = setInterval(atualizarDados, 60000);
    return () => clearInterval(interval);
  }, []);

  // ===== Alternar status =====
  const alternarStatus = async (id: number) => {
    const placa = placas.find((p) => p.id === id);
    if (!placa) return;
    const novoStatus = placa.status === "Ativa" ? "Desativada" : "Ativa";
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await fetch(`${API_USUARIO_URL}/panels/${placa.serial}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");

      const simulacao = novoStatus === "Ativa" ? await buscarEnergiaSimulada(placa) : { energia_kWh: 0, tensao: 0, temperatura: 0 };
      if (novoStatus === "Ativa") await atualizarProducaoAcumulada(simulacao.energia_kWh);
      await enviarEnergiaParaBackend({ ...placa, status: novoStatus }, simulacao.energia_kWh);

      const placaAtualizada = { ...placa, status: novoStatus, ...simulacao };
      setPlacas((prev) => prev.map((p) => (p.id === id ? placaAtualizada : p)));
      await salvarHistorico(placaAtualizada);
      const agora = new Date();
      setUltimaAtualizacao(agora);
      setTempoDecorrido(calcularTempoDecorrido(agora));

      Alert.alert("Status da Placa", novoStatus === "Ativa" ? "Placa ligada!" : "Placa desligada!");
    } catch (err) {
      console.log(err);
      alert("Erro ao atualizar status");
    }
  };

  const calcularTotais = (placas?: Placa[]) => {
    const arr = placas || [];
    const total_kWh = arr.filter((p) => p.status === "Ativa").reduce((acc, p) => acc + (p.energia_kWh || 0), 0);
    const economia = total_kWh * VALOR_KWH;
    const co2 = total_kWh * CO2_KWH;
    return { total_kWh, economia, co2 };
  };

  const excluirPlaca = async (id: number) => {
    const placa = placas.find((p) => p.id === id);
    if (!placa) return;

    Alert.alert(
      "Confirmar exclusão",
      `Deseja realmente excluir a placa ${placa.location}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              if (!token) {
                Alert.alert("Erro", "Usuário não autenticado.");
                return;
              }

              // 🔥 agora usa SERIAL e não mais ID numérico
              const response = await fetch(`${API_USUARIO_URL}/panels/${placa.serial}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Erro ao excluir placa");
              }

              setPlacas((prev) => prev.filter((p) => p.id !== id));
              Alert.alert("Sucesso", "Placa removida da sua conta!");
            } catch (err: any) {
              console.error("Erro ao excluir placa:", err);
              Alert.alert("Erro", err.message || "Não foi possível excluir a placa.");
            }
          },
        },
      ]
    );
  };


  if (loading) {
    return (
      <View style={styles.loading}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons name="wb-sunny" size={30} color="#ffc125" />
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
            <Image source={require("../../assets/logo_residencial.png")} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.nome}>{usuario.name || "Usuário Solar"}</Text>
              <Text style={styles.email}>{usuario.email}</Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{tempoDecorrido}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Botão atualizar manualmente */}
            <TouchableOpacity
              style={{ padding: 10, marginRight: 6 }}
              activeOpacity={0.7}
              onPress={atualizarManual}
              disabled={atualizandoManual}
            >
              {atualizandoManual ? (
                <Feather name="rotate-cw" size={22} color="#999" style={{ transform: [{ rotate: "180deg" }] }} />
              ) : (
                <Feather name="rotate-cw" size={22} color="#333" />
              )}
            </TouchableOpacity>

            {/* Botão de configurações */}
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.7}
              onPress={() => router.push("./config")}
            >
              <Feather name="settings" size={25} color="#333" />
            </TouchableOpacity>
          </View>
        </View>


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
                <Text style={styles.energiaPlaca}>
                  Tensão: {item.tensao?.toFixed(1) || "0.0"} V
                </Text>
                <Text style={styles.energiaPlaca}>
                  Temperatura: {item.temperatura?.toFixed(1) || "0.0"} °C
                </Text>

                {item.energia_kWh === 0 && item.status === "Ativa" && (
                  <View style={styles.avisoDefeito}>
                    <Feather name="alert-triangle" size={14} color="#B91C1C" />
                    <Text style={styles.avisoText}>Alerta: manutenção necessária</Text>

                    <TouchableOpacity
                      style={{
                        marginLeft: 10,
                        backgroundColor: "#B91C1C",
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 6,
                      }}
                      onPress={() => router.push(`/empresarial/manutencao2`)}
                    >
                      <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>
                        Ir para manutenção
                      </Text>
                    </TouchableOpacity>
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
                style={[styles.acaoPlaca, { backgroundColor: "#f1f1f1ff" }]}
                onPress={() => excluirPlaca(item.id)}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={22} color="#909090ff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}


        {placas.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="info" size={28} color="#ffc125" />
            <Text style={styles.emptyText}>Nenhuma placa cadastrada ainda</Text>
            <Text style={styles.emptySubText}>Adicione placas pelo botão na navegação inferior</Text>
          </View>
        )}
      </ScrollView>
      <NavBarEmpresarial placas={placas} setPlacas={setPlacas} />
    </SafeAreaView>
  );
}

// Os estilos permanecem exatamente iguais
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFF",
    padding: 10
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFC107",
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