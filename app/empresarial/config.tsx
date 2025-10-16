import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ==================== CONFIG EMPRESARIAL ====================
export function ConfigEmpresarial() {
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

// ==================== TELA CONFIGURAÇÕES ====================
export function TelaConfig() {
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
    </View>
  );
}

// ==================== ESTILOS ====================
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
  },
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
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  itemTexto: {
    marginLeft: 14,
    fontSize: 16,
    color: "#333",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC125",
    padding: 16,
    borderRadius: 14,
    marginTop: 32,
    justifyContent: "center",
  },
  logoutTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
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