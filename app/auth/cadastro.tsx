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

  // --- Estados para os campos ---
  // Residencial
  const [nomeResidencial, setNomeResidencial] = useState("");
  const [cpf, setCpf] = useState("");

  // Empresarial
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [nomeAdmin, setNomeAdmin] = useState("");

  // Comuns
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animações (mantidas como estavam)
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
            Animated.timing(scaleY, { toValue: 0.9, duration: 4000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 0.9, duration: 4000, useNativeDriver: true }),
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

  // --- LÓGICA DE CADASTRO CORRIGIDA ---
  const handleCadastro = async () => {
    if (senha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    let url = "";
    let body = {};

    if (tab === "residencial") {
      if (!nomeResidencial || !email || !senha || !cpf) {
        Alert.alert("Erro", "Por favor, preencha todos os campos para o cadastro residencial.");
        setLoading(false);
        return;
      }
      url = `${API_URL}/users/register/residential`;
      body = {
        name: nomeResidencial,
        email: email,
        password: senha,
        cpf: cpf,
      };
    } else { // Empresarial
      if (!nomeEmpresa || !cnpj || !nomeAdmin || !email || !senha) {
        Alert.alert("Erro", "Por favor, preencha todos os campos para o cadastro empresarial.");
        setLoading(false);
        return;
      }
      url = `${API_URL}/users/register/business`;
      body = {
        companyName: nomeEmpresa,
        companyCnpj: cnpj,
        userName: nomeAdmin,
        userEmail: email,
        password: senha,
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Sucesso", "Conta criada com sucesso! Faça o login para continuar.");
        router.replace("/auth/login");
      } else {
        Alert.alert("Erro no Cadastro", data?.error || data?.message || "Ocorreu um erro desconhecido.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      Alert.alert("Erro de Conexão", "Não foi possível se comunicar com o servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const renderResidencialForm = () => (
    <>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="user" size={16} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Nome completo" value={nomeResidencial} onChangeText={setNomeResidencial} />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="id-card" size={16} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
      </View>
    </>
  );

  const renderEmpresarialForm = () => (
    <>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="building" size={16} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Nome da Empresa" value={nomeEmpresa} onChangeText={setNomeEmpresa} />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="id-card" size={16} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="CNPJ" value={cnpj} onChangeText={setCnpj} keyboardType="numeric"/>
      </View>
       <View style={styles.inputContainer}>
        <FontAwesome5 name="user-tie" size={16} color="#333" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Seu nome (Administrador)" value={nomeAdmin} onChangeText={setNomeAdmin} />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[ styles.backgroundCircle, { transform: [{ scaleX }, { scaleY }, { translateX }, { translateY }] } ]}>
        <LinearGradient colors={["#fbf5deff", "#ffffffff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCircle} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Comece a monitorar sua energia hoje</Text>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === "residencial" && styles.tabAtiva]} onPress={() => setTab("residencial")}>
            <Text style={[styles.tabTexto, tab === "residencial" && styles.tabTextoAtivo]}>Residencial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === "empresarial" && styles.tabAtiva]} onPress={() => setTab("empresarial")}>
            <Text style={[styles.tabTexto, tab === "empresarial" && styles.tabTextoAtivo]}>Empresarial</Text>
          </TouchableOpacity>
        </View>

        {tab === "residencial" ? renderResidencialForm() : renderEmpresarialForm()}

        {/* Campos Comuns */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={18} color="#333" style={styles.icon} />
          <TextInput style={styles.input} placeholder="E-mail de acesso" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#333" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Senha" secureTextEntry={!mostrarSenha} value={senha} onChangeText={setSenha} />
          <TouchableOpacity onPress={() => setMostrarSenha(prev => !prev)}>
            <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={20} color="#333" style={styles.iconRight} />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#333" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Confirmar senha" secureTextEntry={!mostrarConfirmaSenha} value={confirmaSenha} onChangeText={setConfirmaSenha} />
          <TouchableOpacity onPress={() => setMostrarConfirmaSenha(prev => !prev)}>
            <Ionicons name={mostrarConfirmaSenha ? "eye-off" : "eye"} size={20} color="#333" style={styles.iconRight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
          <LinearGradient colors={["#ffc125", "#ffc125"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{loading ? "Cadastrando..." : "Cadastrar"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// OS ESTILOS PERMANECEM OS MESMOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  backgroundCircle: { position: "absolute", top: -height * 0.2, right: -width * 0.3, width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, overflow: "hidden", opacity: 0.8, },
  gradientCircle: { flex: 1 },
  contentContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: width * 0.08, paddingBottom: height * 0.1, paddingTop: height * 0.1 },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 20, textAlign: "center" },
  tabs: { flexDirection: "row", marginBottom: 20, width: "100%" },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#ccc" },
  tabAtiva: { borderBottomColor: "#ffc125" },
  tabTexto: { fontSize: 16, color: "#6c757d" },
  tabTextoAtivo: { color: "#ffc125", fontWeight: "bold" },
  inputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#ffc125", marginBottom: 20, width: "100%", paddingVertical: 5 },
  input: { flex: 1, height: 40, color: "#000", paddingLeft: 10 },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  button: { width: "100%", marginBottom: 20 },
  buttonGradient: { paddingVertical: height * 0.02, borderRadius: 50, alignItems: "center" },
  buttonText: { color: "#000", fontWeight: "600", fontSize: width * 0.045, textAlign: "center" },
  linkText: { color: "#6c757d", fontSize: width * 0.038, fontWeight: "500" },
  linkHighlight: { color: "#ffc125", fontWeight: "600", textDecorationLine: "underline" },
});