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
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [modoBusca, setModoBusca] = useState<"codigo" | "arduino">("codigo");

  const tabs = [
    { icon: "home", route: "/tabs/home" },
    { icon: "add-circle-outline", action: () => setModalVisible(true) },
    { icon: "person", route: "/tabs/perfil" },
  ];

  const handlePress = (tab: any) => {
    if (tab.action) return tab.action();
    if (tab.route) router.push(tab.route);
  };

  const isActive = (route?: string) => (route ? pathname.includes(route) : false);

  // ---------- salvarPlacaNoBackend (OPÇÃO B) ----------
  // Vai enviar { serial, location: "São Paulo", model: "Genérico" }
  const salvarPlacaNoBackend = async (codigo: string) => {
    try {
      setEtapaAtual("Salvando no sistema...");
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Erro", "Você não está autenticada. Faça login novamente.");
        return false;
      }

      const response = await fetch(`${API_USUARIO_URL}/panels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: codigo.toUpperCase(),
          location: "São Paulo",
          model: "Genérico",
        }),
      });

      const result = await response.json();
      // Se backend retornar erro
      if (!response.ok) {
        // Mensagens específicas
        if (response.status === 409) {
          Alert.alert("Placa Já Existe", "Esta placa já está no seu sistema.");
          return false;
        }
        if (response.status === 401) {
          Alert.alert("Sessão Expirada", "Faça login novamente.");
          return false;
        }
        Alert.alert("Erro", result.error || result.message || "Falha ao salvar placa no backend.");
        return false;
      }

      // Resultado pode vir em diferentes formas — tentamos extrair painel salvo
      const painelSalvo = result.panel ?? result;
      // Atualiza lista local com o objeto retornado (se o backend retornar o painel)
      setPlacas((prev) => [...(prev || []), painelSalvo]);

      return true;
    } catch (error) {
      console.log("Erro ao salvar no backend:", error);
      Alert.alert("Erro", "Não foi possível salvar a placa no backend.");
      return false;
    } finally {
      setEtapaAtual("");
    }
  };

  // ---------- Buscar pelo CÓDIGO (usa API_PLACAS_URL, depois salvarPlacaNoBackend) ----------
  const handleBuscarCodigo = async () => {
    try {
      if (!codigoPlaca.trim()) {
        Alert.alert("Atenção", "Digite um código válido!");
        return;
      }

      setCarregando(true);
      setEtapaAtual("Validando código...");

      const codigoFormatado = codigoPlaca.trim().toUpperCase();
      console.log("Buscando placa:", codigoFormatado);

      const response = await fetch(`${API_PLACAS_URL}/${codigoFormatado}`);

      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert("Código não encontrado", "Verifique o código e tente novamente.");
          return;
        }
        throw new Error(`API Placas retornou status ${response.status}`);
      }

      const data = await response.json();
      console.log("Dados da simulação:", data);

      // mostra informações ao usuário antes de salvar
      Alert.alert(
        "📊 Dados da Placa",
        `Energia: ${data.energia_kWh ?? "--"} kWh\nTensão: ${data.tensao ?? "--"} V\nCorrente: ${data.corrente ?? "--"} A\nTemperatura: ${data.temperatura ?? "--"} °C\nStatus: ${data.status ?? "--"}`,
        [{ text: "Continuar", style: "default" }]
      );

      setEtapaAtual("Registrando no backend...");

      const ok = await salvarPlacaNoBackend(codigoFormatado);
      if (ok) {
        Alert.alert("✅ Sucesso", "Placa adicionada ao seu sistema!");
        setModalVisible(false);
        setCodigoPlaca("");
      }
    } catch (error) {
      console.log("Erro ao buscar simulação:", error);
      Alert.alert("❌ Erro", "Falha ao conectar ao servidor.");
    } finally {
      setCarregando(false);
      setEtapaAtual("");
    }
  };

  // ---------- Buscar dados DO ARDUINO (consulta local) e salvar ----------
  const handleBuscarArduino = async () => {
    try {
      setCarregando(true);
      setEtapaAtual("Conectando ao dispositivo...");

      // tentativa de conectar ao IP do ESP/Arduino na rede local
      const res = await fetch("http://192.168.4.1/dados");

      if (!res.ok) {
        Alert.alert("Erro", "Não foi possível conectar ao Arduino.");
        return;
      }

      const dados = await res.json();
      console.log("Dados do Arduino:", dados);

      // Mostra os dados ao usuário
      Alert.alert(
        "✅ Dispositivo Conectado",
        `Serial: ${dados.serial ?? "--"}\nTensão: ${dados.tensao ?? "--"} V\nCorrente: ${dados.corrente ?? "--"} A\nPotência: ${dados.potencia ?? "--"} W\nTemperatura: ${dados.temperatura ?? "--"} °C`,
        [{ text: "Continuar", style: "default" }]
      );

      // Salvar usando a função OPÇÃO B
      setEtapaAtual("Registrando dispositivo no backend...");
      const serial = (dados.serial ?? "").toString();
      if (!serial) {
        Alert.alert("Erro", "Serial do dispositivo não encontrado.");
        return;
      }

      const ok = await salvarPlacaNoBackend(serial);
      if (ok) {
        Alert.alert("✅ Sucesso", "Dispositivo adicionado ao sistema!");
        setModalVisible(false);
      }
    } catch (error) {
      console.log("Erro ao buscar do Arduino:", error);
      Alert.alert("❌ Erro", "Falha ao conectar ao dispositivo. Verifique a conexão.");
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
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => handlePress(tab)}
            disabled={carregando}
          >
            <Ionicons
              name={tab.icon as any}
              size={26}
              color={active ? "#FFD700" : "#FFFFFF"}
            />
            {active && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}

      {/* Modal Profissional: escolhe entre Código / Arduino */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !carregando && setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Adicionar Placa</Text>
                <Text style={styles.modalSubtitle}>Escolha o método de conexão</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => !carregando && setModalVisible(false)}
                disabled={carregando}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Método: CÓDIGO ou ARDUINO */}
            <View style={styles.metodoContainer}>
              <TouchableOpacity
                style={[
                  styles.metodoCard,
                  modoBusca === "codigo" && styles.metodoCardAtivo,
                ]}
                onPress={() => setModoBusca("codigo")}
                disabled={carregando}
              >
                <View style={styles.metodoIconContainer}>
                  <MaterialCommunityIcons
                    name="barcode-scan"
                    size={28}
                    color={modoBusca === "codigo" ? "#FFD700" : "#666"}
                  />
                </View>
                <Text style={[
                  styles.metodoCardTitle,
                  modoBusca === "codigo" && styles.metodoCardTitleAtivo
                ]}>Código</Text>
                <Text style={styles.metodoCardDesc}>Insira o código da placa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.metodoCard,
                  modoBusca === "arduino" && styles.metodoCardAtivo,
                ]}
                onPress={() => setModoBusca("arduino")}
                disabled={carregando}
              >
                <View style={styles.metodoIconContainer}>
                  <MaterialCommunityIcons
                    name="chip"
                    size={28}
                    color={modoBusca === "arduino" ? "#FFD700" : "#666"}
                  />
                </View>
                <Text style={[
                  styles.metodoCardTitle,
                  modoBusca === "arduino" && styles.metodoCardTitleAtivo
                ]}>Dispositivo</Text>
                <Text style={styles.metodoCardDesc}>Conectar via Arduino</Text>
              </TouchableOpacity>
            </View>

            {/* Formulário / Conteúdo */}
            <View style={styles.formContainer}>
              {modoBusca === "codigo" ? (
                <>
                  <Text style={styles.formLabel}>Código da Placa</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Ex: PLACA-001"
                      value={codigoPlaca}
                      onChangeText={setCodigoPlaca}
                      style={[styles.input, carregando && styles.inputDisabled]}
                      autoCapitalize="characters"
                      editable={!carregando}
                      placeholderTextColor="#999"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.arduinoInfoCard}>
                  <MaterialCommunityIcons name="information-outline" size={22} color="#4A90E2" />
                  <Text style={styles.arduinoInfoText}>
                                        Certifique-se que o dispositivo está conectado à mesma rede Wi-Fi
                  </Text>
                </View>
              )}
            </View>

            {/* Loading */}
            {carregando && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>{etapaAtual}</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={carregando}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  modoBusca === "codigo" && !codigoPlaca.trim() && styles.confirmButtonDisabled
                ]}
                onPress={modoBusca === "codigo" ? handleBuscarCodigo : handleBuscarArduino}
                disabled={carregando || (modoBusca === "codigo" && !codigoPlaca.trim())}
              >
                <Text style={styles.confirmButtonText}>
                  {modoBusca === "codigo" ? "Validar Código" : "Conectar Dispositivo"}
                </Text>
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
    height: 80,
    backgroundColor: "#000",
    borderRadius: 40,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 10,
  },

  tabActive: {
    transform: [{ scale: 1.1 }],
  },

  tabIndicator: {
    position: "absolute",
    bottom: -5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 20,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.5,
  },

  modalSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },

  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  metodoContainer: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 0,
    paddingBottom: 20,
    gap: 16,
  },

  metodoCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },

  metodoCardAtivo: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD700",
    transform: [{ scale: 1.02 }],
  },

  metodoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  metodoCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    textAlign: "center",
  },

  metodoCardTitleAtivo: {
    color: "#111827",
  },

  metodoCardDesc: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },

  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  inputIcon: {
    marginLeft: 16,
  },

  input: {
    flex: 1,
    padding: 18,
    paddingLeft: 12,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },

  inputDisabled: {
    opacity: 0.6,
  },

  arduinoInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 12,
  },

  arduinoInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },

  loadingContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  buttonRow: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 0,
    gap: 16,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  confirmButton: {
    backgroundColor: "#111827",
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
