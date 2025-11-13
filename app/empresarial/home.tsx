import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ChatBot from "../components/ChatBot";
import { NavBarEmpresarial } from "../components/NavBarEmpresarial";
import Notificacoes from "../components/notific";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [filialSelecionada, setFilialSelecionada] = useState("Matriz");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placas, setPlacas] = useState([]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const filiais = ["Matriz", "Filial RJ", "Filial SP"];

  const dadosRelatorio = {
    irradiacao: "5.8 kWh/m²",
    corrente: "12.4 A",
    tensao: "220 V",
    potencia: "2.3 kW",
    co2: "1.245 kg",
    ranking: ["Todas - 17.200 kWh", "Filial RJ - 9.800 kWh", "Filial SP - 7.400 kWh"],
    projecao: "Economia anual: R$ 38.200, ROI estimado: 3,5 anos",
  };

  // Animação do sol
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

  const abrirModal = () => {
    setModalVisivel(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fecharModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisivel(false);
    });
  };

  const selecionarFilial = (filial) => {
    setFilialSelecionada(filial);
    fecharModal();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const opacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.container} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={estilos.header}>
          <TouchableOpacity onPress={abrirModal}>
            <Image
              source={require("../../assets/logo_empresarial.png")}
              style={estilos.avatar}
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={estilos.username}>Empresarial</Text>
            <Text style={estilos.email}>Painel Gerencial</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Notificacoes />
            <TouchableOpacity
              style={estilos.settingsButton}
              onPress={() => router.push("/empresarial/config")}
            >
              <Feather name="settings" size={25} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sub-header */}
        <View style={estilos.subHeader}>
          <TouchableOpacity style={estilos.botaoFilial} onPress={abrirModal}>
            <Text style={estilos.filialTexto}>{filialSelecionada}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>

        </View>

    
        <View style={estilos.grid}>
          {[
            { label: "Irradiação", value: dadosRelatorio.irradiacao, icon: "weather-sunny", color: "#FFA726" },
            { label: "Corrente", value: dadosRelatorio.corrente, icon: "flash", color: "#FFC107" },
            { label: "Tensão", value: dadosRelatorio.tensao, icon: "sine-wave", color: "#FFB300" },
            { label: "Potência", value: dadosRelatorio.potencia, icon: "chart-line", color: "#FFB300" },
          ].map((item, index) => (
            <View key={index} style={estilos.card}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              <Text style={estilos.cardLabel}>{item.label}</Text>
              <Text style={estilos.cardValor}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={estilos.cardFull}>
            <MaterialCommunityIcons name="leaf" size={28} color="#4CAF50" />
            <Text style={estilos.cardLabel}>CO₂ evitado</Text>
            <Text style={[estilos.cardValor, { color: "#333" }]}>{dadosRelatorio.co2}</Text>
          </View>

          <View style={estilos.cardFull}>
            <MaterialCommunityIcons name="office-building" size={28} color="#3F51B5" />
            <Text style={estilos.cardLabel}>Ranking de Unidades</Text>
            {dadosRelatorio.ranking.map((item, i) => (
              <Text key={i} style={estilos.rankingItem}>{item}</Text>
            ))}
          </View>

          <View style={estilos.cardFull}>
            <MaterialCommunityIcons name="cash-multiple" size={28} color="#FF9800" />
            <Text style={estilos.cardLabel}>Projeção Financeira</Text>
            <Text style={estilos.rankingItem}>{dadosRelatorio.projecao}</Text>
          </View>
        </View>
      </ScrollView>


      <View style={estilos.chatBotContainer}>
        <ChatBot />
      </View>


      {modalVisivel && (
        <View style={estilos.modalContainer}>
          <Animated.View style={[estilos.modalOverlay, { opacity }]}>
            <TouchableOpacity style={estilos.modalBackground} activeOpacity={1} onPress={fecharModal} />
          </Animated.View>

          <Animated.View
            style={[estilos.modalContent, { transform: [{ translateY }], opacity: fadeAnim }]}
          >
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>Selecionar Filial</Text>
              <TouchableOpacity onPress={fecharModal}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {filiais.map((filial, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  estilos.modalItem,
                  filial === filialSelecionada && estilos.modalItemSelecionado,
                ]}
                onPress={() => selecionarFilial(filial)}
              >
                <Text
                  style={[
                    estilos.modalTexto,
                    filial === filialSelecionada && estilos.modalTextoSelecionado,
                  ]}
                >
                  {filial}
                </Text>
                {filial === filialSelecionada && (
                  <MaterialCommunityIcons name="check" size={20} color="#FFC107" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      )}

      <NavBarEmpresarial placas={placas} setPlacas={setPlacas} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  username: {
    fontWeight: "700",
    color: "#000",
    fontSize: 18,
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  settingsButton: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  botaoFilial: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filialTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  botaoExportar: {
    backgroundColor: "#FFC107",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  botaoExportarTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  cardFull: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },
  cardValor: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 4,
    textAlign: "center",
  },
  rankingItem: {
    marginTop: 6,
    fontSize: 14,
    color: "#444",
  },
  chatBotContainer: {
    position: "absolute",
    bottom: 80,
    right: 16,
    zIndex: 1000,
  },
  modalContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemSelecionado: {
    backgroundColor: "#fff8e1",
  },
  modalTexto: {
    fontSize: 14,
    color: "#333",
  },
  modalTextoSelecionado: {
    color: "#000",
    fontWeight: "600",
  },
});
