import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

interface Props {
  placas: any[];
  setPlacas: (placas: any[]) => void;
}

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_PLACAS_URL = "https://placa-api-eaho.onrender.com";

export const NavBarEmpresarial: React.FC<Props> = ({ placas, setPlacas }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);
  const [codigoPlaca, setCodigoPlaca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("");

  const tabs = [
    { icon: "home", route: "/empresarial/home" },
    { icon: "add-circle", route: "modal" },
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
    if (!codigoPlaca.trim() || carregando) {
      Alert.alert("Erro", "Digite um código válido.");
      return;
    }

    try {
      setCarregando(true);
      setEtapaAtual("Buscando placa...");

      const codigoFormatado = codigoPlaca.trim().toUpperCase();

      // Buscar dados da placa
      const res = await fetch(`${API_PLACAS_URL}/${codigoFormatado}`);
      if (!res.ok) {
        Alert.alert("Placa não encontrada", "Verifique o código.");
        return;
      }
      const data = await res.json();

      if (!data?.code) {
        Alert.alert("Erro", "Dados da placa incompletos.");
        return;
      }

      // Evitar duplicadas
      if (placas.some((p) => p.serial === data.code)) {
        Alert.alert("Placa já adicionada", "Esta placa já está no sistema.");
        return;
      }

      setEtapaAtual("Verificando login...");
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        return;
      }

      setEtapaAtual("Registrando placa...");

      // Adicionar placa no backend
      const resBackend = await fetch(`${API_USUARIO_URL}/panels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: data.code,
          location: `Placa ${data.id || data.code}`,
          model: "Genérico",
          status: "Ativa",     // <-- CORRIGIDO
        }),
      });

      if (!resBackend.ok) {
        if (resBackend.status === 409) {
          Alert.alert("Placa já existe", "Esta placa já está cadastrada.");
          return;
        }
        Alert.alert("Erro", "Erro ao registrar placa.");
        return;
      }

      const savedData = await resBackend.json();

      const novaPlaca = {
        id: savedData.panel.id,  // <-- CORRIGIDO
        serial: savedData.panel.serial,
        location: savedData.panel.location,
        model: savedData.panel.model,
        status: savedData.panel.status ?? "Ativa",
        energia_kWh: savedData.panel.energia_kWh ?? 0,
      };

      setPlacas([...placas, novaPlaca]);

      Alert.alert(
        "Sucesso!",
        "Placa adicionada com sucesso!",
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );

    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
      setEtapaAtual("");
      setCodigoPlaca("");
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity key={index} style={styles.tab} onPress={() => handlePress(tab)}>
          <Ionicons
            name={tab.icon as any}
            size={28}
            color={activeIndex === index ? "#FFC125" : "#fff"}
          />
        </TouchableOpacity>
      ))}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => !carregando && setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Placa Solar</Text>
            <Text style={styles.modalSubtitle}>Digite o código da placa empresarial</Text>

            <TextInput
              placeholder="Ex: PLACA-001"
              value={codigoPlaca}
              onChangeText={setCodigoPlaca}
              style={[styles.input, carregando && styles.inputDisabled]}
              autoCapitalize="characters"
              editable={!carregando}
              placeholderTextColor="#999"
              onSubmitEditing={handleAdicionar}
            />

            {carregando && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFC125" />
                <Text style={styles.loadingText}>{etapaAtual}</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, carregando && styles.buttonDisabled]}
                onPress={() => setModalVisible(false)}
                disabled={carregando}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (carregando || !codigoPlaca.trim()) && styles.buttonDisabled,
                ]}
                onPress={handleAdicionar}
                disabled={carregando || !codigoPlaca.trim()}
              >
                {carregando ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.confirmButtonText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

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
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", width: "100%", padding: 16, borderRadius: 12, backgroundColor: "#f8f8f8", fontSize: 16, color: "#111", marginBottom: 10 },
  inputDisabled: { backgroundColor: "#f0f0f0", color: "#999" },
  loadingContainer: { width: "100%", padding: 16, backgroundColor: "#f8f9fa", borderRadius: 12, alignItems: "center", marginBottom: 16 },
  loadingText: { fontSize: 14, color: "#666", marginTop: 8 },
  buttonRow: { flexDirection: "row", marginTop: 8, width: "100%", justifyContent: "space-between", gap: 12 },
  modalButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center" },
  cancelButton: { backgroundColor: "#f0f0f0" },
  confirmButton: { backgroundColor: "#FFC125" },
  buttonDisabled: { opacity: 0.5 },
  cancelButtonText: { color: "#666", fontWeight: "600", fontSize: 16 },
  confirmButtonText: { color: "#000", fontWeight: "600", fontSize: 16 },
});
