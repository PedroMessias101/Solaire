import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const API_URL = "https://solaireapp.onrender.com";

export default function CadastroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animação da bolha
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 1.2, duration: 4000, useNativeDriver: true }),
            Animated.timing(scaleY, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
            Animated.timing(scaleY, { toValue: 1.2, duration: 4000, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(translateX, { toValue: 60, duration: 6000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -30, duration: 6000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 6000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, { toValue: 40, duration: 5000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 5000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 5000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

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
        router.push("/auth/login");
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
    <LinearGradient
      colors={["#000", "#866112ff", "#fcbb30"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Bolha animada */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          { transform: [{ scaleX }, { scaleY }, { translateX }, { translateY }] },
        ]}
      >
        <LinearGradient
          colors={["#000", "#fcbb30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
      </Animated.View>

      {/* Card de cadastro */}
      <View style={styles.card}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.cardTitle}>Crie sua conta</Text>
          <Text style={styles.cardSubtitle}>Preencha os campos abaixo</Text>

          {/* Nome */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="user" size={16} color="#fcbb30" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#ccc"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color="#fcbb30" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Senha */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#fcbb30" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#ccc"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <Ionicons
              name={mostrarSenha ? "eye-off" : "eye"}
              size={20}
              color="#fcbb30"
              style={styles.iconRight}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            />
          </View>

          {/* Confirmar senha */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#fcbb30" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#ccc"
              secureTextEntry={!mostrarConfirmaSenha}
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
            />
            <Ionicons
              name={mostrarConfirmaSenha ? "eye-off" : "eye"}
              size={20}
              color="#fcbb30"
              style={styles.iconRight}
              onPress={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
            />
          </View>

          {/* Botão Cadastro */}
          <TouchableOpacity style={styles.registerButton} onPress={handleCadastro} disabled={loading}>
            <LinearGradient
              colors={["#fcbb30", "#e6a600"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.registerButtonGradient}
            >
              <Text style={styles.registerButtonText}>{loading ? "Cadastrando..." : "Cadastrar"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Link para login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  backgroundCircle: {
    position: "absolute",
    top: -height * 0.25,
    right: -width * 0.35,
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    overflow: "hidden",
  },
  gradientCircle: { flex: 1 },
  card: {
    width: width * 0.9,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    shadowColor: "#fcbb30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: { fontSize: 26, fontWeight: "bold", color: "#fcbb30", marginBottom: 5 },
  cardSubtitle: { fontSize: 16, color: "#ccc", marginBottom: 30 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#fcbb30",
    marginBottom: 20,
    width: "100%",
    paddingVertical: 5,
  },
  input: { flex: 1, height: 40, color: "#fff", paddingLeft: 10 },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  registerButton: { width: "100%", marginTop: 10 },
  registerButtonGradient: {
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
  },
  registerButtonText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  loginContainer: { flexDirection: "row", marginTop: 15 },
  loginText: { color: "#ccc" },
  loginLink: { color: "#fcbb30", fontWeight: "bold" },
});
