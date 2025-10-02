import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import { useRouter } from "expo-router";

export default function TelaConfig() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.tela}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloCabecalho}>Configurações</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={estilos.tituloSecao}>Conta</Text>
        <TouchableOpacity
          style={estilos.item}
          onPress={() => router.push("/tabs/gerenciarConta")}
        >
          <View style={estilos.caixaIcone}>
            <Ionicons name="person-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={estilos.tituloItem}>Contas</Text>
            <Text style={estilos.subtituloItem}>Gerencie os detalhes da sua conta</Text>
          </View>
        </TouchableOpacity>

        <Text style={estilos.tituloSecao}>Notificação</Text>
        <TouchableOpacity style={estilos.item}>
          <View style={estilos.caixaIcone}>
            <Ionicons name="alert-circle-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={estilos.tituloItem}>Alertas de Produção Baixa</Text>
            <Text style={estilos.subtituloItem}>Seja avisado quando a produção cai</Text>
          </View>
        </TouchableOpacity>

        <Text style={estilos.tituloSecao}>Ajuda e Suporte</Text>
        <TouchableOpacity style={estilos.item}>
          <View style={estilos.caixaIcone}>
            <Ionicons name="help-circle-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={estilos.tituloItem}>Suporte</Text>
            <Text style={estilos.subtituloItem}>Obtenha ajuda e suporte</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <AnimatedBottomNavBar />
    </View>
  );
}

const estilos = StyleSheet.create({
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
