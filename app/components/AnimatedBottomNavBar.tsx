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
  placas?: any[];
  setPlacas: (placas: any[]) => void;
}

const API_USUARIO_URL = "https://solaire-z8mw.onrender.com";
const API_PLACAS_URL = "https://placa-api-eaho.onrender.com";

export const AnimatedBottomNavBar: React.FC<Props> = ({ placas = [], setPlacas }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);
  const [codigoPlaca, setCodigoPlaca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("");

  const tabs = [
    { icon: "home", route: "/tabs/home" },
    { icon: "add-circle", route: "modal" },
    { icon: "person", route: "/tabs/perfil" },
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
      Alert.alert("Erro", "Digite um código válido para a placa.");
      return;
    }

    setCarregando(true);
    setEtapaAtual("Iniciando...");

    try {
      const codigoFormatado = codigoPlaca.trim().toUpperCase();

      // 1️⃣ Buscar placa na API pública
      setEtapaAtual("Buscando placa...");
      console.log("🔍 Buscando placa:", codigoFormatado);

      const resPlaca = await fetch(`${API_PLACAS_URL}/${codigoFormatado}`);

      if (!resPlaca.ok) {
        if (resPlaca.status === 404) {
          Alert.alert("Placa Não Encontrada", "Verifique o código e tente novamente.");
          return;
        }
        throw new Error(`API Placas retornou status ${resPlaca.status}`);
      }

      const dataPlaca = await resPlaca.json();
      console.log("📊 Dados da placa:", dataPlaca);

      if (!dataPlaca?.code) {
        Alert.alert("Erro", "Dados da placa incompletos.");
        return;
      }

      // 2️⃣ Verificar autenticação
      setEtapaAtual("Verificando login...");
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Sessão Expirada", "Faça login novamente.");
        return;
      }

      // 3️⃣ Registrar no backend
      setEtapaAtual("Registrando placa...");

      const dadosParaEnviar = {
        serial: dataPlaca.code,
        location: `Placa ${dataPlaca.id || dataPlaca.code}`,
        model: dataPlaca.model || "Genérico",
        status: "Ativa"
      };


      console.log("📤 Enviando para backend:", dadosParaEnviar);

      const resBackend = await fetch(`${API_USUARIO_URL}/panels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosParaEnviar),
      });

      console.log("📡 Resposta do backend:", resBackend.status);

      if (!resBackend.ok) {
        let errorMessage = "Erro ao registrar placa";

        try {
          const errorData = await resBackend.json();
          errorMessage = errorData.message || errorMessage;
          console.log("❌ Erro do backend:", errorData);
        } catch (e) {
          const errorText = await resBackend.text();
          errorMessage = errorText || errorMessage;
        }

        // Tratamento de erros específicos
        if (resBackend.status === 401) {
          Alert.alert("Sessão Expirada", "Faça login novamente.");
          return;
        } else if (resBackend.status === 409) {
          Alert.alert("Placa Já Existe", "Esta placa já está no seu sistema.");
          return;
        } else {
          Alert.alert("Erro", errorMessage);
          return;
        }
      }

      const savedData = await resBackend.json();
      console.log("✅ Placa registrada:", savedData);

      // 4️⃣ Atualizar lista local
      setEtapaAtual("Finalizando...");

      const novaPlaca = {
        id: savedData.panel?.id,
        serial: savedData.panel?.serial || dataPlaca.code,
        location: savedData.panel?.location || `Placa ${dataPlaca.id || dataPlaca.code}`,
        model: savedData.panel?.model || "Genérico",
        status: savedData.panel?.status || "Ativa",
        energia_kWh: savedData.panel?.energia_kWh || 0,
        tensao: savedData.panel?.tensao || 0,
        temperatura: savedData.panel?.temperatura || 0,
      };

      setPlacas([...placas, novaPlaca]);

      Alert.alert(
        "✅ Sucesso!",
        "Placa adicionada com sucesso!",
        [
          {
            text: "Ver Placas",
            onPress: () => {
              setModalVisible(false);
              router.push("/tabs/home");
            }
          }
        ]
      );

    } catch (err: any) {
      console.error("❌ Erro geral:", err);

      let mensagemErro = "Erro de conexão. Tente novamente.";

      if (err.message?.includes('Network request failed')) {
        mensagemErro = "Sem conexão com a internet.";
      } else if (err.message?.includes('timeout')) {
        mensagemErro = "Tempo limite excedido.";
      }

      Alert.alert("Erro", mensagemErro);
    } finally {
      setCarregando(false);
      setEtapaAtual("");
      setCodigoPlaca("");
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tab}
          onPress={() => handlePress(tab)}
          disabled={carregando}
        >
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Placa Solar</Text>
              <Text style={styles.modalSubtitle}>
                Digite o código da placa
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Ex: PLACA-001"
                value={codigoPlaca}
                onChangeText={setCodigoPlaca}
                style={[
                  styles.input,
                  carregando && styles.inputDisabled
                ]}
                autoCapitalize="characters"
                editable={!carregando}
                placeholderTextColor="#999"
                onSubmitEditing={handleAdicionar}
                returnKeyType="done"
              />
            </View>

            {carregando && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFC125" />
                <Text style={styles.loadingText}>{etapaAtual}</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  carregando && styles.buttonDisabled
                ]}
                onPress={() => setModalVisible(false)}
                disabled={carregando}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (carregando || !codigoPlaca.trim()) && styles.buttonDisabled
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

// ======== STYLES ========
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
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
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
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
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
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
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
    textAlign: "center",
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
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#FFC125",
  },
  buttonDisabled: {
    backgroundColor: "#e0e0e0",
    opacity: 0.6,
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