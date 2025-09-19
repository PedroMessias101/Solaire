import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient"; // Importação adicionada

const ECONOMIA_POR_PLACA = 16.0;

const placasIniciais = [
  { id: "1", nome: "Placa Solar 1", status: "Ativa" },
  { id: "2", nome: "Placa Solar 2", status: "Desativada" },
];

export default function TelaPerfil() {
  const [placas, setPlacas] = useState(placasIniciais);
  const [usuario, setUsuario] = useState({ name: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);

  const placasAtivas = placas.filter((p) => p.status === "Ativa").length;
  const economia = (placasAtivas * ECONOMIA_POR_PLACA).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

  useEffect(() => {
    const buscarUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;
        const response = await fetch("https://solaireapp.onrender.com/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsuario({ name: data.name, email: data.email, bio: data.bio || "Usuário Solar" });
        }
      } catch (error) {
        console.log("Erro na requisição de usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    buscarUsuario();
  }, []);

  function alternarStatus(id) {
    setPlacas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const novoStatus = p.status === "Ativa" ? "Desativada" : "Ativa";
          Alert.alert(
            "Status da Placa",
            novoStatus === "Ativa" ? "Placa ligada com sucesso!" : "Placa desligada com sucesso!"
          );
          return { ...p, status: novoStatus };
        }
        return p;
      })
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView style={estilos.tela} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header com LinearGradient */}
        <LinearGradient
          colors={['#FFC125', '#000']} // Degradê de amarelo para preto
          style={estilos.cabecalho}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={estilos.avatarContainer}>
            <Image source={require("../../assets/perfil-avatar.png")} style={estilos.avatar} />
            <TouchableOpacity style={estilos.editAvatar}>
              <Feather name="edit-2" size={18} color="#ffc125" />
            </TouchableOpacity>
          </View>
          <Text style={estilos.nome}>{usuario.name}</Text>
          <Text style={estilos.email}>{usuario.email}</Text>
          <Text style={estilos.bio}>{usuario.bio}</Text>
          <TouchableOpacity style={estilos.botaoEditar}>
            <Text style={estilos.textoBotaoEditar}>Editar Perfil</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Cards indicadores */}
        <View style={estilos.indicadores}>
          <View style={[estilos.cardIndicador, { borderLeftWidth: 4, borderLeftColor: "#FFC125" }]}>
            <MaterialIcons name="wb-sunny" size={28} color="#FFC125" />
            <Text style={estilos.valorIndicador}>5.2 kWh</Text>
            <Text style={estilos.labelIndicador}>Produção Hoje</Text>
          </View>
          <View style={[estilos.cardIndicador, { borderLeftWidth: 4, borderLeftColor: "#FFC125" }]}>
            <MaterialIcons name="bolt" size={28} color="#FFC125" />
            <Text style={estilos.valorIndicador}>{economia}</Text>
            <Text style={estilos.labelIndicador}>Economia</Text>
          </View>
          <View style={[estilos.cardIndicador, { borderLeftWidth: 4, borderLeftColor: "#FFC125" }]}>
            <MaterialIcons name="solar-power" size={28} color="#FFC125" />
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
                    { backgroundColor: item.status === "Ativa" ? "#FFC125" : "#000" },
                  ]}
                >
                  {item.status === "Ativa" ? "Ligada" : "Desligada"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  estilos.acaoPlaca,
                  { backgroundColor: item.status === "Ativa" ? "#FFC125" : "#000" },
                ]}
                onPress={() => alternarStatus(item.id)}
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
  tela: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: 16, paddingTop: 0 },
  cabecalho: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    // Note: 'backgroundColor' foi removido daqui
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#000" },
  editAvatar: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#000", borderRadius: 20, padding: 4 },
  nome: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 2, textAlign: "center" },
  email: { fontSize: 14, color: "#fff", marginBottom: 2, textAlign: "center" },
  bio: { fontSize: 13, color: "#fff", marginBottom: 10, textAlign: "center" },
  botaoEditar: { borderWidth: 2, borderColor: "#fff", paddingVertical: 8, paddingHorizontal: 24, borderRadius: 25, marginTop: 6 },
  textoBotaoEditar: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  indicadores: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginVertical: 18 },
  cardIndicador: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    minWidth: 110,
    marginRight: 10,
    marginBottom: 10,
    elevation: 2,
    height: 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  valorIndicador: { fontSize: 18, fontWeight: "bold", color: "#222", marginTop: 6 },
  labelIndicador: { fontSize: 13, color: "#666", marginTop: 4 },
  secaoPlacas: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerPlacas: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  tituloSecao: { fontSize: 16, fontWeight: "bold", color: "#222" },
  botaoAdicionar: { backgroundColor: "#FFC125", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 },
  textoBotaoAdicionar: { color: "#000", fontWeight: "bold", fontSize: 12 },
  cardPlaca: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  nomePlaca: { fontSize: 15, color: "#000", fontWeight: "bold", marginBottom: 4 },
  statusPlaca: { fontSize: 13, color: "#fff", fontWeight: "bold", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  acaoPlaca: { padding: 10, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});