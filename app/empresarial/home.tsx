import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ExportarPDF from "../components/ExportarPDF";

export default function HomeScreen() {
  const [filialSelecionada, setFilialSelecionada] = useState("Matriz");
  const [modalVisivel, setModalVisivel] = useState(false);

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

  return (
    <ScrollView style={estilos.container}>
      {/* Seleção de filial */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => setModalVisivel(true)}>
          <Text style={estilos.filialTexto}>{filialSelecionada} ▼</Text>
        </TouchableOpacity>
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

        {/* Botão Exportar PDF */}
        <ExportarPDF
          filial={filialSelecionada}
          dados={dadosRelatorio}
          styleBotao={[estilos.botaoRelatorio, { backgroundColor: "#ffc125" }]}
          styleTexto={[estilos.botaoTexto, { color: "#000" }]}
        />
      </View>

      {/* Modal de troca de filial */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>Selecionar Filial</Text>
            {filiais.map((filial, index) => (
              <TouchableOpacity
                key={index}
                style={estilos.modalItem}
                onPress={() => {
                  setFilialSelecionada(filial);
                  setModalVisivel(false);
                }}
              >
                <Text style={estilos.modalTexto}>{filial}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[estilos.modalItem, { backgroundColor: "#eee" }]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={{ color: "#444" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Estilos
const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  header: { alignItems: "center", marginBottom: 15 },
  filialTexto: { fontSize: 18, fontWeight: "700", color: "#000" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
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
  cardLabel: { fontSize: 14, color: "#777", marginTop: 8 },
  cardValor: { fontSize: 18, fontWeight: "bold", color: "#222", marginTop: 4 },
  rankingItem: { marginTop: 6, fontSize: 14, color: "#444" },
  botaoRelatorio: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  botaoTexto: { fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalTitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  modalItem: { padding: 12, width: "100%", alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
  modalTexto: { fontSize: 16, color: "#333" },
});
