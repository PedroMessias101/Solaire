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
const API_URL = "https://solaire-z8mw.onrender.com";

export default function CadastroScreen() {
  const router = useRouter();

  const [tab, setTab] = useState("residencial");

  // Campos gerais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animação bolha
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
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Enviando dados para cadastro:", { nome, email, senha, tab });

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nome,
          email: email,
          password: senha,
          role: tab === "residencial" ? "RESIDENTIAL" : "BUSINESS",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Cadastro realizado com sucesso!", data);
        Alert.alert("Sucesso", `Conta ${tab} criada com sucesso!`);
        setTimeout(() => {
          router.replace("/auth/login");
        }, 1000);
      } else {
        console.error("❌ Erro na resposta:", data);
        const errorMessage =
          data?.error || `Erro ${response.status}: ${response.statusText}`;
        Alert.alert("Erro no Cadastro", errorMessage);
      }
    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      Alert.alert("Erro", "Não foi possível realizar o cadastro. Tente novamente.");
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

      <View style={styles.card}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "residencial" && styles.tabAtiva]}
            onPress={() => setTab("residencial")}
          >
            <Text style={[styles.tabTexto, tab === "residencial" && styles.tabTextoAtivo]}>
              Residencial
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "empresarial" && styles.tabAtiva]}
            onPress={() => setTab("empresarial")}
          >
            <Text style={[styles.tabTexto, tab === "empresarial" && styles.tabTextoAtivo]}>
              Empresarial
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.cardTitle}>
            Crie sua conta {tab === "residencial" ? "residencial" : "empresarial"}
          </Text>
          <Text style={styles.cardSubtitle}>Preencha os campos abaixo</Text>

          {/* Nome */}
          <View style={styles.inputContainer}>
            <FontAwesome5
              name={tab === "residencial" ? "user" : "building"}
              size={16}
              color="#fcbb30"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder={tab === "residencial" ? "Nome completo" : "Nome da empresa"}
              placeholderTextColor="#ccc"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color="#fcbb30" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={tab === "residencial" ? "E-mail" : "E-mail empresarial"}
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#fcbb30" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha (mínimo 6 caracteres)"
              placeholderTextColor="#ccc"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              autoComplete="new-password"
              returnKeyType="next"
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
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleCadastro}
            />
            <Ionicons
              name={mostrarConfirmaSenha ? "eye-off" : "eye"}
              size={20}
              color="#fcbb30"
              style={styles.iconRight}
              onPress={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
          >
            <LinearGradient
              colors={["#fcbb30", "#e6a600"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.registerButtonGradient}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

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
    maxHeight: height * 0.85,
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
  tabs: { flexDirection: "row", marginBottom: 20, width: "100%" },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#ccc" },
  tabAtiva: { borderBottomColor: "#fcbb30" },
  tabTexto: { fontSize: 16, color: "#aaa" },
  tabTextoAtivo: { color: "#fcbb30", fontWeight: "bold" },
  cardTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 5, textAlign: "center" },
  cardSubtitle: { fontSize: 14, color: "#fff", marginBottom: 20, textAlign: "center" },
  inputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#fff", marginBottom: 20, width: "100%", paddingVertical: 5 },
  input: { flex: 1, height: 40, color: "#fff", paddingLeft: 10, fontSize: 16 },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  registerButton: { width: "100%", marginTop: 10 },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonGradient: { paddingVertical: 15, borderRadius: 50, alignItems: "center" },
  registerButtonText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  loginContainer: { flexDirection: "row", marginTop: 15, justifyContent: "center" },
  loginText: { color: "#fff" },
  loginLink: { color: "#fcbb30", fontWeight: "bold" },
});
