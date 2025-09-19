import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TelaConfig() {
    const router = useRouter();
  return (
    <ScrollView style={estilos.tela}>

      <View style={estilos.cabecalho}>
        <Ionicons name="arrow-back" size={22} color="#000"
        onPress={() => router.push("/tabs/home")} />
        <Text style={estilos.tituloCabecalho}>Configurações</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={estilos.tituloSecao}>Conta</Text>
      <TouchableOpacity style={estilos.item}
       onPress={() => router.push("/tabs/gerenciarConta")}>
        <View style={estilos.caixaIcone}>
          <Ionicons name="person-outline" size={22} color="#000" />
        </View>
        <View>
          <Text style={estilos.tituloItem}>Contas</Text>
          <Text style={estilos.subtituloItem}>Gerencie os detalhes da sua conta</Text>
        </View>
      </TouchableOpacity>


      <Text style={estilos.tituloSecao}>Energia</Text>
      <TouchableOpacity style={estilos.item}>
        <View style={estilos.caixaIcone}>
          <MaterialIcons name="bar-chart" size={22} color="#000" />
        </View>
        <View>
          <Text style={estilos.tituloItem}>Relatórios de Consumo</Text>
          <Text style={estilos.subtituloItem}>Veja consumo e geração diária</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.item}>
        <View style={estilos.caixaIcone}>
          <Ionicons name="cloud-download-outline" size={22} color="#000" />
        </View>
        <View>
          <Text style={estilos.tituloItem}>Exportar Dados</Text>
          <Text style={estilos.subtituloItem}>Baixe os relatórios em PDF ou Excel</Text>
        </View>
      </TouchableOpacity>

      <Text style={estilos.tituloSecao}>Notificação</Text>
      <TouchableOpacity style={estilos.item}>
        <View style={estilos.caixaIcone}>
          <Ionicons name="alert-circle-outline" size={22} color="#000" />
        </View>
        <View>
          <Text style={estilos.tituloItem}>Alertas de Produção Baixa</Text>
          <Text style={estilos.subtituloItem}>Seja avisado quando a produção cai</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.item}>
        <View style={estilos.caixaIcone}>
          <Ionicons name="notifications-outline" size={22} color="#000" />
        </View>
        <View>
          <Text style={estilos.tituloItem}>Notificações de Manutenção</Text>
          <Text style={estilos.subtituloItem}>Lembretes para inspeções preventivas</Text>
        </View>
      </TouchableOpacity>

      <Text style={estilos.tituloSecao}>Ajuda e Suporte</Text>
      <TouchableOpacity style={estilos.item}>
        <View style={estilos.caixaIcone}>
          <Ionicons name="help-circle-outline" size={22} color="#000" />
        </View>
        <View>
          <Text style={estilos.tituloItem}>Suporte</Text>
          <Text style={estilos.subtituloItem}>Obtenha ajuda e suporte</Text>
        </View>
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
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  caixaIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fcbb30a8",
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
