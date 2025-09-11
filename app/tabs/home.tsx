import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
 
export default function TelaInicial() {
  const hoje = new Date();
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
 
  const hora = hoje.getHours();
 
  useEffect(() => {
    const carregarNome = async () => {
      const nome = await AsyncStorage.getItem("userName");
      if (nome) setNomeUsuario(nome);
    };
    carregarNome();
  }, []);
 
  const saudacao = nomeUsuario
    ? hora < 12
      ? `Bom dia, ${nomeUsuario}`
      : hora < 18
        ? `Boa tarde, ${nomeUsuario}`
        : `Boa noite, ${nomeUsuario}`
    : "";
 
  let coresGradiente;
  let corTextoCabecalho;
 
  if (hora < 12) {
    coresGradiente = ["#f8ec81ff", "#ed7914ff", "#fd7a2eff"];
    corTextoCabecalho = "#333";
  } else if (hora < 18) {
    coresGradiente = ["#FFC125", "#FF4500"];
    corTextoCabecalho = "#333";
  } else {
    coresGradiente = ["#f9d86fff", "#f58d38ff", "#000000"];
    corTextoCabecalho = "#fff";
  }
 
  const formatarData = (data: Date) => {
    return data.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };
 
  const dias: Date[] = [];
  for (let i = -1; i <= 1; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push(d);
  }
 
  return (
    <ScrollView style={estilos.tela}>
      {/* Informações do topo */}
      <View style={estilos.infoTopo}>
        <Image
          source={require("../../assets/perfil-avatar.png")}
          style={estilos.imagemPerfil}
        />
        <View>
          <Text style={estilos.saudacao}>{saudacao}</Text>
         
        </View>
      </View>
      
 
      {/* Gráfico circular de eficiência */}
      <View style={estilos.circuloContainer}>
        <AnimatedCircularProgress
          size={160}
          width={16}
          fill={8}
          tintColor="#FFC125"
          backgroundColor="#BDBDBD"
          rotation={0}
        >
          {fill => (
            <Text style={estilos.percentualTexto}>{`${Math.round(fill)}%`}</Text>
          )}
        </AnimatedCircularProgress>
      </View>
      
      <View style={estilos.linhaDias}>
        {dias.map((dia, index) => {
          const selecionado = formatarData(dia) === formatarData(dataSelecionada);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setDataSelecionada(dia)}
              style={[estilos.botaoDia, selecionado && estilos.botaoDiaAtivo]}
            >
              <Text
                style={[estilos.textoDia, selecionado && estilos.textoDiaAtivo]}
              >
                {formatarData(dia)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
 
     
     
 
      {/* Cards de monitoramento */}
      <View style={estilos.gridMonitoramento}>
        <View style={[estilos.cardMonitoramento, estilos.cardVerde]}>
          <FontAwesome5 name="solar-panel" size={24} color="#2e7d32" />
          <Text style={estilos.tituloCard}>Geração Atual</Text>
          <Text style={estilos.valorCard}>3200W</Text>
          <Text style={estilos.statusCard}>Normal</Text>
        </View>
        <View style={estilos.cardMonitoramento}>
          <Feather name="thermometer" size={24} color="#1976d2" />
          <Text style={estilos.tituloCard}>Temperatura</Text>
          <Text style={estilos.valorCard}>42°C</Text>
        </View>
        <View style={estilos.cardMonitoramento}>
          <MaterialCommunityIcons name="percent" size={24} color="#0288d1" />
          <Text style={estilos.tituloCard}>Eficiência</Text>
          <Text style={estilos.valorCard}>87%</Text>
        </View>
        <View style={estilos.cardMonitoramento}>
          <MaterialCommunityIcons name="flash" size={24} color="#fbc02d" />
          <Text style={estilos.tituloCard}>Tensão</Text>
          <Text style={estilos.valorCard}>220V</Text>
        </View>
        <View style={estilos.cardMonitoramento}>
          <MaterialCommunityIcons name="current-ac" size={24} color="#7b1fa2" />
          <Text style={estilos.tituloCard}>Corrente</Text>
          <Text style={estilos.valorCard}>14A</Text>
        </View>
        <View style={estilos.cardMonitoramento}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#e53935" />
          <Text style={estilos.tituloCard}>Status</Text>
          <Text style={estilos.valorCard}>Sem alertas</Text>
        </View>
      </View>
    </ScrollView>
  );
}
 
const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#ededed" },
  infoTopo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  imagemPerfil: {
    width: 60,
    height: 60,
    marginRight: 14,
    borderColor: "#rgba(0,0,0,0.00)",
    borderWidth: 3,
    borderRadius: 30,
  },
  saudacao: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  dataHoje: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  circuloContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  percentualTexto: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFC125",
    marginTop: 8,
  },
  linhaDias: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 18,
    width: "100%",
    paddingHorizontal: 10,
    height: 33,
  },
  botaoDia: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  textoDia: {
    fontSize: 14,
    color: "#707070ff",
  },
  botaoDiaAtivo: {
    backgroundColor: "#000",
    borderColor: "#FFC125",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  textoDiaAtivo: {
    color: "#FFC125",
    fontWeight: "bold",
  },
  gridMonitoramento: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 18,
    marginTop: 10,
  },
  cardMonitoramento: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "47%",
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardVerde: {
    backgroundColor: "#e6f9ed",
    borderColor: "#4aacd9",
    borderWidth: 1,
  },
  tituloCard: {
    fontSize: 13,
    color: "#333",
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "bold",
  },
  valorCard: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusCard: {
    fontSize: 12,
    color: "#2e7d32",
    backgroundColor: "#d2f7e6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
});
 