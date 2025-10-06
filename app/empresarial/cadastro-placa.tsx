import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_APP = "https://solaireapp.onrender.com";
const API_SIM = "https://placa-api-eaho.onrender.com";

interface Placa {
  id: number;
  serial: string;
  localizacao: string;
  modelo: string;
  empresa?: string;
  cnpj?: string;
  responsavel?: string;
  status?: string;
  energiaHoje?: number;
}

export default function CadastroPlaca() {
  const [placasCadastradas, setPlacasCadastradas] = useState<Placa[]>([]);
  const [nomePlaca, setNomePlaca] = useState("");
  const [idSimulacao, setIdSimulacao] = useState("");
  const [token, setToken] = useState("");

  // Campos empresariais
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");

  useEffect(() => {
    const carregarToken = async () => {
      const tokenSalvo = await AsyncStorage.getItem("userToken");
      if (tokenSalvo) setToken(tokenSalvo);
    };
    carregarToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const carregarPlacas = async () => {
      try {
        const resposta = await fetch(`${API_APP}/panels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados = await resposta.json();
        setPlacasCadastradas(dados.data || []);
      } catch (erro) {
        console.log("Erro ao carregar placas:", erro);
      }
    };

    carregarPlacas();
  }, [token]);

  const cadastrarPlaca = async () => {
    if (!nomePlaca || !idSimulacao || !nomeEmpresa || !nomeResponsavel) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Buscar dados da simulação
      const respostaSimulacao = await fetch(`${API_SIM}/panel/${idSimulacao}`);
      const dadosSimulacao = await respostaSimulacao.json();

      if (!dadosSimulacao.code) {
        Alert.alert("Erro", "Código da placa não encontrado.");
        return;
      }

      // Enviar dados para o backend
      const respostaApp = await fetch(`${API_APP}/panels/provision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: dadosSimulacao.code,
          location: nomePlaca,
          model: "Padrão",
          empresa: nomeEmpresa,
          cnpj: cnpjEmpresa,
          responsavel: nomeResponsavel,
        }),
      });

      const dadosApp = await respostaApp.json();

      if (!respostaApp.ok) {
        Alert.alert("Erro", dadosApp.error || "Erro ao cadastrar placa.");
        return;
      }

      const novaPlaca: Placa = {
        id: dadosApp.panel.id,
        serial: dadosSimulacao.code,
        localizacao: nomePlaca,
        modelo: "Padrão",
        empresa: nomeEmpresa,
        cnpj: cnpjEmpresa,
        responsavel: nomeResponsavel,
        status: dadosSimulacao.status ?? "Desconhecido",
        energiaHoje: dadosSimulacao.energia_kWh ?? 0,
      };

      setPlacasCadastradas((placasAnteriores) => [...placasAnteriores, novaPlaca]);

      // Limpar os campos
      setNomePlaca("");
      setIdSimulacao("");
      setNomeEmpresa("");
      setCnpjEmpresa("");
      setNomeResponsavel("");

      Alert.alert("Sucesso", "Placa empresarial cadastrada com sucesso.");
    } catch (erro) {
      console.log("Erro ao cadastrar placa:", erro);
      Alert.alert("Erro", "Erro ao cadastrar placa.");
    }
  };

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Cadastro de Placa Solar Empresarial</Text>

      {/* Formulário */}
      <TextInput
        placeholder="Nome da placa"
        value={nomePlaca}
        onChangeText={setNomePlaca}
        style={estilos.input}
      />

      <TextInput
        placeholder="Nome da empresa"
        value={nomeEmpresa}
        onChangeText={setNomeEmpresa}
        style={estilos.input}
      />

      <TextInput
        placeholder="CNPJ (opcional)"
        value={cnpjEmpresa}
        onChangeText={setCnpjEmpresa}
        style={estilos.input}
      />

      <TextInput
        placeholder="Responsável"
        value={nomeResponsavel}
        onChangeText={setNomeResponsavel}
        style={estilos.input}
      />

      <Button title="Cadastrar Placa" onPress={cadastrarPlaca} />

      {/* Lista */}
      <Text style={estilos.subtitulo}>Placas Cadastradas:</Text>
      <FlatList
        data={placasCadastradas}
        keyExtractor={(item) => item.serial}
        renderItem={({ item }) => (
          <View style={estilos.itemPlaca}>
            <Text>📍 {item.localizacao}</Text>
            <Text style={estilos.textoSecundario}>S/N: {item.serial}</Text>
            <Text style={estilos.textoSecundario}>Modelo: {item.modelo}</Text>
            <Text style={estilos.textoSecundario}>Empresa: {item.empresa}</Text>
            <Text style={estilos.textoSecundario}>Responsável: {item.responsavel}</Text>
            <Text style={estilos.textoSecundario}>
              Produção Hoje: {item.energiaHoje?.toFixed(2)} kWh
            </Text>
            <Text style={estilos.textoSecundario}>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitulo: { fontSize: 18, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  itemPlaca: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textoSecundario: {
    fontSize: 12,
    color: "#555",
  },
});
