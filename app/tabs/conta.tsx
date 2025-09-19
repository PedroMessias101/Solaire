import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ContaScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("João Silva");
  const [email, setEmail] = useState("joao@email.com");
  const [telefone, setTelefone] = useState("(11) 98765-4321");

  return (
    <ScrollView style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <Ionicons name="arrow-back" size={22} color="#000"
          onPress={() => router.push("/tabs/home")} />
        <Text style={estilos.tituloCabecalho}>Minha Conta</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Campos de informações */}
      <Text style={estilos.label}>Nome</Text>
      <TextInput
        style={estilos.input}
        value={nome}
        onChangeText={setNome}
      />

      <Text style={estilos.label}>E-mail</Text>
      <TextInput
        style={estilos.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Botão salvar */}
      <TouchableOpacity style={estilos.botao}>
        <Text style={estilos.textoBotao}>Salvar Alterações</Text>
      </TouchableOpacity>

      {/* Alterar senha */}
      <TouchableOpacity
        style={[estilos.botao, estilos.botaoSecundario]}
        onPress={() => router.push("/tabs/alterar-senha")}
      >
        <Text style={estilos.textoBotaoSecundario}>Alterar Senha</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tituloCabecalho: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#000",
  },
  botao: {
    backgroundColor: "#fcbb30",
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },
  textoBotao: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  botaoSecundario: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 12,
  },
  textoBotaoSecundario: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
});
