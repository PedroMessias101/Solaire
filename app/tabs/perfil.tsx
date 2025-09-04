import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function TelaPerfil() {
  return (
    <ScrollView style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <LinearGradient
          colors={["#4aacd9ff", "#daf1fcff"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 3 }}
          style={estilos.fundoGradiente}
        />
        <View style={estilos.linhaPerfil}>
          <Image
            source={require("../../assets/perfil-avatar.png")}
            style={estilos.imagemPerfil}
          />
          <View>
            <Text style={estilos.nomePerfil}>Vannessa Souza</Text>
            <Text style={estilos.emailPerfil}>vannessa@email.com</Text>
          </View>
        </View>
      </View>
      <View style={estilos.caixaInfo}>
        <Text style={estilos.tituloInfo}>Sobre você</Text>
        <Text style={estilos.textoInfo}>
          Aqui você pode editar suas informações pessoais e visualizar seu progresso.
        </Text>
        <TouchableOpacity style={estilos.botaoEditar}>
          <Text style={estilos.textoBotaoEditar}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#fafafaff",
  },
  cabecalho: {
    paddingBottom: 2,
    alignItems: "center",
    position: "relative",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: "hidden",
  },
  fundoGradiente: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  linhaPerfil: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 80,
    zIndex: 1,
    paddingHorizontal: 20,
  },
  imagemPerfil: {
    width: 70,
    height: 70,
    marginRight: 16,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#fff",
  },
  nomePerfil: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  emailPerfil: {
    fontSize: 15,
    color: "#555",
    marginTop: 2,
  },
  caixaInfo: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tituloInfo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a3a5a",
    marginBottom: 10,
  },
  textoInfo: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  botaoEditar: {
    backgroundColor: "#4aacd9ff",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  textoBotaoEditar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});