import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ChatSuporte() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState("");

  const mensagensFake = [
    { id: "1", texto: "Olá! Como posso ajudar hoje?", autor: "admin" },
    { id: "2", texto: "Estou com dúvidas sobre minha placa solar", autor: "usuario" },
    { id: "3", texto: "Claro! Me diga qual o problema 😊", autor: "admin" },
  ];

  return (
    <View style={styles.tela}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.push("/tabs/suporte")}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Suporte</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Área de Mensagens */}
      <FlatList
        style={styles.lista}
        data={mensagensFake}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bolha,
              item.autor === "usuario" ? styles.bolhaUser : styles.bolhaAdmin,
            ]}
          >
            <Text style={styles.textoBolha}>{item.texto}</Text>
          </View>
        )}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputArea}
      >
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem…"
          placeholderTextColor="#999"
          value={mensagem}
          onChangeText={setMensagem}
        />

        <TouchableOpacity style={styles.btnEnviar}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },

  /* Header */
  header: {
    height: 80,
    backgroundColor: "#f8f8f8",
    paddingTop: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  btnVoltar: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  /* Lista */
  lista: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },

  /* Bolhas de mensagem */
  bolha: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  bolhaUser: {
    backgroundColor: "#ffc125",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bolhaAdmin: {
    backgroundColor: "#e4e4e4",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  textoBolha: {
    color: "#000",
    fontSize: 14,
  },

  /* Input */
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 20,
    fontSize: 14,
    color: "#000",
  },
  btnEnviar: {
    marginLeft: 10,
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 20,
  },
});
