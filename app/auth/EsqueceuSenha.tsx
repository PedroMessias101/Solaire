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

export default function EsqueciSenhaTela({ navigation }) {
  const URL_BASE = "https://seu-backend.com/api/auth"; 
  const [etapa, setEtapa] = useState("email");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const validarEmail = (e) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(e).toLowerCase());
  };

  const enviarCodigo = async () => {
    if (!validarEmail(email)) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido.");
      return;
    }
    setCarregando(true);
    try {
      const resposta = await fetch(`${URL_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        Alert.alert("Código enviado", `Um código foi enviado para ${email}`);
        setEtapa("codigo");
      } else {
        Alert.alert("Erro", dados.message || "Não foi possível enviar o código.");
      }
    } catch (err) {
      Alert.alert("Erro de conexão", "Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const verificarCodigo = async () => {
    if (codigo.trim().length < 3) {
      Alert.alert("Código inválido", "Digite o código que você recebeu por e-mail.");
      return;
    }
    setCarregando(true);
    try {
      const resposta = await fetch(`${URL_BASE}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codigo }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        Alert.alert("Código válido", "Você pode agora escolher uma nova senha.");
        setEtapa("senha");
      } else {
        Alert.alert("Código inválido", dados.message || "Código incorreto ou expirado.");
      }
    } catch (err) {
      Alert.alert("Erro de conexão", "Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const redefinirSenha = async () => {
    if (novaSenha.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Senhas não conferem", "As senhas digitadas devem ser iguais.");
      return;
    }
    setCarregando(true);
    try {
      const resposta = await fetch(`${URL_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codigo, password: novaSenha }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        Alert.alert("Senha alterada", "Sua senha foi atualizada com sucesso.", [
          {
            text: "OK",
            onPress: () => {
              if (navigation?.navigate) navigation.navigate("Login");
            },
          },
        ]);
      } else {
        Alert.alert("Erro", dados.message || "Não foi possível alterar a senha.");
      }
    } catch (err) {
      Alert.alert("Erro de conexão", "Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const etapaEmail = () => (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Esqueceu a senha?</Text>
      <Text style={estilos.subtitulo}>Digite seu e-mail para receber um código.</Text>
      <TextInput
        placeholder="Seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={estilos.input}
      />
      <TouchableOpacity style={estilos.botao} onPress={enviarCodigo} disabled={carregando}>
        {carregando ? <ActivityIndicator /> : <Text style={estilos.textoBotao}>Enviar código</Text>}
      </TouchableOpacity>
    </View>
  );

  const etapaCodigo = () => (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Verificar código</Text>
      <Text style={estilos.subtitulo}>Digite o código que você recebeu por e-mail em {email}.</Text>
      <TextInput
        placeholder="Código"
        value={codigo}
        onChangeText={setCodigo}
        style={estilos.input}
        keyboardType={Platform.OS === "ios" ? "default" : "visible-password"}
      />
      <TouchableOpacity style={estilos.botao} onPress={verificarCodigo} disabled={carregando}>
        {carregando ? <ActivityIndicator /> : <Text style={estilos.textoBotao}>Verificar</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={estilos.linkBotao} onPress={() => setEtapa("email")} disabled={carregando}>
        <Text style={estilos.textoLink}>Trocar e-mail</Text>
      </TouchableOpacity>
    </View>
  );

  const etapaSenha = () => (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Nova senha</Text>
      <Text style={estilos.subtitulo}>Escolha uma nova senha para sua conta.</Text>
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
      <TouchableOpacity style={estilos.botao} onPress={redefinirSenha} disabled={carregando}>
        {carregando ? <ActivityIndicator /> : <Text style={estilos.textoBotao}>Alterar senha</Text>}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={estilos.container}
    >
      {etapa === "email" && etapaEmail()}
      {etapa === "codigo" && etapaCodigo()}
      {etapa === "senha" && etapaSenha()}
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
