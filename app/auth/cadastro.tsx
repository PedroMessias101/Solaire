import React, { useState } from "react";
import { 
  View, Text, StyleSheet, ImageBackground, 
  TouchableOpacity, TextInput, ScrollView, Alert 
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

//API Render
const API_URL = "https://solaireapp.onrender.com";

export default function TelaCadastro() {
  const navegador = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmaSenha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
    if (senha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, email, password: senha }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Usuário criado com sucesso!");
        navegador.push("/auth/login"); // Redireciona para login
      } else {
        Alert.alert("Erro", data.error || "Falha ao criar usuário");
      }
    } catch (err) {
      Alert.alert("Erro", "Erro de conexão com a API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={estilos.container}>
      <ImageBackground
        source={require("@/assets/fundo-sol.jpeg")}
        style={estilos.imagemFundo}
        resizeMode="cover"
      >
        <TouchableOpacity 
          style={estilos.botaoVoltar}
          onPress={() => navegador.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </ImageBackground>

      <View style={estilos.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text style={estilos.tituloCard}>Crie sua conta</Text>
          <Text style={estilos.subtituloCard}>Preencha os campos abaixo</Text>

          {/* Nome completo */}
          <View style={estilos.containerInput}>
            <FontAwesome5 name="user" size={16} color="#888" style={estilos.icone} />
            <TextInput
              style={estilos.input}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* Email */}
          <View style={estilos.containerInput}>
            <Ionicons name="mail" size={18} color="#888" style={estilos.icone} />
            <TextInput
              style={estilos.input}
              placeholder="E-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Senha */}
          <View style={estilos.containerInput}>
            <FontAwesome5 name="lock" size={16} color="#888" style={estilos.icone} />
            <TextInput
              style={estilos.input}
              placeholder="Senha"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <Ionicons
              name={mostrarSenha ? "eye-off" : "eye"}
              size={20}
              color="#888"
              style={estilos.iconeDireita}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            />
          </View>

          {/* Confirmar senha */}
          <View style={estilos.containerInput}>
            <FontAwesome5 name="lock" size={16} color="#888" style={estilos.icone} />
            <TextInput
              style={estilos.input}
              placeholder="Confirmar senha"
              secureTextEntry={!mostrarConfirmaSenha}
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
            />
            <Ionicons
              name={mostrarConfirmaSenha ? "eye-off" : "eye"}
              size={20}
              color="#888"
              style={estilos.iconeDireita}
              onPress={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
            />
          </View>

          {/* Botão de cadastro */}
          <TouchableOpacity 
            style={estilos.botaoCadastrar}
            onPress={handleCadastro}
            disabled={loading}
          >
            <Text style={estilos.textoBotaoCadastrar}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Text>
          </TouchableOpacity>

          {/* Link para login */}
          <View style={estilos.containerLogin}>
            <Text style={estilos.textoLogin}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navegador.push("/auth/login")}>
              <Text style={estilos.linkLogin}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e6f3f0" },
  imagemFundo: { height: 250, width: "100%" },
  botaoVoltar: { position: "absolute", top: 60, left: 20, backgroundColor: "rgba(255,255,255,0.2)", padding: 10, borderRadius: 50 },
  card: { flex: 1, backgroundColor: "white", borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: -40, padding: 30 },
  tituloCard: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 5, color: "#333" },
  subtituloCard: { fontSize: 16, color: "#888", textAlign: "center", marginBottom: 40 },
  containerInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 },
  input: { flex: 1, height: 50, paddingLeft: 10 },
  icone: { marginRight: 10 },
  iconeDireita: { marginLeft: 10 },
  botaoCadastrar: { backgroundColor: "#fcbb30", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  textoBotaoCadastrar: { color: "white", fontSize: 18, fontWeight: "bold" },
  containerLogin: { flexDirection: "row", justifyContent: "center" },
  textoLogin: { color: "#888" },
  linkLogin: { color: "#fcbb30", fontWeight: "bold" },
});
