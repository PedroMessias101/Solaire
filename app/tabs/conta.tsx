import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";

export default function ContaScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(true);

  // Buscar usuário logado
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch("https://solaireapp.onrender.com/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      const userObj = data?.user || data?.data || data;

      setNome(userObj?.name || "");
      setEmail(userObj?.email || "");
      setTelefone(userObj?.telefone || "");
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await fetch("https://solaireapp.onrender.com/users/me", {
        method: "PUT", // ou PATCH dependendo da API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nome, email, telefone }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Sucesso", "Alterações salvas com sucesso!");
      } else {
        Alert.alert("Erro", data.message || "Não foi possível salvar alterações.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao salvar alterações.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={estilos.loading}>
        <ActivityIndicator size="large" color="#fcbb30" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={estilos.tela}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloCabecalho}>Minha Conta</Text>
        </View>

        {/* Campos de informações */}
        <Text style={estilos.label}>Nome</Text>
        <TextInput
          style={estilos.input}
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <Text style={estilos.label}>E-mail</Text>
        <TextInput
          style={estilos.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={estilos.label}>Telefone</Text>
        <TextInput
          style={estilos.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        {/* Botão salvar */}
        <TouchableOpacity style={estilos.botao} onPress={salvarAlteracoes}>
          <Text style={estilos.textoBotao}>Salvar Alterações</Text>
        </TouchableOpacity>

        {/* Alterar senha */}
        <TouchableOpacity
          style={[estilos.botao, estilos.botaoSecundario]}
          onPress={() => router.push("/tabs/alterar-senha")}
        >
          <Text style={estilos.textoBotaoSecundario}>Alterar Senha</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de navegação fixa */}
      <AnimatedBottomNavBar
        activeIndex={activeIndex}
        onTabPress={setActiveIndex}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  cabecalho: {
    marginBottom: 20,
  },
  tituloCabecalho: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#000",
  },
  botao: {
    backgroundColor: "#fcbb30",
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },
  textoBotao: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  botaoSecundario: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 12,
  },
  textoBotaoSecundario: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
