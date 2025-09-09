import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Lista inicial de placas solares
const placasIniciais = [
  { id: "1", nome: "Placa Solar 1" },
  { id: "2", nome: "Placa Solar 2" },
  { id: "3", nome: "Placa Solar 3" },
  { id: "4", nome: "Placa Solar 4" },
  { id: "5", nome: "Placa Solar 5" },
  { id: "6", nome: "Placa Solar 6" },
];

export default function SelecionarPlaca() {
  // Estado para lista de placas (permite atualizar nomes)
  const [placas, setPlacas] = useState(placasIniciais);
  // Estado para placa selecionada
  const [selecionada, setSelecionada] = useState(null);
  // Estado para edição
  const [editandoId, setEditandoId] = useState(null);
  const [novoNome, setNovoNome] = useState("");

  // Seleciona uma placa
  const handleSelecionar = (placa) => {
    setSelecionada(placa.id);
  };

  // Inicia edição do nome da placa
  const iniciarEdicao = (placa) => {
    setEditandoId(placa.id);
    setNovoNome(placa.nome);
  };

  // Salva novo nome da placa
  const salvarNome = (id) => {
    setPlacas(placas.map(p => p.id === id ? { ...p, nome: novoNome } : p));
    setEditandoId(null);
    setNovoNome("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecione a placa para monitorar:</Text>
      <FlatList
        data={placas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.placa,
              selecionada === item.id && styles.placaSelecionada,
            ]}
            onPress={() => handleSelecionar(item)}
            activeOpacity={0.8}
          >
            <View style={styles.linhaPlaca}>
              {editandoId === item.id ? (
                <>
                  <TextInput
                    style={[styles.nomePlaca, styles.inputNome]}
                    value={novoNome}
                    onChangeText={setNovoNome}
                    onSubmitEditing={() => salvarNome(item.id)}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => salvarNome(item.id)}>
                    <MaterialIcons name="check" size={22} color="#0a3a5a" style={{ marginLeft: 12 }} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.nomePlaca}>{item.nome}</Text>
                  <TouchableOpacity onPress={() => iniciarEdicao(item)}>
                    <MaterialIcons name="edit" size={22} color="#0a3a5a" style={{ marginLeft: 12 }} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fafafa",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  placa: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#e6f2f9",
    marginBottom: 14,
  },
  placaSelecionada: {
    backgroundColor: "#f5f250c4",
  },
  linhaPlaca: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nomePlaca: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
inputNome: {
  borderBottomWidth: 1,
  borderColor: "#ccc",
  flex: 1,
},
});