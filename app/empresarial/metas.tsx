import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function MetasScreen() {
  const router = useRouter();

  const categorias = [
    {
      nome: "Metas de Produção",
      icon: "sunny-outline",
      rota: "/metas/producao",
      descricao: "Acompanhe sua geração de energia solar",
    },
    {
      nome: "Metas de Consumo",
      icon: "flash-outline",
      rota: "/metas/consumo",
      descricao: "Controle os gastos e consumo energético",
    },
    {
      nome: "Metas Financeiras",
      icon: "cash-outline",
      rota: "/metas/financeiro",
      descricao: "Economia, créditos e retorno financeiro",
    },
    {
      nome: "Metas Ambientais",
      icon: "leaf-outline",
      rota: "/metas/ambiental",
      descricao: "Impacto positivo e CO₂ evitado",
    },
    {
      nome: "Metas Operacionais",
      icon: "settings-outline",
      rota: "/metas/operacional",
      descricao: "Manutenção e eficiência do sistema",
    },
    {
      nome: "Metas de Performance",
      icon: "analytics-outline",
      rota: "/metas/performance",
      descricao: "Eficiência, PR e comparação histórica",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Metas Empresariais</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {categorias.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(item.rota)}
          >
            <Ionicons name={item.icon as any} size={28} color="#6C63FF" />

            <View style={styles.cardTextos}>
              <Text style={styles.cardTitulo}>{item.nome}</Text>
              <Text style={styles.cardDescricao}>{item.descricao}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#9BA7C5" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1F",
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#131A2C",
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    gap: 15,
  },
  cardTextos: {
    flex: 1,
  },
  cardTitulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  cardDescricao: {
    color: "#9BA7C5",
    fontSize: 13,
    marginTop: 2,
  },
});
