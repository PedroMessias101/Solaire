import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_APP = "https://solaire-back-oficial.onrender.com"; // backend do app
const API_SIM = "https://placa-api-eaho.onrender.com"; // API de simulação

interface Placa {
  id: number;
  serial: string;
  location: string;
  model: string;
  status?: string;
  energiaHoje?: number;
}

export default function CadastroPlaca() {
  const [placasCadastradas, setPlacasCadastradas] = useState<Placa[]>([]);
  const [nomePlaca, setNomePlaca] = useState("");
  const [idSim, setIdSim] = useState(""); // id da placa na API de simulação
  const [token, setToken] = useState("");

  useEffect(() => {
    const carregarToken = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      if (savedToken) setToken(savedToken);
    };
    carregarToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const carregarPlacas = async () => {
      try {
        const res = await fetch(`${API_APP}/panels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPlacasCadastradas(data.data || []);
      } catch (err) {
        console.log("Erro ao carregar placas:", err);
      }
    };

    carregarPlacas();
  }, [token]);

  const salvarPlaca = async () => {
    if (!nomePlaca || !idSim) {
      Alert.alert("Erro", "Preencha o nome da placa e o ID da simulação.");
      return;
    }

    try {
      // 1️⃣ Buscar placa na API de simulação
      const resSim = await fetch(`${API_SIM}/panel/${idSim}`);
      const simData = await resSim.json();
      console.log("Dados da simulação:", simData);

      if (!simData.code) {
        Alert.alert("Erro", "Código da placa não encontrado na simulação.");
        return;
      }

      // 2️⃣ Enviar para backend do app
      const resApp = await fetch(`${API_APP}/panels/provision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: simData.code,  // obrigatório
          location: nomePlaca,
          model: "Padrão",
        }),
      });

      const dataApp = await resApp.json();

      if (!resApp.ok) {
        Alert.alert("Erro", dataApp.error || "Não foi possível cadastrar a placa.");
        return;
      }

      // Normalizar dados para exibição
      const novaPlaca: Placa = {
        id: dataApp.panel.id,
        serial: simData.code,
        location: nomePlaca,
        model: "Padrão",
        status: simData.status ?? "Desconhecido",
        energiaHoje: simData.energia_kWh ?? 0,
      };

      setPlacasCadastradas((prev) => [...prev, novaPlaca]);
      setNomePlaca("");
      setIdSim("");
      Alert.alert("Sucesso!", "Placa cadastrada com sucesso.");
    } catch (err) {
      console.log("Erro ao cadastrar placa:", err);
      Alert.alert("Erro", "Erro ao cadastrar placa.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Placa Solar</Text>

      <TextInput
        placeholder="Nome da placa"
        value={nomePlaca}
        onChangeText={setNomePlaca}
        style={styles.input}
      />

      <TextInput
        placeholder="ID da simulação"
        value={idSim}
        onChangeText={setIdSim}
        style={styles.input}
      />

      <Button title="Cadastrar" onPress={salvarPlaca} />

      <Text style={styles.subtitle}>Placas Cadastradas:</Text>
      <FlatList
        data={placasCadastradas}
        keyExtractor={(item) => item.serial}
        renderItem={({ item }) => (
          <View style={styles.placaItem}>
            <Text>{item.location}</Text>
            <Text style={{ fontSize: 12 }}>{item.serial}</Text>
            <Text style={{ fontSize: 12 }}>{item.model}</Text>
            <Text style={{ fontSize: 12 }}>Status: {item.status}</Text>
            <Text style={{ fontSize: 12 }}>Produção Hoje: {item.energiaHoje?.toFixed(2) || 0} kWh</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 10, borderRadius: 8 },
  placaItem: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
});
