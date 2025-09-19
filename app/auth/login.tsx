import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = "https://solaireapp.onrender.com";

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Preencha usuário e senha!");
      return;
    }

    setLoading(true);

    try {
      // ✅ URL corrigida
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();
      console.log("Resposta da API:", data);

      if (response.ok) {
        // Salva token e nome do usuário
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userName", data.user?.name || username);

        // Verifica se o usuário já viu o onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

        if (hasSeenOnboarding) {
          router.replace("/tabs/home"); // Já viu, vai direto para a tela inicial
        } else {
          router.replace("/tabs/slides"); // Não viu, mostra o onboarding
        }
      } else {
        alert(data.error || "Erro ao fazer login");
      }
    } catch (err) {
      console.log(err);
      alert("Erro de conexão com a API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/fundo-sol.jpeg")}
        style={styles.imageBackground}
        resizeMode="cover"
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bem-vindo de volta!</Text>
        <Text style={styles.cardSubtitle}>Acesse sua conta</Text>

        {/* Usuário */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="user" size={16} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Senha */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <Ionicons name="eye" size={20} color="#888" style={styles.iconRight} />
        </View>

        {/* Botão Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Entrando..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Link Cadastro */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
            <Text style={styles.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e6f3f0" },
  imageBackground: { height: 250, width: "100%" },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    padding: 30,
  },
  cardTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 5, color: "#333" },
  cardSubtitle: { fontSize: 16, color: "#888", textAlign: "center", marginBottom: 40 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 },
  input: { flex: 1, height: 50, paddingLeft: 10 },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  loginButton: { backgroundColor: "#fcbb30", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  loginButtonText: { color: "#000", fontSize: 18, fontWeight: "bold" },
  signupContainer: { flexDirection: "row", justifyContent: "center" },
  signupText: { color: "#888" },
  signupLink: { color: "#000", fontWeight: "bold" },
});
