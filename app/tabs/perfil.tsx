import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
 
// Simulação: cada placa ativa gera R$16,00 de economia
const ECONOMIA_POR_PLACA = 16.0;
 
const placasIniciais = [
  { id: "1", nome: "Placa Solar 1", status: "Ativa" },
  { id: "2", nome: "Placa Solar 2", status: "Desativada" },
];
 
export default function TelaPerfil() {
  const [placas, setPlacas] = useState(placasIniciais);
 
  // Conta quantas placas estão ativas
  const placasAtivas = placas.filter((p) => p.status === "Ativa").length;
  const economia = (placasAtivas * ECONOMIA_POR_PLACA).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
 
  function alternarStatus(id) {
    setPlacas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const novoStatus = p.status === "Ativa" ? "Desativada" : "Ativa";
          Alert.alert(
            "Status da Placa",
            novoStatus === "Ativa"
              ? "Placa ligada com sucesso!"
              : "Placa desligada com sucesso!"
          );
          return { ...p, status: novoStatus };
        }
        return p;
      })
    );
  }
 
  return (
<SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
<ScrollView style={estilos.tela} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header com avatar e dados */}
<View style={estilos.cabecalho}>
<View style={estilos.avatarContainer}>
<Image
              source={require("../../assets/perfil-avatar.png")}
              style={estilos.avatar}
            />
<TouchableOpacity style={estilos.editAvatar}>
<Feather name="edit-2" size={18} color="#fff" />
</TouchableOpacity>
</View>
<Text style={estilos.nome}>Vannessa Souza</Text>
<Text style={estilos.email}>vannessa@gmail.com</Text>
<Text style={estilos.bio}>Residencial Solar • Usuária desde 2025</Text>
<TouchableOpacity style={estilos.botaoEditar}>
<Text style={estilos.textoBotaoEditar}>Editar Perfil</Text>
</TouchableOpacity>
</View>
 
        {/* Cards de indicadores */}
<View style={estilos.indicadores}>
<View style={estilos.cardIndicador}>
<MaterialIcons name="wb-sunny" size={28} color="#fcbb30" />
<Text style={estilos.valorIndicador}>5.2 kWh</Text>
<Text style={estilos.labelIndicador}>Produção Hoje</Text>
</View>
<View style={estilos.cardIndicador}>
<MaterialIcons name="bolt" size={28} color="#4caf50" />
<Text style={estilos.valorIndicador}>{economia}</Text>
<Text style={estilos.labelIndicador}>Economia</Text>
</View>
<View style={estilos.cardIndicador}>
<MaterialIcons name="solar-power" size={28} color="#fcbb30" />
<Text style={estilos.valorIndicador}>
              {placasAtivas} Ativa{placasAtivas !== 1 ? "s" : ""}
</Text>
<Text style={estilos.labelIndicador}>Placas</Text>
</View>
</View>
 
        {/* Lista de placas */}
<View style={estilos.secaoPlacas}>
<View style={estilos.headerPlacas}>
<Text style={estilos.tituloSecao}>Suas Placas</Text>
<TouchableOpacity style={estilos.botaoAdicionar}>
<Feather name="plus" size={18} color="#fff" />
<Text style={estilos.textoBotaoAdicionar}>Adicionar</Text>
</TouchableOpacity>
</View>
          {placas.map((item) => (
<View style={estilos.cardPlaca} key={item.id}>
<View>
<Text style={estilos.nomePlaca}>{item.nome}</Text>
<Text
                  style={[
                    estilos.statusPlaca,
                    {
                      backgroundColor:
                        item.status === "Ativa" ? "#4caf50" : "#e53935",
                    },
                  ]}
>
                  {item.status === "Ativa" ? "Ligada" : "Desligada"}
</Text>
</View>
<TouchableOpacity
                style={[
                  estilos.acaoPlaca,
                  {
                    backgroundColor:
                      item.status === "Ativa" ? "#4caf50" : "#e53935",
                  },
                ]}
                onPress={() => alternarStatus(item.id)}
                accessibilityLabel={
                  item.status === "Ativa"
                    ? "Desligar placa"
                    : "Ligar placa"
                }
>
<MaterialIcons name="power-settings-new" size={22} color="#fff" />
</TouchableOpacity>
</View>
          ))}
</View>
</ScrollView>
</SafeAreaView>
  );
}
 
const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  cabecalho: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#fcbb30",
    backgroundColor: "#eee",
  },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fcbb30",
    borderRadius: 14,
    padding: 6,
    elevation: 2,
  },
  nome: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  email: {
    fontSize: 15,
    color: "#666",
    marginBottom: 2,
    textAlign: "center",
  },
  bio: {
    fontSize: 13,
    color: "#888",
    marginBottom: 10,
    textAlign: "center",
  },
  botaoEditar: {
    backgroundColor: "#fcbb30",
    paddingVertical: 7,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 2,
    alignSelf: "center",
  },
  textoBotaoEditar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  indicadores: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 18,
    gap: 10,
  },
  cardIndicador: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 13,
    alignItems: "center",
    flex: 1,
    minWidth: 110,
    marginRight: 10,
    marginBottom: 10,
    elevation: 2,
    height: 130,
    maxWidth: (Dimensions.get("window").width - 64) / 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  valorIndicador: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 4,
  },
  labelIndicador: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  secaoPlacas: {
    marginHorizontal: 0,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  headerPlacas: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  botaoAdicionar: {
    backgroundColor: "#fcbb30",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
  cardPlaca: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  nomePlaca: {
    fontSize: 16,
    color: "#0a3a5a",
    fontWeight: "bold",
    marginBottom: 2,
  },
  statusPlaca: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "bold",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 2,
  },
  acaoPlaca: {
    backgroundColor: "#4caf50",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
 
 