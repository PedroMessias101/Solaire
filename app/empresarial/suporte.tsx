import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import { useRouter } from "expo-router";

export default function SupportScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL("mailto:suporte@solaire.com").catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o e-mail.")
    );
  };

  const handleChatPress = () => {
    router.push("../empresarial/chatSuporte");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tela}>
        <View style={styles.cabecalho}>
          <TouchableOpacity
            onPress={() => router.push("/empresarial/configuracao")}
            style={styles.botaoVoltar}
          >
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>


          <Text style={styles.tituloCabecalho}>Suporte</Text>
          <View style={{ width: 22 }} />
        </View>


        {/* FAQ */}
        <Text style={styles.tituloSecao}>Ajuda</Text>
        <TouchableOpacity style={styles.item} onPress={() => router.push("/empresarial/faq")}>
          <View style={styles.caixaIcone}>
            <Ionicons name="book-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.tituloItem}>FAQ</Text>
            <Text style={styles.subtituloItem}>Perguntas frequentes sobre o app</Text>
          </View>
        </TouchableOpacity>

        {/* Contato por E-mail */}
        <Text style={styles.tituloSecao}>Contato</Text>
        <TouchableOpacity style={styles.item} onPress={handleEmailPress}>
          <View style={styles.caixaIcone}>
            <Ionicons name="mail-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.tituloItem}>E-mail</Text>
            <Text style={styles.subtituloItem}>Envie uma mensagem para nossa equipe</Text>
          </View>
        </TouchableOpacity>

        {/* Chat de Suporte */}
        <TouchableOpacity style={styles.item} onPress={handleChatPress}>
          <View style={styles.caixaIcone}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.tituloItem}>Chat</Text>
            <Text style={styles.subtituloItem}>Converse com nosso suporte em tempo real</Text>
          </View>
        </TouchableOpacity>

        {/* Guia/Documentação */}
        <TouchableOpacity style={styles.item} onPress={() => router.push("/empresarial/guia")}>
          <View style={styles.caixaIcone}>
            <Ionicons name="document-text-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.tituloItem}>Guia do Usuário</Text>
            <Text style={styles.subtituloItem}>Aprenda a usar todas as funcionalidades do app</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <AnimatedBottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  botaoVoltar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tituloCabecalho: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  tituloSecao: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#444",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  caixaIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tituloItem: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subtituloItem: {
    fontSize: 13,
    color: "#666",
  },
});
