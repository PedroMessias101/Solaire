import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";

export default function ManutencaoPlaca() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>Instruções de Manutenção da Placa Solar</Text>
      <Text style={styles.subtitulo}>
        Siga as etapas abaixo para realizar a manutenção de forma segura e eficiente:
      </Text>

      <View style={styles.etapa}>
        <MaterialIcons name="power-settings-new" size={28} color="#555" />
        <View style={styles.textoContainer}>
          <Text style={styles.etapaTitulo}>1. Desligue o sistema</Text>
          <Text style={styles.etapaDescricao}>
            Antes de iniciar qualquer manutenção, desligue a energia do inversor e da placa solar para
            evitar riscos elétricos.
          </Text>
        </View>
      </View>

      <View style={styles.etapa}>
        <FontAwesome5 name="tools" size={26} color="#555" />
        <View style={styles.textoContainer}>
          <Text style={styles.etapaTitulo}>2. Faça a inspeção visual</Text>
          <Text style={styles.etapaDescricao}>
            Verifique se há rachaduras, sujeira excessiva, parafusos soltos ou cabos danificados.
          </Text>
        </View>
      </View>

      <View style={styles.etapa}>
        <Entypo name="water" size={28} color="#555" />
        <View style={styles.textoContainer}>
          <Text style={styles.etapaTitulo}>3. Limpeza das placas</Text>
          <Text style={styles.etapaDescricao}>
            Utilize água limpa e um pano macio. Evite produtos químicos e realize a limpeza em horários de menor sol.
          </Text>
        </View>
      </View>

      <View style={styles.etapa}>
        <FontAwesome5 name="bolt" size={26} color="#555" />
        <View style={styles.textoContainer}>
          <Text style={styles.etapaTitulo}>4. Verifique conexões elétricas</Text>
          <Text style={styles.etapaDescricao}>
            Certifique-se de que todos os cabos e conectores estejam firmes e sem sinais de corrosão.
          </Text>
        </View>
      </View>

      <View style={styles.etapa}>
        <MaterialIcons name="check-circle" size={28} color="#555" />
        <View style={styles.textoContainer}>
          <Text style={styles.etapaTitulo}>5. Ligue novamente o sistema</Text>
          <Text style={styles.etapaDescricao}>
            Após finalizar, religue o inversor e verifique se a geração de energia voltou ao normal.
          </Text>
        </View>
      </View>

      <Text style={styles.obs}>
        ⚠️ Recomenda-se realizar a manutenção a cada 3 a 6 meses, ou sempre que houver redução na
        eficiência da geração.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  etapa: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  textoContainer: {
    marginLeft: 15,
    flex: 1,
  },
  etapaTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  etapaDescricao: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  obs: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});
