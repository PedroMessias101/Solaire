import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import ExportarPDF from "../components/ExportarPDF";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBarEmpresarial";
import { useRouter } from "expo-router";
import Notificacoes from "../components/notific";
import ChatBot from "../components/ChatBot";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [filialSelecionada, setFilialSelecionada] = useState("Matriz");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
  React.useEffect(() => {
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
      })
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
      })
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
    outputRange: [-20, 0], // Animação mais curta
  });

  const opacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header com avatar, usuário e configurações */}
        <View style={estilos.header}>
          <TouchableOpacity onPress={abrirModal}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
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
              onPress={() => router.push("./config")}
            >
              <Feather name="settings" size={25} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seleção de filial e botão exportar */}
        <View style={estilos.subHeader}>
          <TouchableOpacity 
            style={estilos.botaoFilial}
            onPress={abrirModal}
          >
            <Text style={estilos.filialTexto}>{filialSelecionada}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>
          
          {/* Botão Exportar PDF no canto superior direito */}
          <ExportarPDF
            filial={filialSelecionada}
            dados={dadosRelatorio}
            styleBotao={estilos.botaoExportar}
            styleTexto={estilos.botaoExportarTexto}
          />
        </View>

        {/* Grid de métricas */}
        <View style={estilos.grid}>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="weather-sunny" size={28} color="#FFA726" />
            <Text style={estilos.cardLabel}>Irradiação</Text>
            <Text style={estilos.cardValor}>{dadosRelatorio.irradiacao}</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="flash" size={28} color="#ffc125" />
            <Text style={estilos.cardLabel}>Corrente</Text>
            <Text style={estilos.cardValor}>{dadosRelatorio.corrente}</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="sine-wave" size={28} color="#ffc125" />
            <Text style={estilos.cardLabel}>Tensão</Text>
            <Text style={estilos.cardValor}>{dadosRelatorio.tensao}</Text>
          </View>
          <View style={estilos.card}>
            <MaterialCommunityIcons name="chart-line" size={28} color="#ffc125" />
            <Text style={estilos.cardLabel}>Potência</Text>
            <Text style={estilos.cardValor}>{dadosRelatorio.potencia}</Text>
          </View>
        </View>

        {/* Cards empresariais */}
        <View style={{ marginTop: 20 }}>
          <View style={estilos.cardFull}>
            <MaterialCommunityIcons name="leaf" size={28} color="#ffc125" />
            <Text style={estilos.cardLabel}>CO₂ evitado</Text>
            <Text style={[estilos.cardValor, { color: "#333" }]}>{dadosRelatorio.co2}</Text>
          </View>

          <View style={estilos.cardFull}>
            <MaterialCommunityIcons name="office-building" size={28} color="#FFC125" />
            <Text style={estilos.cardLabel}>Ranking de Unidades</Text>
            {dadosRelatorio.ranking.map((item, i) => (
              <Text key={i} style={estilos.rankingItem}>{item}</Text>
            ))}
          </View>

          <View style={estilos.cardFull}>
            <MaterialCommunityIcons name="cash-multiple" size={28} color="#ffc125" />
            <Text style={estilos.cardLabel}>Projeção Financeira</Text>
            <Text style={estilos.rankingItem}>{dadosRelatorio.projecao}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ChatBot posicionado acima da navbar */}
      <View style={estilos.chatBotContainer}>
        <ChatBot />
      </View>

      {/* Modal animado de seleção de filial - posicionado abaixo do header */}
      {modalVisivel && (
        <View style={estilos.modalContainer}>
          <Animated.View 
            style={[
              estilos.modalOverlay,
              { opacity: opacity }
            ]}
          >
            <TouchableOpacity 
              style={estilos.modalBackground}
              activeOpacity={1}
              onPress={fecharModal}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              estilos.modalContent,
              {
                transform: [{ translateY }],
                opacity: fadeAnim,
              }
            ]}
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
                  filial === filialSelecionada && estilos.modalItemSelecionado
                ]}
                onPress={() => selecionarFilial(filial)}
              >
                <Text style={[
                  estilos.modalTexto,
                  filial === filialSelecionada && estilos.modalTextoSelecionado
                ]}>
                  {filial}
                </Text>
                {filial === filialSelecionada && (
                  <MaterialCommunityIcons name="check" size={20} color="#ffc125" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      )}

      {/* NavBar animada */}
      <AnimatedBottomNavBar activeIndex={activeIndex} onTabPress={setActiveIndex} />
    </View>
  );
}

// Estilos
const estilos = StyleSheet.create({
<<<<<<< HEAD
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
    paddingHorizontal: 16, 
    paddingTop: 40 
  },
  // Header principal com avatar
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12 
  },
  avatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    marginRight: 12, 
    borderWidth: 2, 
    borderColor: "#FFD700" 
  },
  username: { 
    fontWeight: "700", 
    color: "#000000", 
    fontSize: 18 
  },
  email: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 2 
  },
  settingsButton: { 
    marginLeft: 12, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  // Sub-header com filial e botão exportar
  subHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 15 
  },
  botaoFilial: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filialTexto: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#000",
    marginRight: 8,
  },
  // Botão exportar menor no canto superior direito
  botaoExportar: {
    backgroundColor: "#ffc125",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  botaoExportarTexto: { 
    fontSize: 12, 
    fontWeight: "600", 
    color: "#000" 
  },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
=======
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20
  },
  header: {
    alignItems: "center",
    marginBottom: 15
  },
  filialTexto: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    margin: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
>>>>>>> 8632775e1d66510bb387a51aa4ca325f5e5e39bb
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
    marginTop: 8 
  },
  cardValor: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#222", 
    marginTop: 4 
  },
  rankingItem: { 
    marginTop: 6, 
    fontSize: 14, 
    color: "#444" 
  },
  // Container do ChatBot
  chatBotContainer: {
    position: "absolute",
    bottom: 80,
    right: 0,
    zIndex: 1000,
  },
  // Estilos do modal animado - POSICIONAMENTO FIXO ABAIXO DO HEADER
  modalContainer: {
    position: 'absolute',
    top: 120, // Posição fixa abaixo do header
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelecionado: {
    backgroundColor: '#fff8e1',
  },
  modalTexto: {
    fontSize: 14,
    color: '#333',
  },
  modalTextoSelecionado: {
    color: '#000',
    fontWeight: '600',
  },
});