import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type MatrizData = {
  nome: string;
  cnpj: string;
};

type FilialData = {
  nome: string;
  cnpj: string;
  endereco: string;
};

export default function EmpresaSetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [matriz, setMatriz] = useState<MatrizData>({
    nome: "",
    cnpj: "",
  });
  const [filiais, setFiliais] = useState<FilialData[]>([]);
  const [novaFilial, setNovaFilial] = useState<FilialData>({
    nome: "",
    cnpj: "",
    endereco: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      if (savedToken) setToken(savedToken);
    };
    fetchToken();
  }, []);

  const isValidCNPJ = (cnpj: string) => /^\d{14}$/.test(cnpj.replace(/\D/g, ""));

  const handleNext = () => {
    if (step === 2) {
      if (!matriz.nome || !matriz.cnpj) {
        Alert.alert("Atenção", "Preencha nome e CNPJ da matriz.");
        return;
      }
      if (!isValidCNPJ(matriz.cnpj)) {
        Alert.alert("CNPJ inválido", "Digite um CNPJ com 14 números.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleAddFilial = () => {
    if (!novaFilial.nome || !novaFilial.cnpj) {
      Alert.alert("Atenção", "Preencha nome e CNPJ da filial.");
      return;
    }
    if (!isValidCNPJ(novaFilial.cnpj)) {
      Alert.alert("CNPJ inválido", "Digite um CNPJ com 14 números.");
      return;
    }
    setFiliais([...filiais, novaFilial]);
    setNovaFilial({ nome: "", cnpj: "", endereco: "" });
  };

  const handleFinish = async () => {
    if (!token) {
      Alert.alert("Erro", "Token inválido. Faça login novamente.");
      return;
    }

    setIsLoading(true);

    try {
      // ===== CADASTRAR MATRIZ =====
      const companyResponse = await fetch("https://solaire-z8mw.onrender.com/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: matriz.nome,
          cnpj: matriz.cnpj,
        }),
      });

      const companyJson = await companyResponse.json();

      if (!companyResponse.ok) {
        throw new Error(companyJson.message || companyJson.error || "Erro ao criar matriz.");
      }

      const companyId = companyJson.data.id;
      console.log("Matriz criada:", companyId);

      // ===== CADASTRAR FILIAIS =====
      if (filiais.length > 0) {
        const branchPromises = filiais.map((filial) =>
          fetch("https://solaire-z8mw.onrender.com/branches", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: filial.nome,
              cnpj: filial.cnpj,
              address: filial.endereco,
              companyId,
            }),
          })
        );

        const branchResponses = await Promise.all(branchPromises);

        for (const res of branchResponses) {
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.message || "Erro ao cadastrar filial.");
          }
        }
      }

      Alert.alert("Sucesso", "Empresa cadastrada com sucesso!", [
        { text: "OK", onPress: () => router.replace("./home") },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao comunicar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, step >= 1 && styles.activeStep]} />
          <View style={[styles.progressStep, step >= 2 && styles.activeStep]} />
          <View style={[styles.progressStep, step >= 3 && styles.activeStep]} />
        </View>

        {/* ETAPA 1 */}
        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.title}>Bem-vindo à Solaire</Text>
            <Text style={styles.subtitle}>
              Vamos configurar sua empresa. Primeiro, cadastre a matriz.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Começar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ETAPA 2 - MATRIZ */}
        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.title}>Cadastro da Matriz</Text>

            <TextInput
              placeholder="Nome da Matriz"
              style={styles.input}
              value={matriz.nome}
              onChangeText={(text) => setMatriz({ ...matriz, nome: text })}
            />

            <TextInput
              placeholder="CNPJ"
              style={styles.input}
              value={matriz.cnpj}
              onChangeText={(text) => setMatriz({ ...matriz, cnpj: text })}
            />

            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ETAPA 3 - FILIAIS */}
        {step === 3 && (
          <View style={styles.step}>
            <Text style={styles.title}>Cadastro de Filiais (opcional)</Text>

            <TextInput
              placeholder="Nome da Filial"
              style={styles.input}
              value={novaFilial.nome}
              onChangeText={(text) =>
                setNovaFilial({ ...novaFilial, nome: text })
              }
            />

            <TextInput
              placeholder="CNPJ"
              style={styles.input}
              value={novaFilial.cnpj}
              onChangeText={(text) =>
                setNovaFilial({ ...novaFilial, cnpj: text })
              }
            />

            <TextInput
              placeholder="Endereço"
              style={styles.input}
              value={novaFilial.endereco}
              onChangeText={(text) =>
                setNovaFilial({ ...novaFilial, endereco: text })
              }
            />

            <TouchableOpacity style={styles.secondaryButton} onPress={handleAddFilial}>
              <Text style={styles.secondaryText}>Adicionar Filial</Text>
            </TouchableOpacity>

            {filiais.length > 0 && (
              <View style={styles.filialList}>
                <Text style={styles.subtitle}>Filiais adicionadas:</Text>
                {filiais.map((f, i) => (
                  <Text key={i} style={styles.item}>
                    • {f.nome} – {f.cnpj}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.navButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleFinish}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Finalizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  progressStep: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: "#fcbb30",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 23,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#fcbb30",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  backButton: {
    backgroundColor: "#ccc",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    flex: 1,
    marginRight: 10,
  },
  navButtons: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#fcbb30",
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#fcbb30",
    fontWeight: "600",
  },
  filialList: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  item: {
    fontSize: 14,
    marginVertical: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
