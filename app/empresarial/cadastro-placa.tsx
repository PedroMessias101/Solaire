// CadastroPlaca.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_APP = "https://solaireapp.onrender.com";
const API_SIM = "https://placa-api-eaho.onrender.com";

interface Placa {
  id?: number;
  serial?: string;
  localizacao?: string;
  modelo?: string;
  empresa?: string;
  cnpj?: string;
  responsavel?: string;
  status?: string;
  energiaHoje?: number;
}

export default function CadastroPlaca(): JSX.Element {
  const [placasCadastradas, setPlacasCadastradas] = useState<Placa[]>([]);
  const [nomePlaca, setNomePlaca] = useState("");
  const [idSimulacao, setIdSimulacao] = useState("");
  const [token, setToken] = useState("");

  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");

  const [carregandoPlacas, setCarregandoPlacas] = useState(false);
  const [carregandoCadastro, setCarregandoCadastro] = useState(false);

  useEffect(() => {
    const carregarToken = async () => {
      try {
        const tokenSalvo = await AsyncStorage.getItem("userToken");
        if (tokenSalvo) setToken(tokenSalvo);
      } catch (erro) {
        console.log("Erro ao carregar token:", erro);
      }
    };
    carregarToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const carregarPlacas = async () => {
      setCarregandoPlacas(true);
      try {
        const resposta = await fetch(`${API_APP}/panels`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resposta.ok) {
          const texto = await resposta.text();
          console.log("Erro ao buscar panels:", resposta.status, texto);
          setPlacasCadastradas([]);
          return;
        }

        const dados = await resposta.json();
        // segurança: suporte para formatos diferentes
        setPlacasCadastradas(dados?.data ?? dados ?? []);
      } catch (erro) {
        console.log("Erro ao carregar placas:", erro);
        setPlacasCadastradas([]);
      } finally {
        setCarregandoPlacas(false);
      }
    };

    carregarPlacas();
  }, [token]);

  const cadastrarPlaca = async () => {
    if (!nomePlaca || !idSimulacao || !nomeEmpresa || !nomeResponsavel) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    setCarregandoCadastro(true);
    try {
      // Buscar dados da simulação
      const respostaSimulacao = await fetch(`${API_SIM}/panel/${idSimulacao}`);

      if (!respostaSimulacao.ok) {
        const texto = await respostaSimulacao.text();
        console.log("Erro na simulação:", respostaSimulacao.status, texto);
        Alert.alert("Erro", "ID de simulação inválido ou serviço indisponível.");
        return;
      }

      const dadosSimulacao = await respostaSimulacao.json();

      if (!dadosSimulacao?.code) {
        console.log("Resposta simulação sem code:", dadosSimulacao);
        Alert.alert("Erro", "Código da simulação não encontrado.");
        return;
      }

      // Enviar dados para o backend do app
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

      if (!respostaApp.ok) {
        const texto = await respostaApp.text();
        console.log("Erro ao cadastrar no app:", respostaApp.status, texto);
        let mensagem = "Erro ao cadastrar a placa.";
        try {
          const jsonErro = JSON.parse(texto);
          mensagem = jsonErro?.error || mensagem;
        } catch {
          // texto não é JSON
        }
        Alert.alert("Erro", mensagem);
        return;
      }

      const dadosApp = await respostaApp.json();

      const novaPlaca: Placa = {
        id: dadosApp?.panel?.id ?? Date.now(),
        serial: dadosSimulacao.code,
        localizacao: nomePlaca,
        modelo: "Padrão",
        empresa: nomeEmpresa,
        cnpj: cnpjEmpresa,
        responsavel: nomeResponsavel,
        status: dadosSimulacao.status ?? "Desconhecido",
        energiaHoje: dadosSimulacao.energia_kWh ?? 0,
      };

      setPlacasCadastradas((anteriores) => [novaPlaca, ...anteriores]);

      // Limpar campos
      setNomePlaca("");
      setIdSimulacao("");
      setNomeEmpresa("");
      setCnpjEmpresa("");
      setNomeResponsavel("");

      Alert.alert("Sucesso", "Placa empresarial cadastrada com sucesso.");
    } catch (erro) {
      console.log("Erro ao cadastrar placa (catch):", erro);
      Alert.alert("Erro", "Ocorreu um erro ao cadastrar a placa.");
    } finally {
      setCarregandoCadastro(false);
    }
  };

  const renderarItemPlaca = ({ item }: { item: Placa }) => (
    <View style={estilos.cardPlaca}>
      <View style={estilos.cabecalhoCard}>
        <View style={estilos.iconeCard}>
          <Text style={estilos.iconeEmoji}>🔆</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.tituloCard}>{item.localizacao}</Text>
          <Text style={estilos.textoSecundario}>S/N: {item.serial}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={estilos.textoSecundario}>Status</Text>
          <Text style={estilos.valorDestaque}>{item.status}</Text>
        </View>
      </View>

      <View style={estilos.linhaInfo}>
        <View style={estilos.infoBloco}>
          <Text style={estilos.textoSecundario}>Modelo</Text>
          <Text style={estilos.valorDestaque}>{item.modelo}</Text>
        </View>

        <View style={estilos.infoBloco}>
          <Text style={estilos.textoSecundario}>Produção hoje</Text>
          <Text style={estilos.valorDestaque}>
            {Number(item.energiaHoje ?? 0).toFixed(2)} kWh
          </Text>
        </View>
      </View>

      <View style={estilos.rodapeCard}>
        <Text style={estilos.textoSecundario}>Empresa: {item.empresa}</Text>
        <Text style={estilos.textoSecundario}>Responsável: {item.responsavel}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={estilos.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={estilos.titulo}>Cadastro de Placa Solar Empresarial</Text>

        <View style={estilos.blocoFormulario}>
          <Text style={estilos.labelCampo}>Nome da placa (opcional)</Text>
          <TextInput
            placeholder="Ex.: Cobertura Principal"
            value={nomePlaca}
            onChangeText={setNomePlaca}
            style={estilos.campoInput}
            placeholderTextColor="#9AA0A6"
          />

          <Text style={estilos.labelCampo}>ID da placa</Text>
          <TextInput
            placeholder="Ex.: 12345"
            value={idSimulacao}
            onChangeText={setIdSimulacao}
            style={estilos.campoInput}
            placeholderTextColor="#9AA0A6"
          />

          <Text style={estilos.labelCampo}>Nome da empresa</Text>
          <TextInput
            placeholder="Nome da empresa"
            value={nomeEmpresa}
            onChangeText={setNomeEmpresa}
            style={estilos.campoInput}
            placeholderTextColor="#9AA0A6"
          />

          <Text style={estilos.labelCampo}>CNPJ (obrigatorio)</Text>
          <TextInput
            placeholder="00.000.000/0000-00"
            value={cnpjEmpresa}
            onChangeText={setCnpjEmpresa}
            style={estilos.campoInput}
            placeholderTextColor="#9AA0A6"
          />

          <Text style={estilos.labelCampo}>Responsável</Text>
          <TextInput
            placeholder="Nome do responsável"
            value={nomeResponsavel}
            onChangeText={setNomeResponsavel}
            style={estilos.campoInput}
            placeholderTextColor="#9AA0A6"
          />

          <TouchableOpacity
            style={[estilos.botaoPrincipal, carregandoCadastro && { opacity: 0.8 }]}
            onPress={cadastrarPlaca}
            disabled={carregandoCadastro}
          >
            {carregandoCadastro ? (
              <ActivityIndicator />
            ) : (
              <Text style={estilos.textoBotao}>Cadastrar placa</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={estilos.subtitulo}>Placas cadastradas</Text>

        {carregandoPlacas ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : placasCadastradas.length === 0 ? (
          <View style={estilos.cardVazio}>
            <Text style={estilos.iconeInfo}>ℹ️</Text>
            <Text style={estilos.textoVazioTitulo}>Nenhuma placa cadastrada ainda</Text>
            <Text style={estilos.textoVazioDescricao}>
              Adicione placas usando o botão acima.
            </Text>
          </View>
        ) : (
          <FlatList
            data={placasCadastradas}
            keyExtractor={(item) => String(item.id ?? item.serial ?? Math.random())}
            renderItem={renderarItemPlaca}
            contentContainerStyle={{ paddingTop: 8 }}
            scrollEnabled={false} // controlado pelo ScrollView
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111115",
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111115",
    marginTop: 18,
    marginBottom: 8,
  },
  blocoFormulario: {
    backgroundColor: "transparent",
    paddingBottom: 4,
  },
  labelCampo: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 10,
  },
  campoInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  botaoPrincipal: {
    marginTop: 16,
    backgroundColor: "#F7B500",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F7B500",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  textoBotao: {
    color: "#0B0B0B",
    fontWeight: "700",
    fontSize: 16,
  },
  cardPlaca: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cabecalhoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconeCard: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF8E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconeEmoji: {
    fontSize: 22,
  },
  tituloCard: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B0B0B",
  },
  textoSecundario: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  valorDestaque: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111115",
    marginTop: 4,
  },
  linhaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  infoBloco: {
    flex: 1,
    paddingRight: 8,
  },
  rodapeCard: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F3",
    paddingTop: 10,
  },
  cardVazio: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 28,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconeInfo: {
    fontSize: 28,
    marginBottom: 8,
  },
  textoVazioTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111115",
    marginBottom: 4,
  },
  textoVazioDescricao: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});
