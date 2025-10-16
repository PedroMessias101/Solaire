import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router"; 

type MatrizData = {
  nome: string;
  cnpj: string;
  endereco: string;
  responsavel: string;
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
    endereco: "",
    responsavel: "",
  });
  const [filiais, setFiliais] = useState<FilialData[]>([]);
  const [novaFilial, setNovaFilial] = useState<FilialData>({
    nome: "",
    cnpj: "",
    endereco: "",
  });

  const handleNext = () => {
    if (step === 2 && (!matriz.nome || !matriz.cnpj)) {
      Alert.alert("Atenção", "Preencha pelo menos nome e CNPJ da matriz.");
      return;
    }
    setStep(step + 1);
  };

  const handleAddFilial = () => {
    if (!novaFilial.nome || !novaFilial.cnpj) {
      Alert.alert("Atenção", "Preencha nome e CNPJ da filial.");
      return;
    }
    setFiliais([...filiais, novaFilial]);
    setNovaFilial({ nome: "", cnpj: "", endereco: "" });
  };

  const handleFinish = () => {
    Alert.alert("Sucesso", "Cadastro empresarial concluído!", [
      {
        text: "OK",
        onPress: () => router.replace("/tabs/home"), 
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.title}>Bem-vindo à Solaire</Text>
            <Text style={styles.subtitle}>
              Vamos configurar sua estrutura. Primeiro, cadastre a matriz e as filiais.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Começar</Text>
            </TouchableOpacity>
          </View>
        )}

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
            <TextInput
              placeholder="Endereço"
              style={styles.input}
              value={matriz.endereco}
              onChangeText={(text) => setMatriz({ ...matriz, endereco: text })}
            />
            <TextInput
              placeholder="Responsável"
              style={styles.input}
              value={matriz.responsavel}
              onChangeText={(text) =>
                setMatriz({ ...matriz, responsavel: text })
              }
            />
            <View style={styles.navButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddFilial}
            >
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
              >
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <Text style={styles.buttonText}>Finalizar</Text>
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
    backgroundColor: "#fafafa",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  step: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#ffc125",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ffc125",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  secondaryText: {
    color: "#ffc125",
    fontWeight: "600",
  },
  filialList: {
    marginTop: 10,
  },
  item: {
    color: "#444",
    fontSize: 14,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#999",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
});
