import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";

export default function ManageAccountScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.header}>Gerenciar Conta</Text>

        {/* Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/tabs/conta")}
          >
            <View style={styles.iconContainer}>
              <Feather name="user" size={22} color="#000" />
            </View>
            <View>
              <Text style={styles.itemTitle}>Informações Pessoais</Text>
              <Text style={styles.itemSubtitle}>Altere nome, e-mail e telefone</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <TouchableOpacity style={styles.item}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#000" />
            </View>
            <View>
              <Text style={styles.itemTitle}>Notificações</Text>
              <Text style={styles.itemSubtitle}>Gerencie seus alertas e avisos</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados e Conta</Text>
          <TouchableOpacity style={styles.item}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="delete-outline" size={22} color="#000" />
            </View>
            <View>
              <Text style={styles.itemTitle}>Excluir Conta</Text>
              <Text style={styles.itemSubtitle}>Remova permanentemente sua conta</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de navegação fixa */}
      <AnimatedBottomNavBar
        activeIndex={activeIndex}
        onTabPress={setActiveIndex}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5f5f5",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#111",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#444",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    backgroundColor: "#ffc125",
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#555",
  },
});
