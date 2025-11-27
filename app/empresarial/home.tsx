import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// Componentes assumidos
import ChatBot from "../components/ChatBot";
import { NavBarEmpresarial } from "../components/NavBarEmpresarial";
import Notificacoes from "../components/notific";
import WeatherCard from "../components/Clima";
import { TourProvider, TourStep } from "../components/TourGuide";

// --- Tipos de Dados ---
interface UserData {
  name: string;
  email: string;
  // Adicione outros campos de usuário aqui
}

interface PlacaData {
  id: string; // Exemplo de campo
  serial: string;
  status: "Ativa" | "Inativa" | string;
  energia_kWh: number;
  tensao: number;
  corrente: number;
  temperatura: number;
  // Adicione outros campos da placa aqui
}
// -----------------------

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_SIMULACAO_URL = "https://placa-api-eaho.onrender.com";

export default function HomeEmpresarial() {
  const router = useRouter();

  // Tipagem de estado
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [placas, setPlacas] = useState<PlacaData[]>([]);
  const [tokenChecked, setTokenChecked] = useState<boolean>(false);

  const [tourSeen, setTourSeen] = useState<boolean | null>(null);
  const [forceStartTour, setForceStartTour] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView | null>(null);

  // ======================
  // ANIMAÇÃO DO SOL
  // ======================
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
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ======================
  // CHECK TOKEN
  // ======================
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem("userToken");

      if (!storedToken) {
        router.replace("/auth/login");
        return;
      }
      setToken(storedToken);
      setTokenChecked(true);
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (tokenChecked && token) fetchUserAndPanels();
  }, [tokenChecked, token]);

  // ======================
  // LOAD TOUR FLAG
  // ======================
  useEffect(() => {
    const loadTourFlag = async () => {
      const flag = await AsyncStorage.getItem("tourSeen");
      setTourSeen(flag === "true");
    };
    loadTourFlag();
  }, []);

  // ======================
  // FETCH DATA
  // ======================
  const fetchUserAndPanels = async () => {
    if (!token) {
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);

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

      const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const placasResponse = await resPlacas.json();

      const placasDoUsuario: PlacaData[] = placasResponse.data || [];

      const placasCompletas = await Promise.all(
        placasDoUsuario.map(async (placa) => {
          if (placa.status !== "Ativa")
            return { ...placa, energia_kWh: 0, tensao: 0, corrente: 0, temperatura: 0 } as PlacaData;

          try {
            const resSim = await fetch(`${API_SIMULACAO_URL}/${placa.serial}`);
            const sim = await resSim.json();

            return {
              ...placa,
              energia_kWh: sim.energia_kWh || 0,
              tensao: sim.tensao || 0,
              corrente: sim.corrente || 0,
              temperatura: sim.temperatura || 0,
            } as PlacaData;
          } catch {
            return { ...placa, energia_kWh: 0, tensao: 0, corrente: 0, temperatura: 0 } as PlacaData;
          }
        })
      );

      setPlacas(placasCompletas);
    } catch (err) {
      console.log("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/auth/login");
  };

  // ======================
  // TOUR ACTIONS
  // ======================
  const marcarTourComoVisto = async () => {
    await AsyncStorage.setItem("tourSeen", "true");
    setTourSeen(true);
    setForceStartTour(false);
  };

  const iniciarTourManualmente = async () => {
    await AsyncStorage.removeItem("tourSeen");
    setTourSeen(false);
    setForceStartTour(true);
  };

  // ======================
  // MÉTRICAS
  // ======================
  const calcularTotais = () => {
    const ativos = placas.filter((p) => p.status === "Ativa");

    const totalEnergia: number = ativos.reduce((a, p) => a + Number(p.energia_kWh || 0), 0);
    const mediaTensao: number =
      ativos.length ? ativos.reduce((a, p) => a + Number(p.tensao || 0), 0) / ativos.length : 0;
    const mediaCorrente: number =
      ativos.length ? ativos.reduce((a, p) => a + Number(p.corrente || 0), 0) / ativos.length : 0;
    const mediaTemperatura: number =
      ativos.length ? ativos.reduce((a, p) => a + Number(p.temperatura || 0), 0) / ativos.length : 0;

    return { totalEnergia, mediaTensao, mediaCorrente, mediaTemperatura };
  };

  const { totalEnergia, mediaTensao, mediaCorrente, mediaTemperatura } = calcularTotais();

  // ======================
  // LOADING
  // ======================
  if (tourSeen === null || !tokenChecked || loading) {
    return (
      <View style={estilos.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="white-balance-sunny" size={35} color="#FFc125" />
        </Animated.View>
        <Text style={{ marginTop: 10, color: "#444", fontSize: 16 }}>
          Carregando dados empresariais...
        </Text>
      </View>
    );
  }

  return (
    <TourProvider
      scrollRef={scrollRef}
      autoStart={!tourSeen || forceStartTour}
      theme={{ primary: "#2e86de", highlightColor: "#FFC107" }}
    >
      <View style={{ flex: 1, backgroundColor: "#f9fafc" }}>
        <ScrollView
          ref={scrollRef}
          style={estilos.container}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* HEADER */}
          <View style={estilos.header}>
            <TourStep stepKey="logo" title="Logo da Empresa" description="Clique para ver informações.">
              <TouchableOpacity>
                <Animated.Image
                  source={require("../../assets/logo_empresarial.png")}
                  style={[estilos.avatar, { transform: [{ rotate: spin }] }]}
                />
              </TouchableOpacity>
            </TourStep>
            {/* O passo de notificação pode ser adicionado aqui, se o componente Notificacoes puder ser envolvido */}
            
            <View style={{ flex: 1 }}>
              <Text style={estilos.username}>{user?.name ?? "Usuário"}</Text>
              <Text style={estilos.email}>{user?.email ?? "Painel Empresarial"}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Notificacoes />

              <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
                <Feather name="log-out" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* DASHBOARD - 4 PASSOS DE TOUR AQUI */}
          <Text style={estilos.titulo}>Métricas Principais</Text>

          <View style={estilos.grid}>
            {/* 1. Energia Total */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="energia-total" title="Energia Total" description="Total de energia gerada pelas placas ativas (em kWh).">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="solar-power" size={28} color="#ffa726" />
                  <Text style={estilos.cardLabel}>Energia Total</Text>
                  <Text style={estilos.cardValor}>{totalEnergia.toFixed(2)} kWh</Text>
                </View>
              </TourStep>
            </View>
            
            {/* 2. Tensão Média */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="tensao-media" title="Tensão Média" description="Tensão média medida entre as placas solares.">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="flash" size={28} color="#FFC107" />
                  <Text style={estilos.cardLabel}>Tensão Média</Text>
                  <Text style={estilos.cardValor}>{mediaTensao.toFixed(1)} V</Text>
                </View>
              </TourStep>
            </View>
            
            {/* 3. Corrente Média */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="corrente-media" title="Corrente Média" description="Corrente média de saída, indicando o fluxo de energia.">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="current-ac" size={28} color="#FFB300" />
                  <Text style={estilos.cardLabel}>Corrente Média</Text>
                  <Text style={estilos.cardValor}>{mediaCorrente.toFixed(1)} A</Text>
                </View>
              </TourStep>
            </View>

            {/* 4. Temperatura Média */}
            <View style={estilos.gridItem}>
              <TourStep stepKey="temperatura-media" title="Temperatura Média" description="Temperatura média de operação das placas. Valores altos podem indicar ineficiência.">
                <View style={estilos.card}>
                  <MaterialCommunityIcons name="thermometer" size={28} color="#FFc125" />
                  <Text style={estilos.cardLabel}>Temperatura Média</Text>
                  <Text style={estilos.cardValor}>{mediaTemperatura.toFixed(1)} °C</Text>
                </View>
              </TourStep>
            </View>
          </View>

          <WeatherCard />

          {/* AÇÕES RÁPIDAS - 2 PASSOS DE TOUR AQUI */}
          <Text style={estilos.subtitulo}>Ações Rápidas</Text>

          <View style={estilos.acoesContainer}>
            {/* 5. Simulador */}
            <TourStep stepKey="acao-simulador" title="Simulador de Placas" description="Acesse a ferramenta para planejar ou simular novas instalações solares.">
              <TouchableOpacity
                style={estilos.botao}
                onPress={() => router.push("/empresarial/simulador")}
              >
                <Feather name="server" size={22} color="#ffc125" />
                <Text style={estilos.botaoTexto}>Simulador</Text>
              </TouchableOpacity>
            </TourStep>

            {/* 6. Agendamento */}
            <TourStep stepKey="acao-agendamento" title="Agendamento" description="Marque visitas técnicas, manutenções ou consultas.">
              <TouchableOpacity
                style={estilos.botao}
                onPress={() => router.push("/empresarial/agendamento")}
              >
                <Feather name="calendar" size={22} color="#ffc125" />
                <Text style={estilos.botaoTexto}>Agendamento</Text>
              </TouchableOpacity>
            </TourStep>

            <TouchableOpacity
              style={estilos.botao}
              onPress={() => router.push("/empresarial/configuracao")}
            >
              <Feather name="settings" size={22} color="#ffc125" />
              <Text style={estilos.botaoTexto}>Configurações</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* NAVBAR - 7º passo (opcional, se a NavBar puder ser envolvida) */}
        <NavBarEmpresarial placas={placas} setPlacas={setPlacas} />
      </View>
    </TourProvider>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 40 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#ffc125",
  },

  username: { fontSize: 20, fontWeight: "700", color: "#222" },
  email: { fontSize: 14, color: "#666", marginTop: 2 },

  titulo: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#111" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    flexBasis: "48%",
    marginBottom: 16,
    minHeight: 120,
    height: 120,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  cardLabel: {
    fontSize: 15,
    color: "#555",
    marginTop: 8,
    textAlign: "center",
  },

  cardValor: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginTop: 6,
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#222",
  },

  acoesContainer: { gap: 12 },

  botao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  botaoTexto: { fontSize: 16, color: "#000", fontWeight: "600" },
});