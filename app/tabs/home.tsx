import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TelaInicial() {
  const hoje = new Date();
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

  const hora = hoje.getHours();

  // Carregar nome do usuário logado do AsyncStorage
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
      {/* Cabeçalho azul */}
      <View style={estilos.cabecalho}>
        <LinearGradient
          colors={coresGradiente}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 3 }}
          style={estilos.fundoGradiente}
        />

        <View style={estilos.linhaPerfil}>
          <Image
            source={require("../../assets/perfil-avatar.png")}
            style={estilos.imagemPerfil}
          />
          <Text style={[estilos.saudacao, { color: corTextoCabecalho }]}>
            {saudacao}
          </Text>
        </View>

        <View style={estilos.infoCabecalho}>
          <Text style={[estilos.dataHoje, { color: corTextoCabecalho }]}>
            Hoje,{" "}
            {hoje.toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "short",
            })}
          </Text>
          <Text style={[estilos.tituloAtividades, { color: corTextoCabecalho }]}>
            Monitoramento das Placas Solares
          </Text>
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
      </View>

      {/* Caixinhas de monitoramento das placas solares */}
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
  tela: { flex: 1, backgroundColor: "#fafafaff" },
  cabecalho: {
    paddingBottom: 2,
    alignItems: "center",
    position: "relative",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: "hidden",
  },
  fundoGradiente: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 310,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    zIndex: 0,
  },
  linhaPerfil:
  {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 80,
    zIndex: 1,
    paddingHorizontal: 20
  },
  imagemPerfil:
  {
    width: 60,
    height: 60,
    marginRight: 12,
    borderColor: "#0a3a5aff",
    borderWidth: 3,
    borderRadius: 30
  },
  saudacao:
  {
    fontSize: 20,
    fontWeight: "600"
  },
  infoCabecalho:
  {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20
  },
  dataHoje:
  {
    fontSize: 14,
    marginBottom: 5
  },
  tituloAtividades:
  {
    fontSize: 22,
    fontWeight: "bold"
  },
  linhaDias:
  {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
    width: "100%",
    paddingHorizontal: 10
  },
  botaoDia:
  {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  textoDia:
  {
    fontSize: 14,
    color: "#707070ff"
  },
  botaoDiaAtivo:
  {
    backgroundColor: "#0a3a5a",
    shadowColor: "#000",
    shadowOffset:
    {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  textoDiaAtivo:
  {
    color: "#fff",
    fontWeight: "bold"
  },
  gridMonitoramento:
  {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 18,
    marginTop: 10
  },
  cardMonitoramento:
  {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "47%",
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  cardVerde:
  {
    backgroundColor: "#e6f9ed",
    borderColor: "#4aacd9",
    borderWidth: 1
  },
  tituloCard:
  {
    fontSize: 13,
    color: "#333",
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "bold"
  },
  valorCard:
  {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333"
  },
  statusCard:
  {
    fontSize: 12,
    color: "#2e7d32",
    backgroundColor: "#d2f7e6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4
  },
});
