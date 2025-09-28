import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function App() {
  const [step, setStep] = useState("dados");
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [tipoPagamento, setTipoPagamento] = useState("credito");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    nascimento: "",
    email: "",
  });
  const [dadosCartao, setDadosCartao] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });
  const router = useRouter();
  const [dadosPix, setDadosPix] = useState({ chave: "" });
  const [errors, setErrors] = useState({});

  const planos = [
    {
      nome: "Plano Residencial",
      valor: 29.9,
      beneficios: [
        "Acesso a relatórios simples",
        "Monitoramento e tempo real",
        "Suporte",
      ],
    },
    {
      nome: "Plano empresarial",
      valor: 59.9,
      beneficios: [
        "Acesso a relatorios avançados",
        "suporte 24 horas",
        "Multiusuarios",
        "mais controle",
      ],
    },
  ];

  const validarCPF = (cpf) => {
    const clean = cpf.replace(/[^\d]+/g, "");
    if (clean.length !== 11) return false;
    let soma = 0;
    let resto;
    if (/^(\d)\1+$/.test(clean)) return false;
    for (let i = 1; i <= 9; i++) soma += parseInt(clean.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(clean.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.substring(10, 11))) return false;
    return true;
  };

  const validarCampos = () => {
    let tempErrors = {};
    if (!form.nome.trim()) tempErrors.nome = "Nome obrigatório";
    if (!validarCPF(form.cpf)) tempErrors.cpf = "CPF inválido";
    if (form.nascimento.length !== 10) tempErrors.nascimento = "Data inválida";
    if (!form.email.includes("@")) tempErrors.email = "E-mail inválido";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleContinuar = () => {
    if (validarCampos()) {
      setStep("planos");
    } else {
      Alert.alert("Atenção", "Corrija os campos antes de continuar.");
    }
  };

  const handlePagamento = () => {
    setStep("loading");
    setTimeout(() => {
      setStep("sucesso");
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Etapa 1 - Dados pessoais */}
      {step === "dados" && (
        <View style={styles.section}>
          <Text style={styles.title}>Seus Dados</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={form.nome}
            onChangeText={(text) => setForm({ ...form, nome: text })}
          />
          {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

          <TextInputMask
            type={"cpf"}
            style={styles.input}
            placeholder="CPF"
            value={form.cpf}
            onChangeText={(text) => setForm({ ...form, cpf: text })}
          />
          {errors.cpf && <Text style={styles.error}>{errors.cpf}</Text>}

          <TextInputMask
            type={"datetime"}
            options={{ format: "DD/MM/YYYY" }}
            style={styles.input}
            placeholder="Data de nascimento"
            value={form.nascimento}
            onChangeText={(text) => setForm({ ...form, nascimento: text })}
          />
          {errors.nascimento && <Text style={styles.error}>{errors.nascimento}</Text>}

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <TouchableOpacity style={styles.botao} onPress={handleContinuar}>
            <Text style={styles.botaoTexto}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Etapa 2 - Planos */}
      {step === "planos" && (
        <View>
          <Text style={styles.title}>Escolha seu plano</Text>
          <Text style={styles.subtitle}>
            Compare os benefícios e escolha o ideal para você.
          </Text>

          {planos.map((plano) => (
            <TouchableOpacity
              key={plano.nome}
              style={styles.planoCard}
              onPress={() => {
                setPlanoSelecionado(plano);
                setStep("pagamento");
              }}
            >
              <View style={styles.planoHeader}>
                <Text style={styles.planoNome}>{plano.nome}</Text>
                <Text style={styles.planoValor}>
                  R$ {plano.valor.toFixed(2)}/mês
                </Text>
              </View>
              {plano.beneficios.map((beneficio, index) => (
                <View key={index} style={styles.beneficioItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#FFC125" />
                  <Text style={styles.beneficioTexto}>{beneficio}</Text>
                </View>
              ))}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Etapa 3 - Pagamento */}
      {step === "pagamento" && planoSelecionado && (
        <View style={styles.section}>
          <Text style={styles.title}>Pagamento - {planoSelecionado.nome}</Text>
          <Text style={styles.subtitle}>
            Valor: R$ {planoSelecionado.valor.toFixed(2)}
          </Text>

          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[styles.tipoButton, tipoPagamento === "credito" && styles.tipoSelecionado]}
              onPress={() => setTipoPagamento("credito")}
            >
              <Text>Crédito</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tipoButton, tipoPagamento === "debito" && styles.tipoSelecionado]}
              onPress={() => setTipoPagamento("debito")}
            >
              <Text>Débito</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tipoButton, tipoPagamento === "pix" && styles.tipoSelecionado]}
              onPress={() => setTipoPagamento("pix")}
            >
              <Text>PIX</Text>
            </TouchableOpacity>
          </View>

          {tipoPagamento === "credito" || tipoPagamento === "debito" ? (
            <>
              <TextInput
                placeholder="Número do cartão"
                style={styles.input}
                keyboardType="number-pad"
                value={dadosCartao.numero}
                onChangeText={(text) => setDadosCartao({ ...dadosCartao, numero: text })}
              />
              <TextInput
                placeholder="Nome no cartão"
                style={styles.input}
                value={dadosCartao.nome}
                onChangeText={(text) => setDadosCartao({ ...dadosCartao, nome: text })}
              />
              <TextInput
                placeholder="Validade (MM/AA)"
                style={styles.input}
                value={dadosCartao.validade}
                onChangeText={(text) => setDadosCartao({ ...dadosCartao, validade: text })}
              />
              <TextInput
                placeholder="CVV"
                style={styles.input}
                keyboardType="number-pad"
                secureTextEntry
                value={dadosCartao.cvv}
                onChangeText={(text) => setDadosCartao({ ...dadosCartao, cvv: text })}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder="Chave PIX (CPF ou e-mail)"
                style={styles.input}
                value={dadosPix.chave}
                onChangeText={(text) => setDadosPix({ chave: text })}
              />
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/4/44/QR_Code_Example.svg",
                }}
                style={{ width: 200, height: 200, alignSelf: "center", marginVertical: 20 }}
              />
              <Text style={{ textAlign: "center", marginBottom: 10 }}>
                Escaneie o QR code para pagar
              </Text>
            </>
          )}

          <TouchableOpacity style={styles.botao} onPress={handlePagamento}>
            <Text style={styles.botaoTexto}>Pagar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {step === "loading" && (
        <View style={[styles.section, { alignItems: "center" }]}>
          <Text style={styles.title}>Processando pagamento...</Text>
          <ActivityIndicator size="large" color="#ffc125" style={{ marginTop: 20 }} />
        </View>
      )}

      {/* Sucesso */}
      {step === "sucesso" && planoSelecionado && (
    <View style={styles.section}>
      <Text style={styles.title}>Pagamento realizado com sucesso!</Text>
      <Text>Plano: {planoSelecionado.nome}</Text>
      <Text>Valor: R$ {planoSelecionado.valor.toFixed(2)}</Text>
      <Text>
        Tipo de pagamento:{" "}
        {tipoPagamento === "credito"
          ? "Crédito"
          : tipoPagamento === "debito"
          ? "Débito"
          : "PIX"}
      </Text>
      {tipoPagamento === "pix" && <Text>Chave PIX: {dadosPix.chave}</Text>}
      <Text style={{ marginTop: 10 }}>Obrigado pela sua compra!</Text>

      <TouchableOpacity
        style={[styles.botao, { marginTop: 20 }]}
        onPress={() => {
          setStep("dados");
          setPlanoSelecionado(null);
          setDadosCartao({ numero: "", nome: "", validade: "", cvv: "" });
          setDadosPix({ chave: "" });
          setForm({ nome: "", cpf: "", nascimento: "", email: "" });

          router.replace("/tabs/home"); 
        }}
      >
        <Text style={styles.botaoTexto}>Continuar</Text>
      </TouchableOpacity>
    </View>
  )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center", // centraliza verticalmente
    alignItems: "center",     // centraliza horizontalmente
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
    width: "100%",           // garante que a section ocupe a largura total do container
    maxWidth: 400,           // opcional: limita o tamanho máximo em telas grandes
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  botao: {
    backgroundColor: "#FFC125",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  planoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  planoHeader: {
    marginBottom: 15,
  },
  planoNome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  planoValor: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFC125",
    marginTop: 5,
  },
  beneficioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  beneficioTexto: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tipoButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    width: "30%",
    alignItems: "center",
  },
  tipoSelecionado: {
    borderColor: "#ffc125",
    backgroundColor: "rgba(246, 230, 192, 0.82)",
  },
});
