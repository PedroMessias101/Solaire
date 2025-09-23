import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ContaScreen() {
  const router = useRouter();

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
      setTelefone(userObj?.telefone || ""); // só se existir no backend
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    } finally {
      setLoading(false);
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
    <ScrollView style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <Ionicons
          name="arrow-back"
          size={22}
          color="#000"
          onPress={() => router.push("/tabs/home")}
        />
        <Text style={estilos.tituloCabecalho}>Minha Conta</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Campos de informações */}
      <Text style={estilos.label}>Nome</Text>
      <TextInput style={estilos.input} value={nome} onChangeText={setNome} />

      <Text style={estilos.label}>E-mail</Text>
      <TextInput
        style={estilos.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Botão salvar */}
      <TouchableOpacity style={estilos.botao}>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
