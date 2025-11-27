// app/(onde_esta)/HomeEmpresarial.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import ChatBot from "../components/ChatBot";
import { NavBarEmpresarial } from "../components/NavBarEmpresarial";
import Notificacoes from "../components/notific";

// Tour (certifique-se que app/components/TourGuide.tsx está presente)
import { TourProvider, TourStep } from "../components/TourGuide";

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_SIMULACAO_URL = "https://placa-api-eaho.onrender.com";

export default function HomeEmpresarial() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [placas, setPlacas] = useState<any[]>([]);
  const [tokenChecked, setTokenChecked] = useState(false);

  // ref do ScrollView — importante passar ao TourProvider
  const scrollRef = useRef<ScrollView | null>(null);

  // Animação sol
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

  // STEP 1 — CHECAR TOKEN
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

  // STEP 2 — BUSCAR USER + PLACAS
  useEffect(() => {
    if (tokenChecked && token) {
      fetchUserAndPanels();
    }
  }, [tokenChecked, token]);

  const fetchUserAndPanels = async () => {
    try {
      setLoading(true);

      // USER
      const resUser = await fetch(`${API_USUARIO_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resUser.status === 401) {
        await AsyncStorage.removeItem("userToken");
        router.replace("/auth/login");
        return;
      }

      const userResponse = await resUser.json();
      if (userResponse.success) setUser(userResponse.data);

      // PLACAS
      const resPlacas = await fetch(`${API_USUARIO_URL}/panels`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const placasResponse = await resPlacas.json();
      const placasDoUsuario = placasResponse.data || [];

      // API SIMULACAO
      const placasComDados = await Promise.all(
        placasDoUsuario.map(async (placa: any) => {
          if (placa.status !== "Ativa")
            return { ...placa, energia_kWh: 0, tensao: 0, corrente: 0, temperatura: 0 };
          try {
            const resSim = await fetch(`${API_SIMULACAO_URL}/${placa.serial}`);
            const dadosSim = await resSim.json();
            return {
              ...placa,
              energia_kWh: dadosSim.energia_kWh || 0,
              tensao: dadosSim.tensao || 0,
              corrente: dadosSim.corrente || 0,
              temperatura: dadosSim.temperatura || 0,
            };
          } catch {
            return { ...placa, energia_kWh: 0, tensao: 0, corrente: 0, temperatura: 0 };
          }
        })
      );

      setPlacas(placasComDados);
    } catch (err) {
      console.log("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken"); // remove só token
    router.replace("/auth/login");
  };

  const calcularTotais = () => {
    const ativos = placas.filter((p) => p.status === "Ativa");
    const totalEnergia = ativos.reduce((acc, p) => acc + (Number(p.energia_kWh) || 0), 0);
    const mediaTensao = ativos.length ? ativos.reduce((a, p) => a + (Number(p.tensao) || 0), 0) / ativos.length : 0;
    const mediaCorrente = ativos.length ? ativos.reduce((a, p) => a + (Number(p.corrente) || 0), 0) / ativos.length : 0;
    const mediaTemperatura = ativos.length ? ativos.reduce((a, p) => a + (Number(p.temperatura) || 0), 0) / ativos.length : 0;
    return { totalEnergia, mediaTensao, mediaCorrente, mediaTemperatura };
  };

  const { totalEnergia, mediaTensao, mediaCorrente, mediaTemperatura } = calcularTotais();

  if (!tokenChecked || loading) {
    return (
      <View style={estilos.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="white-balance-sunny" size={35} color="#FFc125" />
        </Animated.View>

        <Text style={{ marginTop: 10, color: "#444", fontSize: 16 }}>Carregando dados empresariais...</Text>
      </View>
    );
  }

  return (
    // autoStart=true faz o tour iniciar automaticamente (respeita AsyncStorage dentro do provider)
    <TourProvider scrollRef={scrollRef} autoStart={true} theme={{ primary: "#2e86de", highlightColor: "#FFC107" }}>
      <View style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} style={estilos.container} contentContainerStyle={{ paddingBottom: 160 }}>
          {/* HEADER */}
          <View style={estilos.header}>
            <TourStep stepKey="logo" title="Logo da Empresa" description="Toque para acessar opções da filial.">
              <TouchableOpacity onPress={() => { /* mantém comportamento se precisar */ }}>
                <Animated.Image source={require("../../assets/logo_empresarial.png")} style={[estilos.avatar, { transform: [{ rotate: spin }] }]} />
              </TouchableOpacity>
            </TourStep>

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

          {/* DASHBOARD */}
          <Text style={estilos.titulo}>Dashboard Empresarial</Text>

          <View style={estilos.grid}>
            <TourStep stepKey="energia-total" title="Energia Total" description="Energia gerada por todas as unidades ativas.">
              <View style={estilos.card}>
                <MaterialCommunityIcons name="solar-power" size={28} color="#FFA726" />
                <Text style={estilos.cardLabel}>Energia Total</Text>
                <Text style={estilos.cardValor}>{totalEnergia.toFixed(2)} kWh</Text>
              </View>
            </TourStep>

            <TourStep stepKey="tensao-media" title="Tensão Média" description="Tensão média atual das placas ativas.">
              <View style={estilos.card}>
                <MaterialCommunityIcons name="flash" size={28} color="#FFC107" />
                <Text style={estilos.cardLabel}>Tensão Média</Text>
                <Text style={estilos.cardValor}>{mediaTensao.toFixed(1)} V</Text>
              </View>
            </TourStep>

            <TourStep stepKey="corrente-media" title="Corrente Média" description="Corrente média das placas ativas.">
              <View style={estilos.card}>
                <MaterialCommunityIcons name="current-ac" size={28} color="#FFB300" />
                <Text style={estilos.cardLabel}>Corrente Média</Text>
                <Text style={estilos.cardValor}>{mediaCorrente.toFixed(1)} A</Text>
              </View>
            </TourStep>

            <TourStep stepKey="temperatura-media" title="Temperatura Média" description="Temperatura média dos equipamentos.">
              <View style={estilos.card}>
                <MaterialCommunityIcons name="thermometer" size={28} color="#FFc125" />
                <Text style={estilos.cardLabel}>Temperatura Média</Text>
                <Text style={estilos.cardValor}>{mediaTemperatura.toFixed(1)} °C</Text>
              </View>
            </TourStep>
          </View>

          {/* AÇÕES RÁPIDAS */}
          <Text style={estilos.subtitulo}>Ações Rápidas</Text>

          <View style={estilos.acoesContainer}>
            <TourStep stepKey="gerenciar-placas" title="Gerenciar Placas" description="Acesse o painel de gerenciamento de placas.">
              <TouchableOpacity style={estilos.botao} onPress={() => router.push("/empresarial/placas")}>
                <Feather name="server" size={22} color="#ffc125" />
                <Text style={estilos.botaoTexto}>Gerenciar Placas</Text>
              </TouchableOpacity>
            </TourStep>

            <TourStep stepKey="relatorios" title="Relatórios" description="Veja relatórios e históricos.">
              <TouchableOpacity style={estilos.botao} onPress={() => router.push("/empresarial/relatorios")}>
                <Feather name="file-text" size={22} color="#ffc125" />
                <Text style={estilos.botaoTexto}>Relatórios</Text>
              </TouchableOpacity>
            </TourStep>

            <TourStep stepKey="configuracoes" title="Configurações" description="Ajustes e preferências do painel.">
              <TouchableOpacity style={estilos.botao} onPress={() => router.push("/empresarial/config")}>
                <Feather name="settings" size={22} color="#ffc125" />
                <Text style={estilos.botaoTexto}>Configurações</Text>
              </TouchableOpacity>
            </TourStep>
          </View>
        </ScrollView>

        {/* ChatBot e NavBar — NÃO envolver no TourStep para evitar conflitos */}
        <View style={estilos.chatBotContainer}>
          <ChatBot />
        </View>

        <NavBarEmpresarial placas={placas} setPlacas={setPlacas} />
      </View>
    </TourProvider>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafc", padding: 16, marginTop: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 2, borderColor: "#ffc125" },
  username: { fontSize: 20, fontWeight: "700", color: "#222" },
  email: { fontSize: 14, color: "#666", marginTop: 2 },
  titulo: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#111" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 5, elevation: 3, alignItems: "center" },
  cardLabel: { fontSize: 15, color: "#555", marginTop: 8, textAlign: "center" },
  cardValor: { fontSize: 20, fontWeight: "bold", color: "#111", marginTop: 6, textAlign: "center" },
  subtitulo: { marginTop: 25, fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#222" },
  acoesContainer: { gap: 12 },
  botao: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  botaoTexto: { fontSize: 16, color: "#000", fontWeight: "600" },
  chatBotContainer: { position: "absolute", bottom: 80, right: 16, zIndex: 1000 },
});
