import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export default function EsqueciSenhaTela() {
  const URL_BASE = "https://solaire-z8mw.onrender.com/users";
  const [etapa, setEtapa] = useState("email");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const router = useRouter();

  const validarEmail = (e) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(e).toLowerCase());
  };

  // Etapa 1: Solicitar código por e-mail
  const enviarCodigo = async () => {
    if (!validarEmail(email)) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido.");
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch(`${URL_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Código enviado",
          "Se houver uma conta com este e-mail, um código foi enviado."
        );
        setEtapa("codigo");
      } else {
        Alert.alert("Erro", data.error || "Não foi possível enviar o código.");
      }
    } catch (err) {
      Alert.alert("Erro de conexão", "Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Etapa 2: Redefinir senha
  const redefinirSenha = async () => {
    if (codigo.trim().length !== 6) {
      Alert.alert("Código inválido", "Digite o código de 6 dígitos recebido por e-mail.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Senhas não conferem", "As senhas devem ser iguais.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch(`${URL_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: codigo,
          newPassword: novaSenha,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sucesso", "Senha redefinida com sucesso!", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      } else {
        Alert.alert("Erro", data.error || "Não foi possível redefinir a senha.");
      }
    } catch (err) {
      Alert.alert("Erro de conexão", "Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Etapa 1: E-mail
  const etapaEmail = () => (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Esqueceu a senha?</Text>
      <Text style={estilos.subtitulo}>
        Digite seu e-mail para receber um código.
      </Text>
      <TextInput
        placeholder="Seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={estilos.input}
      />
      <TouchableOpacity
        style={estilos.botao}
        onPress={enviarCodigo}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator />
        ) : (
          <Text style={estilos.textoBotao}>Enviar código</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Etapa 2: Código e nova senha
  const etapaCodigo = () => (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Redefinir senha</Text>
      <Text style={estilos.subtitulo}>
        Digite o código recebido no e-mail e escolha sua nova senha.
      </Text>
      <TextInput
        placeholder="Código"
        value={codigo}
        onChangeText={setCodigo}
        style={estilos.input}
        keyboardType="numeric"
        maxLength={6}
      />
      <TextInput
        placeholder="Nova senha"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
        style={estilos.input}
      />
      <TextInput
        placeholder="Confirmar nova senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        style={estilos.input}
      />
      <TouchableOpacity
        style={estilos.botao}
        onPress={redefinirSenha}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator />
        ) : (
          <Text style={estilos.textoBotao}>Alterar senha</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={estilos.linkBotao}
        onPress={() => setEtapa("email")}
        disabled={carregando}
      >
        <Text style={estilos.textoLink}>Trocar e-mail</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={estilos.container}
    >
      {etapa === "email" ? etapaEmail() : etapaCodigo()}
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cartao: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  titulo: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  subtitulo: { fontSize: 14, color: "#666", marginBottom: 12 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  botao: {
    backgroundColor: "#ffc125",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  textoBotao: { color: "#000", fontWeight: "700" },
  linkBotao: { marginTop: 12, alignItems: "center" },
  textoLink: { color: "#ffc125", fontWeight: "600" },
});
