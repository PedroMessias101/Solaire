import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ConfigEmpresarial() {
  // Exemplo de função de logout
  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => {/* lógica de logout */} },
    ]);
  };

  return (
    <ScrollView style={estilos.container}>
      <Text style={estilos.titulo}>Configurações Empresariais</Text>

      <View style={estilos.item}>
        <Feather name="user" size={22} color="#FFC125" />
        <Text style={estilos.itemTexto}>Dados da Empresa</Text>
      </View>

      <View style={estilos.item}>
        <MaterialCommunityIcons name="lock-reset" size={22} color="#FFC125" />
        <Text style={estilos.itemTexto}>Alterar Senha</Text>
      </View>

      <View style={estilos.item}>
        <MaterialCommunityIcons name="brightness-6" size={22} color="#FFC125" />
        <Text style={estilos.itemTexto}>Acessibilidade</Text>
      </View>

      <TouchableOpacity style={estilos.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={22} color="#fff" />
        <Text style={estilos.logoutTexto}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 24 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 24, color: "#222" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  itemTexto: { marginLeft: 14, fontSize: 16, color: "#333" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC125",
    padding: 16,
    borderRadius: 14,
    marginTop: 32,
    justifyContent: "center",
  },
  logoutTexto: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 10 },
});