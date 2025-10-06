import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = "https://solaire-z8mw.onrender.com";

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

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Erro", "Preencha e-mail e senha!");
    return;
  }

  setLoading(true);

  try {
    console.log("🚀 Enviando login para:", `${API_URL}/users/login`);

    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("📥 Resposta da API:", data);

    if (response.ok && data.success) {
      // 🔄 limpa storage antigo
      await AsyncStorage.clear();

      // Salva infos no storage
      await AsyncStorage.setItem("userToken", data.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.data));
      await AsyncStorage.setItem("userName", data.data.name || email);

      // 👇 pega o papel (role) do usuário
      const role = data.data.role?.toUpperCase();

      // Redireciona de acordo com o role
      if (role === "RESIDENTIAL") {
        router.replace("/tabs/home");
      } else if (role === "BUSINESS") {
        router.replace("/empresarial/home");
      } else {
        // fallback
        router.replace("/tabs/home");
      }
    } else {
      Alert.alert("Erro", data.message || data.error || "Erro ao fazer login");
    }

  } catch (err) {
    console.error("❌ Erro no login:", err);
    Alert.alert("Erro", "Erro de conexão com a API");
  } finally {
    setLoading(false);
  }
};

  return (
    <LinearGradient
      colors={["#000", "#2f2103ff", "#fcbb30"]}
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

      {/* Card de login */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bem-vindo de volta!</Text>
        <Text style={styles.cardSubtitle}>Acesse sua conta</Text>

        {/* Input E-mail */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="user" size={16} color="#ffc125" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Input Senha */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#ffc125" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#ffc125"
              style={styles.iconRight}
            />
          </TouchableOpacity>
        </View>

        {/* Botão Login */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <LinearGradient
            colors={["#fcbb30", "#e6a600"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loginButtonGradient}
          >
            <Text style={styles.loginButtonText}>{loading ? "Entrando..." : "Login"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link Cadastro */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
            <Text style={styles.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
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
  cardTitle: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  cardSubtitle: { fontSize: 16, color: "#fff", marginBottom: 30 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ffff",
    marginBottom: 20,
    width: "100%",
    paddingVertical: 5,
  },
  input: { flex: 1, height: 40, color: "#fff", paddingLeft: 10 },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  loginButton: { width: "100%", marginTop: 10 },
  loginButtonGradient: {
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
  },
  loginButtonText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  signupContainer: { flexDirection: "row", marginTop: 15 },
  signupText: { color: "#fff" },
  signupLink: { color: "#fcbb30", fontWeight: "bold" },
});
