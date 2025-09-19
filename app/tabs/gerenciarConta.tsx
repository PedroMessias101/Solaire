import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ManageAccountScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View>
        <Ionicons name="arrow-back" size={22} color="#000"
          onPress={() => router.push("/tabs/config")} />
        <Text style={styles.header}>Gerenciar Conta</Text>
      </View>


      {/* Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>

        <TouchableOpacity style={styles.item}
          onPress={() => router.push("/tabs/conta")}>
          <View style={styles.iconContainer}>
            <Feather name="user" size={22} color="#000" />
          </View>
          <View>
            <Text style={styles.itemTitle}>Informações Pessoais</Text>
            <Text style={styles.itemSubtitle}>Altere nome, e-mail e telefone</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <View style={styles.iconContainer}>
            <Feather name="lock" size={22} color="#000" />
          </View>
          <View>
            <Text style={styles.itemTitle}>Segurança</Text>
            <Text style={styles.itemSubtitle}>Altere senha ou configure 2FA</Text>
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
            <MaterialIcons name="file-download" size={22} color="#000" />
          </View>
          <View>
            <Text style={styles.itemTitle}>Baixar Meus Dados</Text>
            <Text style={styles.itemSubtitle}>Exporte suas informações</Text>
          </View>
        </TouchableOpacity>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    backgroundColor: "#FCD34D",
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
