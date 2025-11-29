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
  KeyboardAvoidingView
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Platform } from "react-native";

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

  // Estados para força da senha
  const [forcaSenha, setForcaSenha] = useState(0);
  const [corForcaSenha, setCorForcaSenha] = useState("#e0e0e0");
  const [textoForcaSenha, setTextoForcaSenha] = useState("");

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

  // Função para formatar CPF
  const formatarCPF = (texto) => {
    // Remove tudo que não é número
    const apenasNumeros = texto.replace(/\D/g, '');

    // Aplica a máscara: 000.000.000-00
    if (apenasNumeros.length <= 3) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 6) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
    } else if (apenasNumeros.length <= 9) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`;
    } else {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
    }
  };

  // Função para formatar CNPJ
  const formatarCNPJ = (texto) => {
    // Remove tudo que não é número
    const apenasNumeros = texto.replace(/\D/g, '');

    // Aplica a máscara: 00.000.000/0000-00
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 5) {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 8) {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5)}`;
    } else if (apenasNumeros.length <= 12) {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8)}`;
    } else {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8, 12)}-${apenasNumeros.slice(12, 14)}`;
    }
  };

  // Função para remover a máscara (enviar apenas números para a API)
  const removerMascara = (textoComMascara) => {
    return textoComMascara.replace(/\D/g, '');
  };

  // Handler para CPF
  const handleCpfChange = (texto) => {
    const cpfFormatado = formatarCPF(texto);
    setCpf(cpfFormatado);
  };

  // Handler para CNPJ
  const handleCnpjChange = (texto) => {
    const cnpjFormatado = formatarCNPJ(texto);
    setCnpj(cnpjFormatado);
  };

  // Função para calcular a força da senha
  const calcularForcaSenha = (senha) => {
    if (!senha) return 0;

    let forca = 0;

    // Critérios de força
    if (senha.length >= 8) forca += 1;
    if (senha.length >= 12) forca += 1;
    if (/[a-z]/.test(senha)) forca += 1;
    if (/[A-Z]/.test(senha)) forca += 1;
    if (/[0-9]/.test(senha)) forca += 1;
    if (/[^A-Za-z0-9]/.test(senha)) forca += 1;

    return Math.min(forca, 6); // Máximo de 6 pontos
  };

  // Atualizar indicador de força da senha
  const atualizarForcaSenha = (texto) => {
    setSenha(texto);
    const forca = calcularForcaSenha(texto);
    setForcaSenha(forca);

    // Definir cor e texto baseado na força
    switch (forca) {
      case 0:
        setCorForcaSenha("#e0e0e0");
        setTextoForcaSenha("");
        break;
      case 1:
      case 2:
        setCorForcaSenha("#ff4444");
        setTextoForcaSenha("Fraca");
        break;
      case 3:
      case 4:
        setCorForcaSenha("#ffaa00");
        setTextoForcaSenha("Média");
        break;
      case 5:
        setCorForcaSenha("#00aa00");
        setTextoForcaSenha("Forte");
        break;
      case 6:
        setCorForcaSenha("#008800");
        setTextoForcaSenha("Muito Forte");
        break;
      default:
        setCorForcaSenha("#e0e0e0");
        setTextoForcaSenha("");
    }
  };

  // Verificar se a senha é forte o suficiente (mínimo: média)
  const isSenhaForte = () => {
    return forcaSenha >= 3; // Pelo menos força média
  };

  // Verificar se o botão deve estar habilitado
  const isBotaoHabilitado = () => {
    if (tab === "residencial") {
      if (!nomeResidencial || !email || !senha || !cpf) return false;
    } else {
      if (!nomeEmpresa || !cnpj || !nomeAdmin || !email || !senha) return false;
    }

    return senha === confirmaSenha && isSenhaForte();
  };

  const handleCadastro = async () => {
    if (senha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (!isSenhaForte()) {
      Alert.alert("Senha Fraca", "Por favor, use uma senha mais forte.");
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
        cpf: removerMascara(cpf)
      };
    } else { // Empresarial
      if (!nomeEmpresa || !nomeAdmin || !email || !senha) {
        Alert.alert("Erro", "Por favor, preencha todos os campos para o cadastro empresarial.");
        setLoading(false);
        return;
      }
      url = `${API_URL}/users/register/business`;
      body = {
        userName: nomeAdmin,
        userEmail: email,
        password: senha,
        companyName: nomeEmpresa,
        cnpj: removerMascara(cnpj) 
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
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nomeResidencial}
          onChangeText={setNomeResidencial}
          placeholderTextColor="#333"
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="id-card" size={16} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={handleCpfChange}
          keyboardType="numeric"
          placeholderTextColor="#333"
          maxLength={14} // 000.000.000-00
        />
      </View>
    </>
  );

  const renderEmpresarialForm = () => (
    <>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="building" size={16} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nome da Empresa"
          value={nomeEmpresa}
          onChangeText={setNomeEmpresa}
          placeholderTextColor="#333"
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="id-card" size={16} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="CNPJ"
          value={cnpj}
          onChangeText={handleCnpjChange}
          keyboardType="numeric"
          placeholderTextColor="#333"
          maxLength={18} // 00.000.000/0000-00
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="user-tie" size={16} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Seu nome (Administrador)"
          value={nomeAdmin}
          onChangeText={setNomeAdmin}
          placeholderTextColor="#333"
        />
      </View>
    </>
  );

  // Componente da barra de força da senha
  const BarraForcaSenha = () => (
    <View style={styles.barraForcaContainer}>
      <View style={styles.barraForcaBackground}>
        <View
          style={[
            styles.barraForcaPreenchimento,
            {
              width: `${(forcaSenha / 6) * 100}%`,
              backgroundColor: corForcaSenha
            }
          ]}
        />
      </View>
      {textoForcaSenha ? (
        <Text style={[styles.textoForcaSenha, { color: corForcaSenha }]}>
          {textoForcaSenha}
        </Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[styles.backgroundCircle, { transform: [{ scaleX }, { scaleY }, { translateX }, { translateY }] }]}>
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
            <TextInput style={styles.input} placeholder="E-mail de acesso" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#333" />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={atualizarForcaSenha}
              placeholderTextColor="#333"
            />
            <TouchableOpacity onPress={() => setMostrarSenha(prev => !prev)}>
              <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={20} color="#333" style={styles.iconRight} />
            </TouchableOpacity>
          </View>

          {/* Barra de força da senha */}
          <BarraForcaSenha />

          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Confirmar senha" secureTextEntry={!mostrarConfirmaSenha} value={confirmaSenha} onChangeText={setConfirmaSenha} placeholderTextColor="#333" />
            <TouchableOpacity onPress={() => setMostrarConfirmaSenha(prev => !prev)}>
              <Ionicons name={mostrarConfirmaSenha ? "eye-off" : "eye"} size={20} color="#333" style={styles.iconRight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              !isBotaoHabilitado() && styles.buttonDisabled
            ]}
            onPress={handleCadastro}
            disabled={loading || !isBotaoHabilitado()}
          >
            <LinearGradient
              colors={isBotaoHabilitado() ? ["#ffc125", "#ffc125"] : ["#cccccc", "#cccccc"]}
              style={styles.buttonGradient}
            >
              <Text style={[
                styles.buttonText,
                !isBotaoHabilitado() && styles.buttonTextDisabled
              ]}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.linkText}>
              Já tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

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
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { paddingVertical: height * 0.02, borderRadius: 50, alignItems: "center" },
  buttonText: { color: "#000", fontWeight: "600", fontSize: width * 0.045, textAlign: "center" },
  buttonTextDisabled: { color: "#666" },
  linkText: { color: "#6c757d", fontSize: width * 0.038, fontWeight: "500" },
  linkHighlight: { color: "#ffc125", fontWeight: "600", textDecorationLine: "underline" },
  // Estilos para a barra de força da senha
  barraForcaContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center"
  },
  barraForcaBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 5
  },
  barraForcaPreenchimento: {
    height: "100%",
    borderRadius: 3,
    transition: "all 0.3s ease"
  },
  textoForcaSenha: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  }
});