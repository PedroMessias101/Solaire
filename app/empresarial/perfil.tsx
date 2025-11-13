import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { NavBarEmpresarial } from "../components/NavBarEmpresarial";

export default function TelaPerfil() {
  const [usuario, setUsuario] = useState({ name: "", email: "", bio: "" });
  const [matriz, setMatriz] = useState({
    nome: "Solaire Matriz",
    cnpj: "12.345.678/0001-99",
    endereco: "Av. das Energias, 123 - São Paulo/SP",
  });

  const [filiais, setFiliais] = useState([
    { id: 1, nome: "Filial Nordeste", cidade: "Recife", status: "Ativa", energia: 1280 },
    { id: 2, nome: "Filial Sul", cidade: "Curitiba", status: "Ativa", energia: 980 },
    { id: 3, nome: "Filial Centro-Oeste", cidade: "Goiânia", status: "Inativa", energia: 0 },
  ]);

  const [placas, setPlacas] = useState([]);
  const [producaoAcumulada, setProducaoAcumulada] = useState(25000);

  // animação solar existente
  const spinValue = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const totalFiliaisAtivas = filiais.filter((f) => f.status === "Ativa").length;
  const energiaTotal = filiais.reduce((acc, f) => acc + f.energia, 0);
  const economiaTotal = energiaTotal * 0.12;
  const co2Evitado = energiaTotal * 0.001;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* --- Header com identidade empresarial --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/logo_empresarial.png")}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.nomeEmpresa}>{matriz.nome}</Text>
              <Text style={styles.cnpj}>CNPJ: {matriz.cnpj}</Text>
              <Text style={styles.email}>{usuario.email || "contato@solaire.com"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.configButton}>
            <Feather name="settings" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* --- Seção: Dados Empresariais --- */}
        <View style={styles.card}>
          <Text style={styles.tituloSecao}>Dados Empresariais</Text>
          <View style={styles.linha}>
            <Feather name="map-pin" size={16} color="#ffc125" />
            <Text style={styles.texto}>{matriz.endereco}</Text>
          </View>
          <View style={styles.linha}>
            <MaterialIcons name="business" size={16} color="#ffc125" />
            <Text style={styles.texto}>{totalFiliaisAtivas} filiais ativas</Text>
          </View>
          <View style={styles.linha}>
            <Feather name="users" size={16} color="#ffc125" />
            <Text style={styles.texto}>42 colaboradores</Text>
          </View>
        </View>

        {/* --- Indicadores Gerais --- */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Energia Total</Text>
            <Text style={styles.kpiValue}>{energiaTotal.toFixed(2)} kWh</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Economia Total</Text>
            <Text style={styles.kpiValue}>R$ {economiaTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>CO₂ Evitado</Text>
            <Text style={styles.kpiValue}>{co2Evitado.toFixed(2)} t</Text>
          </View>
        </View>

        {/* --- Lista de Filiais --- */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.tituloSecao}>Filiais</Text>
          {filiais.map((filial) => (
            <View key={filial.id} style={[styles.filialCard, styles.shadow]}>
              <View>
                <Text style={styles.filialNome}>{filial.nome}</Text>
                <Text style={styles.filialCidade}>{filial.cidade}</Text>
                <Text style={styles.filialEnergia}>
                  {filial.energia.toFixed(2)} kWh gerados
                </Text>
              </View>
              <View style={styles.filialStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: filial.status === "Ativa" ? "#4ade80" : "#9CA3AF" },
                  ]}
                />
                <Text style={styles.statusText}>{filial.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* --- Ações administrativas --- */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.tituloSecao}>Painel Administrativo</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="bar-chart-2" size={26} color="#ffc125" />
              <Text style={styles.actionLabel}>Relatórios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="settings" size={26} color="#ffc125" />
              <Text style={styles.actionLabel}>Configurações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="headphones" size={26} color="#ffc125" />
              <Text style={styles.actionLabel}>Suporte</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <NavBarEmpresarial placas={placas} setPlacas={setPlacas} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFF" },
  scroll: { padding: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
     flexDirection: "row",
      alignItems: "center" 
    },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  nomeEmpresa: { fontSize: 18, fontWeight: "700", color: "#111827" },
  cnpj: { fontSize: 12, color: "#6B7280" },
  email: { fontSize: 13, color: "#9CA3AF" },
  configButton: { padding: 10 },

  // seção empresarial
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  linha: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  texto: { marginLeft: 8, fontSize: 13, color: "#374151" },

  // KPIs
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  kpiBox: { alignItems: "center", flex: 1 },
  kpiLabel: { fontSize: 12, color: "#6B7280" },
  kpiValue: { fontSize: 16, fontWeight: "700", color: "#000", marginTop: 4 },

  // Filiais
  filialCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filialNome: { fontSize: 15, fontWeight: "700", color: "#111827" },
  filialCidade: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  filialEnergia: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  filialStatus: { alignItems: "center", justifyContent: "center" },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  statusText: { fontSize: 11, color: "#374151" },

  // Ações administrativas
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "47%",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: "center",
  },
  actionLabel: { marginTop: 6, color: "#111827", fontWeight: "600", fontSize: 13 },

  tituloSecao: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 8 },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
