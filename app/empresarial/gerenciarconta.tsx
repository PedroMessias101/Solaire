import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";  // <-- FALTAVA

export default function ManageAccountScreen() {
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação é permanente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const userId = await AsyncStorage.getItem("userId");

              if (!token || !userId) {
                Alert.alert("Erro", "Não foi possível identificar o usuário.");
                return;
              }

              const response = await fetch("https://solaire-z8mw.onrender.com/delete-user", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: userId }),
              });

              const data = await response.json();

              if (!response.ok) {
                Alert.alert("Erro", data.message || "Falha ao deletar conta.");
                return;
              }

              // Remover login local
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("userId");

              Alert.alert("Conta excluída!", "Seu usuário foi deletado com sucesso.");

              // 🔥 Caminho correto
              router.replace("/auth/login");

            } catch (err) {
              console.log(err);
              Alert.alert("Erro", "Não foi possível excluir sua conta.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/empresarial/configuracao")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Gerenciar Conta</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/tabs/conta")}
        >
          <View style={styles.iconBox}>
            <Feather name="user" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.itemTitle}>Informações Pessoais</Text>
            <Text style={styles.itemSubtitle}>Altere nome, e-mail e telefone</Text>
          </View>
        </TouchableOpacity>

        {/* Preferências */}
        <Text style={styles.sectionTitle}>Preferências</Text>
        <TouchableOpacity style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="notifications-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.itemTitle}>Notificações</Text>
            <Text style={styles.itemSubtitle}>Gerencie seus alertas e avisos</Text>
          </View>
        </TouchableOpacity>

        {/* Dados e Conta */}
        <Text style={styles.sectionTitle}>Dados e Conta</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={handleDeleteAccount}
        >
          <View style={styles.iconBox}>
            <MaterialIcons name="delete-outline" size={22} color="#ffc125" />
          </View>
          <View>
            <Text style={styles.itemTitle}>Excluir Conta</Text>
            <Text style={styles.itemSubtitle}>Remova permanentemente sua conta</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },

  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  sectionTitle: {
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  itemSubtitle: {
    fontSize: 13,
    color: "#666",
  },
});
