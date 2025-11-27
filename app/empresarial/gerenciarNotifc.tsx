import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";

export default function NotificationSettingsScreen() {
  const [alerts, setAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [tips, setTips] = useState(true);

  const handleSave = () => {
    Alert.alert("Configurações salvas", "Suas preferências foram atualizadas.");
    console.log({ alerts, promotions, tips });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tela}>
        <View style={styles.cabecalho}>
          <Text style={styles.tituloCabecalho}>Configurações</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.tituloSecao}>Notificações</Text>

        <View style={styles.item}>
          <View style={styles.caixaIcone}>
            <Ionicons name="alert-circle-outline" size={22} color="#ffc125" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloItem}>Alertas de Produção</Text>
            <Text style={styles.subtituloItem}>Seja avisado quando a produção cair</Text>
          </View>
          <Switch
            value={alerts}
            onValueChange={setAlerts}
            thumbColor={alerts ? "#ffc125" : "#f4f3f4"}
            trackColor={{ false: "#ccc", true: "#ffe066" }}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.caixaIcone}>
            <Ionicons name="pricetag-outline" size={22} color="#ffc125" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloItem}>Promoções</Text>
            <Text style={styles.subtituloItem}>Receba ofertas especiais e descontos</Text>
          </View>
          <Switch
            value={promotions}
            onValueChange={setPromotions}
            thumbColor={promotions ? "#ffc125" : "#f4f3f4"}
            trackColor={{ false: "#ccc", true: "#ffe066" }}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.caixaIcone}>
            <Ionicons name="bulb-outline" size={22} color="#ffc125" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloItem}>Dicas & Conteúdos</Text>
            <Text style={styles.subtituloItem}>Receba dicas e conteúdos educativos</Text>
          </View>
          <Switch
            value={tips}
            onValueChange={setTips}
            thumbColor={tips ? "#ffc125" : "#f4f3f4"}
            trackColor={{ false: "#ccc", true: "#ffe066" }}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar Preferências</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  caixaIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#000",
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
  saveButton: {
    marginTop: 20,
    backgroundColor: "#e2e2e2ff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#5e5e5eff",
    fontSize: 16,
    fontWeight: "600",
  },
});
