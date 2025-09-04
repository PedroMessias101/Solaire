import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from 'expo-linear-gradient';

export default function TelaInicial() {
  const hoje = new Date();
  const [dataSelecionada, setDataSelecionada] = useState(hoje);

  const hora = hoje.getHours();
  const saudacao =
    hora < 12 ? "Bom dia, Vannessa" : hora < 18 ? "Boa tarde, Vannessa" : "Boa noite, Vannessa";

  // Gradiente que muda de acordo com o mmnt do dia
  let coresGradiente;
  let corTextoCabecalho;

  if (hora < 12) {
    coresGradiente = ["#4aacd9ff", "#daf1fcff"]; // manhã
    corTextoCabecalho = "#333";
  } else if (hora < 18) {
    coresGradiente = ["#9f8fccff", "#f2f8ccff"]; // tarde
    corTextoCabecalho = "#333";
  } else {
    coresGradiente = ["#1e2c39ff", "#4560b1ff"]; // noite
    corTextoCabecalho = "#fff";
  }

  const formatarData = (data) => {
    return data.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };

  const dias = [];
  for (let i = -1; i <= 1; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push(d);
  }

  return (
    <ScrollView style={estilos.tela}>
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
            Suas Atividades
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

      {/* Energia com gráfico circular */}
      <View style={estilos.caixaEnergia}>
        <GraficoCircular progresso={70} />
        <Text style={estilos.rotuloEnergia}>Energia Total</Text>
      </View>
    </ScrollView>
  );
}

// Gráfico circular
function GraficoCircular({ size = 120, strokeWidth = 10, progresso = 70, cor = "#0a3a5a" }) {
  const raio = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const deslocamento = circunferencia - (progresso / 100) * circunferencia;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#e6f2f9"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={raio}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={cor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={raio}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          strokeDashoffset={deslocamento}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{
        position: "absolute",
        fontSize: 22,
        fontWeight: "bold",
        color: "#333"
      }}>
        {progresso}%
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#fafafaff",
  },
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  linhaPerfil: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 80,
    zIndex: 1,
    paddingHorizontal: 20,
  },
  imagemPerfil: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  saudacao: {
    fontSize: 20,
    fontWeight: "600",
  },
  infoCabecalho: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  dataHoje: {
    fontSize: 14,
    marginBottom: 5,
  },
  tituloAtividades: {
    fontSize: 22,
    fontWeight: "bold",
  },
  linhaDias: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
    width: "100%",
    paddingHorizontal: 10,
  },
  botaoDia: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  textoDia: {
    fontSize: 14,
    color: "#707070ff",
  },
  botaoDiaAtivo: {
    backgroundColor: "#0a3a5a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  textoDiaAtivo: {
    color: "#fff",
    fontWeight: "bold",
  },
  caixaEnergia: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rotuloEnergia: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },
});
