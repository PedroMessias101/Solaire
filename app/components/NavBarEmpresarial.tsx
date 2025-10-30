import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

interface Props {
  placas: any[];
  setPlacas: (placas: any[]) => void;
}

const API_USUARIO_URL = "https://solaireapp.onrender.com";
const API_PLACAS_URL = "https://placa-api-eaho.onrender.com";

export const NavBarEmpresarial: React.FC<Props> = ({ placas, setPlacas }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);
  const [codigoPlaca, setCodigoPlaca] = useState("");

  // Ícones e rotas
  const tabs = [
    { icon: "home", route: "/empresarial/home" },
    { icon: "add-circle", route: "modal" }, // abre modal
    { icon: "person", route: "/empresarial/perfil" },
  ];


  const activeIndex = tabs.findIndex((tab) =>
    tab.route !== "modal" ? pathname.includes(tab.route) : false
  );

  const handlePress = (tab: typeof tabs[0]) => {
    if (tab.route === "modal") {
      setModalVisible(true);
    } else {
      router.push(tab.route);
    }
  };

  const handleAdicionar = async () => {
    if (codigoPlaca.trim() === "") return;

    try {
      // Buscar dados da placa na API pública
      const res = await fetch(`${API_PLACAS_URL}/${codigoPlaca.trim().toUpperCase()}`);
      if (!res.ok) {
        alert("Placa não encontrada na API.");
        return;
      }
      const data = await res.json();

      if (placas.find((p) => p.serial === data.code)) {
        alert("Placa já adicionada.");
        return;
      }

      // Pegar token do usuário
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        alert("Usuário não logado.");
        return;
      }

      // Salvar no back-end (provisionamento)
      const resBackend = await fetch(`${API_USUARIO_URL}/panels/provision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: data.code,
          location: `Placa ${data.id}`,
          model: "Genérico",
        }),
      });

      if (!resBackend.ok) {
        alert("Erro ao salvar a placa no servidor.");
        return;
      }

      const savedData = await resBackend.json();

      // Construir objeto da placa com status e energia atualizados
      const novaPlaca = {
        serial: savedData.panel.serial,
        location: savedData.panel.location,
        model: savedData.panel.model,
        status: savedData.panel.status ?? "Ativa",
        energia_kWh: savedData.panel.energia_kWh ?? 0,
      };

      // Atualizar estado local
      setPlacas([...placas, novaPlaca]);

      setCodigoPlaca("");
      setModalVisible(false);
    } catch (err) {
      console.log(err);
      alert("Erro ao adicionar placa.");
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tab}
          onPress={() => handlePress(tab)}
        >
          <Ionicons
            name={tab.icon as any}
            size={28}
            color={activeIndex === index ? "#FFC125" : "#fff"}
          />
        </TouchableOpacity>
      ))}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Placa</Text>
            <TextInput
              placeholder="Digite o código da placa (ex: ABCDE-F)"
              value={codigoPlaca}
              onChangeText={setCodigoPlaca}
              style={styles.input}
              autoCapitalize="characters"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#d6d6d6ff" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FFC125" }]}
                onPress={handleAdicionar}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
0
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "#111",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    padding: 10,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalButtonText: { color: "#000", fontWeight: "700", fontSize: 16 },
});
