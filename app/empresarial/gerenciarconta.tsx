import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";

export default function TelaGestaoDeConta() {
  const router = useRouter();
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={estilos.cabecalho}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.botaoVoltar}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={estilos.titulo}>Gerenciar Conta</Text>
      </View>


      <ScrollView style={estilos.conteudo} contentContainerStyle={{ paddingBottom: 80 }}>
        
        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Conta</Text>
          <TouchableOpacity style={estilos.card} onPress={() => router.push("/tabs/conta")}>
            <View style={estilos.iconeCard}>
              <Feather name="user" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Informações empresarial</Text>
              <Text style={estilos.subtituloCard}>Altere nome, e-mail e telefone</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Preferências</Text>
          <TouchableOpacity style={estilos.card}>
            <View style={estilos.iconeCard}>
              <Ionicons name="notifications-outline" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Notificações</Text>
              <Text style={estilos.subtituloCard}>Gerencie seus alertas e avisos</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Dados e Conta</Text>
          <TouchableOpacity style={estilos.card}>
            <View style={estilos.iconeCard}>
              <MaterialIcons name="delete-outline" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Excluir Conta</Text>
              <Text style={estilos.subtituloCard}>Remova permanentemente sua conta</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Configurações Empresariais</Text>

          <TouchableOpacity style={estilos.card}>
            <View style={estilos.iconeCard}>
              <Feather name="briefcase" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Dados da Empresa</Text>
              <Text style={estilos.subtituloCard}>Atualize razão social, CNPJ e endereço</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.card}>
            <View style={estilos.iconeCard}>
              <Ionicons name="people-outline" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Usuários e Permissões</Text>
              <Text style={estilos.subtituloCard}>Gerencie acesso de colaboradores</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.card}>
            <View style={estilos.iconeCard}>
              <MaterialIcons name="credit-card" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Faturamento</Text>
              <Text style={estilos.subtituloCard}>Visualize cobranças e métodos de pagamento</Text>
            </View>
          </TouchableOpacity>


          <TouchableOpacity style={estilos.card}>
            <View style={estilos.iconeCard}>
              <Feather name="file-text" size={22} color="#ffc125" />
            </View>
            <View>
              <Text style={estilos.tituloCard}>Exportar Relatório</Text>
              <Text style={estilos.subtituloCard}>Gere e baixe relatórios em PDF ou Excel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AnimatedBottomNavBar
        activeIndex={indiceAtivo}
        onTabPress={setIndiceAtivo}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#f2f2f2",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  botaoVoltar: {
    position: "absolute",
    left: 16,
    top: 40,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  conteudo: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
  },
  secao: {
    marginBottom: 24,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconeCard: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  tituloCard: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  subtituloCard: {
    fontSize: 13,
    color: "#666",
  },
});
