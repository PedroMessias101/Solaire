import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
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

interface Props {
  placas: any[];
  setPlacas: (placas: any[]) => void;
}

export const NavBarEmpresarial: React.FC<Props> = ({ placas, setPlacas }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);
  const [codigoPlaca, setCodigoPlaca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("");
  const [modoBusca, setModoBusca] = useState<"codigo" | "arduino">("codigo");

  const tabs = [
    {
      icon: "home",
      route: "/empresarial/home",
    },
    {
      icon: "scan-outline",
      action: () => setModalVisible(true),
    },
    {
      icon: "person",
      route: "/empresarial/perfil",
    },
  ];

  const handlePress = (tab: any) => {
    if (tab.action) return tab.action();
    if (tab.route) router.push(tab.route);
  };

  const isActive = (route: string | undefined) => {
    if (!route) return false;
    return pathname.includes(route);
  };

  // SALVAR PLACA NO BACKEND (usando SERIAL AGORA)
  const salvarPlacaNoBackend = async (codigo: string) => {
    try {
      console.log("Enviando placa ao backend:", codigo);

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Erro", "Você não está autenticada. Faça login novamente.");
        return false;
      }

      const response = await fetch("https://solaire-z8mw.onrender.com/panels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: codigo.toUpperCase(),
          location: "São Paulo",
          model: "Genérico"
        }),

      });

      const result = await response.json();
      console.log("Resposta do backend:", result);

      if (!response.ok) {
        Alert.alert("Erro", result.error || "Falha ao salvar placa no backend.");
        return false;
      }

      setPlacas([...placas, result]);
      return true;

    } catch (error) {
      console.log("Erro ao salvar no backend:", error);
      Alert.alert("Erro", "Não foi possível salvar a placa no backend.");
      return false;
    }
  };


  // -------------------------------
  // 🔥 BUSCAR DO ARDUINO
  // -------------------------------
  const handleBuscarArduino = async () => {
    try {
      setCarregando(true);
      setEtapaAtual("Conectando ao Arduino...");

      const res = await fetch("http://192.168.4.1/dados");

      if (!res.ok) {
        Alert.alert("Erro", "Não foi possível conectar ao Arduino.");
        return;
      }

      const dados = await res.json();
      console.log("Dados do Arduino:", dados);

      Alert.alert(
        "Dados do Arduino",
        `
Serial: ${dados.serial ?? "--"}
Tensão: ${dados.tensao ?? "--"} V
Corrente: ${dados.corrente ?? "--"} A
Potência: ${dados.potencia ?? "--"} W
Temperatura: ${dados.temperatura ?? "--"} °C
        `
      );
    } catch (error) {
      console.log("Erro ao buscar do Arduino:", error);
      Alert.alert("Erro", "Falha ao buscar informações do Arduino.");
    } finally {
      setCarregando(false);
      setEtapaAtual("");
    }
  };

  const handleBuscarCodigo = async () => {
    try {
      setCarregando(true);
      setEtapaAtual("Buscando na API de simulação...");

      if (!codigoPlaca.trim()) {
        Alert.alert("Erro", "Digite um código válido!");
        return;
      }

      console.log("Buscando placa:", codigoPlaca);

      const response = await fetch(
        `https://placa-api-eaho.onrender.com/${codigoPlaca}`
      );

      if (!response.ok) {
        Alert.alert("Erro", "Código não encontrado na API de simulação.");
        return;
      }

      const data = await response.json();
      console.log("Dados da simulação:", data);

      Alert.alert(
        "Dados da API",
        `
Energia: ${data.energia_kWh} kWh
Tensão: ${data.tensao} V
Corrente: ${data.corrente} A
Temperatura: ${data.temperatura} °C
Status: ${data.status}
      `
      );

      const ok = await salvarPlacaNoBackend(codigoPlaca);

      if (ok) {
        Alert.alert("Sucesso", "Placa adicionada ao seu sistema!");
        setModalVisible(false);
        setCodigoPlaca("");
      }

    } catch (error) {
      console.log("Erro ao buscar simulação:", error);
      Alert.alert("Erro", "Falha ao conectar à API de simulação.");
    } finally {
      setCarregando(false);
      setEtapaAtual("");
    }
  };


  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => handlePress(tab)}
          >
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={active ? "#FFC125" : "#fff"}
            />
          </TouchableOpacity>
        );
      })}

      {/* MODAL */}
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
            <Text style={styles.modalTitle}>Consultar Informações</Text>
            <Text style={styles.modalSubtitle}>Escolha o método de leitura</Text>

            <View style={styles.metodoContainer}>
              <TouchableOpacity
                style={[
                  styles.metodoButton,
                  modoBusca === "codigo" && styles.metodoAtivo,
                ]}
                onPress={() => setModoBusca("codigo")}
              >
                <Text
                  style={[
                    styles.metodoTexto,
                    modoBusca === "codigo" && styles.metodoTextoAtivo,
                  ]}
                >
                  Código
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.metodoButton,
                  modoBusca === "arduino" && styles.metodoAtivo,
                ]}
                onPress={() => setModoBusca("arduino")}
              >
                <Text
                  style={[
                    styles.metodoTexto,
                    modoBusca === "arduino" && styles.metodoTextoAtivo,
                  ]}
                >
                  Arduino
                </Text>
              </TouchableOpacity>
            </View>

            {/* CÓDIGO */}
            {modoBusca === "codigo" && (
              <>
                <Text style={styles.modalSubtitle}>Digite o código</Text>
                <TextInput
                  placeholder="Ex: PLACA-01"
                  value={codigoPlaca}
                  onChangeText={setCodigoPlaca}
                  style={[styles.input, carregando && styles.inputDisabled]}
                  autoCapitalize="characters"
                  editable={!carregando}
                  placeholderTextColor="#999"
                />
              </>
            )}

            {/* LOADING */}
            {carregando && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFC125" />
                <Text style={styles.loadingText}>{etapaAtual}</Text>
              </View>
            )}

            {/* BOTÕES */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={carregando}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={
                  modoBusca === "codigo"
                    ? handleBuscarCodigo
                    : handleBuscarArduino
                }
                disabled={carregando}
              >
                <Text style={styles.confirmButtonText}>
                  {modoBusca === "codigo" ? "Buscar" : "Ler Arduino"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// -------------------------
// ESTILOS
// -------------------------
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 75,
    backgroundColor: "#111",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },

  metodoContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },

  metodoButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },

  metodoAtivo: {
    backgroundColor: "#FFC125",
    borderColor: "#000",
  },

  metodoTexto: {
    fontSize: 16,
    color: "#333",
  },

  metodoTextoAtivo: {
    color: "#000",
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
    color: "#111",
    marginBottom: 10,
  },

  inputDisabled: {
    backgroundColor: "#e5e5e5",
  },

  loadingContainer: {
    width: "100%",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
    width: "100%",
    justifyContent: "space-between",
    gap: 12,
  },

  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#f0f0f0",
  },

  confirmButton: {
    backgroundColor: "#FFC125",
  },

  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },

  confirmButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
