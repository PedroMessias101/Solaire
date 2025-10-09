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
  ScrollView,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const API_URL = "https://solaire-z8mw.onrender.com";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animação de fundo
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleX, {
              toValue: 1.2,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY, {
              toValue: 0.9,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleX, {
              toValue: 0.9,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY, {
              toValue: 1.2,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 60,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -30,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: 40,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
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
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {

        await AsyncStorage.clear();

        await AsyncStorage.setItem("userToken", data.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data));
        await AsyncStorage.setItem("userName", data.data.name || email);

        const role = data.data.role?.toUpperCase();

        // Redireciona de acordo com o role
        if (role === "RESIDENTIAL") {
          router.replace("/tabs/slides");
        } else if (role === "BUSINESS") {
          router.replace("/empresarial/wizard");
        } else {
          router.replace("/empresarial/wizard");
        }
      } else {
        Alert.alert("Erro", data.message || data.error || "Erro ao fazer login");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      Alert.alert("Erro", "Erro de conexão com a API");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fundo animado */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          { transform: [{ scaleX }, { scaleY }, { translateX }, { translateY }] },
        ]}
      >
        <LinearGradient
          colors={["#fbf5deff", "#ffffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitle}>Acesse sua conta abaixo</Text>

        {/* E-mail */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={18} color="#333" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#6c757d"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Senha */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#333" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#6c757d"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#333"
              style={styles.iconRight}
            />
          </TouchableOpacity>
        </View>

        {/* Botão de login */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={["#ffc125", "#ffc125"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link para cadastro */}
        <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
          <Text style={styles.linkText}>
            Não tem conta?{" "}
            <Text style={styles.linkHighlight}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundCircle: {
    position: "absolute",
    top: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    overflow: "hidden",
    opacity: 0.8,
  },
  gradientCircle: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ffc125",
    marginBottom: 20,
    width: "100%",
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#000",
    paddingLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  button: {
    width: "100%",
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: height * 0.02,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: width * 0.045,
    textAlign: "center",
  },
  linkText: {
    color: "#6c757d",
    fontSize: width * 0.038,
    fontWeight: "500",
  },
  linkHighlight: {
    color: "#ffc125",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
