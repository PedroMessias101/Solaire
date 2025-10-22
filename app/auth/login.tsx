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
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const escalaX = useRef(new Animated.Value(1)).current;
  const escalaY = useRef(new Animated.Value(1)).current;
  const moverX = useRef(new Animated.Value(0)).current;
  const moverY = useRef(new Animated.Value(0)).current;
  const opacidadeLink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(escalaX, {
              toValue: 1.2,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(escalaY, {
              toValue: 0.9,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(escalaX, {
              toValue: 0.9,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(escalaY, {
              toValue: 1.2,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(moverX, {
            toValue: 60,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(moverX, {
            toValue: -30,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(moverX, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(moverY, {
            toValue: 40,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(moverY, {
            toValue: -20,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(moverY, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(opacidadeLink, {
      toValue: senha.length > 0 ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [senha]);

  const fazerLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha e-mail e senha!");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.success) {
        await AsyncStorage.clear();
        await AsyncStorage.setItem("userToken", dados.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(dados.data));
        await AsyncStorage.setItem("userName", dados.data.name || email);

        const papel = dados.data.role?.toUpperCase();
        if (papel === "RESIDENTIAL") {
          router.replace("/tabs/slides");
        } else {
          router.replace("/empresarial/wizard");
        }
      } else {
        Alert.alert("Erro", dados.message || dados.error || "Erro ao fazer login");
      }
    } catch (erro) {
      console.error("Erro no login:", erro);
      Alert.alert("Erro", "Erro de conexão com a API");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={[
          estilos.fundoAnimado,
          { transform: [{ scaleX: escalaX }, { scaleY: escalaY }, { translateX: moverX }, { translateY: moverY }] },
        ]}
      >
        <LinearGradient
          colors={["#fbf5deff", "#ffffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={estilos.gradiente}
        />
      </Animated.View>

      <ScrollView contentContainerStyle={estilos.scroll}>
        <Text style={estilos.titulo}>Bem-vindo de volta!</Text>
        <Text style={estilos.subtitulo}>Acesse sua conta abaixo</Text>

        {/* Campo de e-mail */}
        <View style={estilos.campo}>
          <Ionicons name="mail" size={18} color="#333" style={estilos.icone} />
          <TextInput
            style={estilos.input}
            placeholder="E-mail"
            placeholderTextColor="#6c757d"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Campo de senha */}
        <View style={estilos.campo}>
          <FontAwesome5 name="lock" size={16} color="#333" style={estilos.icone} />
          <TextInput
            style={estilos.input}
            placeholder="Senha"
            placeholderTextColor="#6c757d"
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha((prev) => !prev)}>
            <Ionicons
              name={mostrarSenha ? "eye-off" : "eye"}
              size={20}
              color="#333"
              style={estilos.iconeDireita}
            />
          </TouchableOpacity>
        </View>

        {/* Esqueceu a senha? */}
        <Animated.View style={[{ opacity: opacidadeLink, alignSelf: "flex-end", marginBottom: 2 }]}>
          {senha.length > 0 && (
            <TouchableOpacity onPress={() => router.push("/auth/esqueciSenha")}>
              <Text style={estilos.linkEsqueceu}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Botão de login */}
        <TouchableOpacity style={estilos.botao} onPress={fazerLogin} disabled={carregando}>
          <LinearGradient colors={["#ffc125", "#ffc125"]} style={estilos.gradienteBotao}>
            <Text style={estilos.textoBotao}>{carregando ? "Entrando..." : "Entrar"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link para cadastro */}
        <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
          <Text style={estilos.textoLink}>
            Não tem conta? <Text style={estilos.linkDestaque}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  fundoAnimado: {
    position: "absolute",
    top: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    overflow: "hidden",
    opacity: 0.8,
  },
  gradiente: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 30,
    textAlign: "center",
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ffc125",
    marginBottom: 20,
    width: "100%",
    paddingVertical: 5,
  },
  input: { flex: 1, height: 40, color: "#000", paddingLeft: 10 },
  icone: { marginRight: 10 },
  iconeDireita: { marginLeft: 10 },
  linkEsqueceu: {
    color: "#ffc125",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: width * 0.038,
  },
  botao: { width: "100%", marginBottom: 20 },
  gradienteBotao: {
    paddingVertical: height * 0.02,
    borderRadius: 50,
    alignItems: "center",
  },
  textoBotao: {
    color: "#000",
    fontWeight: "600",
    fontSize: width * 0.045,
    textAlign: "center",
  },
  textoLink: {
    color: "#6c757d",
    fontSize: width * 0.038,
    fontWeight: "500",
  },
  linkDestaque: {
    color: "#ffc125",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
