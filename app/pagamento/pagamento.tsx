import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get("window");

export default function App() {
  const [step, setStep] = useState("dados");
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [tipoPagamento, setTipoPagamento] = useState("credito");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    nascimento: "",
    email: "",
    telefone: "",
  });
  const [dadosCartao, setDadosCartao] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    parcelas: "1",
  });
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Chave PIX pré-definida
  const [dadosPix] = useState({
    chave: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Chave PIX pré-definida
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX123456789",
  });

  const planos = [
    {
      nome: "Plano Residencial",
      valor: 87.9,
      beneficios: [
        "Acesso a relatórios simples",
        "Monitoramento em tempo real",
        "Suporte básico",
        "1 usuário",
      ],
    },
    {
      nome: "Plano Empresarial",
      valor: 159.9,
      beneficios: [
        "Acesso a relatórios avançados",
        "Suporte 24 horas",
        "Multi usuários",
        "Controle completo",
        "Backup de dados",
      ],
    },
  ];

  const bandeirasCartao = {
    visa: {
      cor: "#ffcc15",
      imagem: require("../../assets/cartao/visa.png"),
    },
    mastercard: {
      cor: "#ffc125",
      imagem: require("../../assets/cartao/mastercard.png"),
    },
    elo: {
      cor: "#ffc125",
      imagem: require("../../assets/cartao/elo.png"),
    },
  };

  // Função para copiar a chave PIX
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(dadosPix.chave);
      Alert.alert("Sucesso", "Chave PIX copiada para a área de transferência!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar a chave PIX");
      console.error("Erro ao copiar chave PIX:", error);
    }
  };

  const detectarBandeira = (numero) => {
    const num = numero.replace(/\s/g, '');
    if (/^4/.test(num)) return "visa";
    if (/^5[1-5]/.test(num)) return "mastercard";
    if (/^6(?:5|6)/.test(num)) return "elo";
    return null;
  };

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

  const validarCartao = () => {
    let tempErrors = {};
    const numeroLimpo = dadosCartao.numero.replace(/\s/g, '');

    if (numeroLimpo.length < 13) tempErrors.numero = "Número do cartão inválido";
    if (!dadosCartao.nome.trim()) tempErrors.nome = "Nome obrigatório";
    if (!/^\d{2}\/\d{2}$/.test(dadosCartao.validade)) tempErrors.validade = "Validade inválida";
    if (!/^\d{3,4}$/.test(dadosCartao.cvv)) tempErrors.cvv = "CVV inválido";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validarCampos = () => {
    let tempErrors = {};
    if (!form.nome.trim()) tempErrors.nome = "Nome obrigatório";
    if (!validarCPF(form.cpf)) tempErrors.cpf = "CPF inválido";
    if (form.nascimento.length !== 10) tempErrors.nascimento = "Data inválida";
    if (!form.email.includes("@")) tempErrors.email = "E-mail inválido";
    if (form.telefone.length < 14) tempErrors.telefone = "Telefone inválido";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const formatarNumeroCartao = (text) => {
    const clean = text.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = clean.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const handleContinuar = () => {
    if (validarCampos()) {
      setStep("planos");
    } else {
      Alert.alert("Atenção", "Corrija os campos antes de continuar.");
    }
  };

  const handlePagamento = async () => {
    if (tipoPagamento !== "pix" && !validarCartao()) {
      Alert.alert("Atenção", "Corrija os dados do cartão antes de continuar.");
      return;
    }

    setLoading(true);
    setStep("loading");

    setTimeout(() => {
      setLoading(false);
      setStep("sucesso");
    }, 3000);
  };

  const bandeiraAtual = detectarBandeira(dadosCartao.numero);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Barrinha do progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, step !== "dados" && styles.progressDotCompleted]}>
              {step !== "dados" && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
            <Text style={styles.progressText}>Dados</Text>
          </View>

          <View style={[styles.progressLine, step !== "dados" && styles.progressLineCompleted]} />

          <View style={styles.progressStep}>
            <View style={[styles.progressDot, (step === "planos" || step === "pagamento" || step === "loading" || step === "sucesso") && styles.progressDotCompleted]}>
              {(step === "planos" || step === "pagamento" || step === "loading" || step === "sucesso") && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
            <Text style={styles.progressText}>Plano</Text>
          </View>

          <View style={[styles.progressLine, (step === "pagamento" || step === "loading" || step === "sucesso") && styles.progressLineCompleted]} />

          <View style={styles.progressStep}>
            <View style={[styles.progressDot, (step === "pagamento" || step === "loading" || step === "sucesso") && styles.progressDotCompleted]} />
            <Text style={styles.progressText}>Pagamento</Text>
          </View>
        </View>

        {/* Dados pessoais */}
        {step === "dados" && (
          <View style={styles.section}>
            <Text style={styles.title}>Seus Dados</Text>
            <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                value={form.nome}
                onChangeText={(text) => setForm({ ...form, nome: text })}
              />
            </View>
            {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="id-card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInputMask
                type={"cpf"}
                style={styles.input}
                placeholder="CPF"
                value={form.cpf}
                onChangeText={(text) => setForm({ ...form, cpf: text })}
              />
            </View>
            {errors.cpf && <Text style={styles.error}>{errors.cpf}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInputMask
                type={"datetime"}
                options={{ format: "DD/MM/YYYY" }}
                style={styles.input}
                placeholder="Data de nascimento"
                value={form.nascimento}
                onChangeText={(text) => setForm({ ...form, nascimento: text })}
              />
            </View>
            {errors.nascimento && <Text style={styles.error}>{errors.nascimento}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
              />
            </View>
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInputMask
                type={"cel-phone"}
                options={{ maskType: "BRL", withDDD: true, dddMask: "(99) " }}
                style={styles.input}
                placeholder="Telefone"
                value={form.telefone}
                onChangeText={(text) => setForm({ ...form, telefone: text })}
              />
            </View>
            {errors.telefone && <Text style={styles.error}>{errors.telefone}</Text>}

            <TouchableOpacity style={styles.botao} onPress={handleContinuar}>
              <Text style={styles.botaoTexto}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Etapa 2 - Planos */}
        {step === "planos" && (
          <View style={styles.section}>
            <Text style={styles.title}>Escolha seu plano</Text>
            <Text style={styles.subtitle}>
              Compare os benefícios e escolha o ideal para você.
            </Text>

            {planos.map((plano, index) => (
              <TouchableOpacity
                key={plano.nome}
                style={[
                  styles.planoCard,
                  planoSelecionado?.nome === plano.nome && styles.planoCardSelecionado
                ]}
                onPress={() => setPlanoSelecionado(plano)}
              >
                <View style={styles.planoHeader}>
                  <View style={styles.planoRadio}>
                    <View style={[
                      styles.radioCircle,
                      planoSelecionado?.nome === plano.nome && styles.radioCircleSelecionado
                    ]}>
                      {planoSelecionado?.nome === plano.nome && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.planoInfo}>
                    <Text style={styles.planoNome}>{plano.nome}</Text>
                    <Text style={styles.planoValor}>
                      R$ {plano.valor.toFixed(2).replace('.', ',')}/mês
                    </Text>
                  </View>
                </View>

                <View style={styles.beneficiosContainer}>
                  {plano.beneficios.map((beneficio, benefIndex) => (
                    <View key={benefIndex} style={styles.beneficioItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFC125" />
                      <Text style={styles.beneficioTexto}>{beneficio}</Text>
                    </View>
                  ))}
                </View>

                {planoSelecionado?.nome === plano.nome && (
                  <TouchableOpacity
                    style={styles.botao}
                    onPress={() => setStep("pagamento")}
                  >
                    <Text style={styles.botaoTexto}>Selecionar Plano</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Etapa 3 - Pagamento */}
        {step === "pagamento" && planoSelecionado && (
          <View style={styles.section}>
            <Text style={styles.title}>Finalizar Pagamento</Text>

            <View style={styles.resumoPlano}>
              <Text style={styles.resumoTitle}>Plano Selecionado</Text>
              <Text style={styles.resumoPlanoNome}>{planoSelecionado.nome}</Text>
              <Text style={styles.resumoPlanoValor}>
                R$ {planoSelecionado.valor.toFixed(2).replace('.', ',')}/mês
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
            <View style={styles.tipoContainer}>
              {[
                { key: "credito", label: "Cartão", icon: "card-outline" },
                { key: "debito", label: "Débito", icon: "card-outline" },
                { key: "pix", label: "PIX", icon: "qr-code-outline" },
              ].map((tipo) => (
                <TouchableOpacity
                  key={tipo.key}
                  style={[
                    styles.tipoButton,
                    tipoPagamento === tipo.key && styles.tipoSelecionado
                  ]}
                  onPress={() => setTipoPagamento(tipo.key)}
                >
                  <Ionicons
                    name={tipo.icon}
                    size={24}
                    color={tipoPagamento === tipo.key ? "#FFC125" : "#666"}
                  />
                  <Text style={[
                    styles.tipoButtonText,
                    tipoPagamento === tipo.key && styles.tipoButtonTextSelecionado
                  ]}>
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {tipoPagamento === "credito" || tipoPagamento === "debito" ? (
              <View style={styles.cartaoContainer}>
                <View style={[
                  styles.cartaoPreview,
                  { backgroundColor: bandeiraAtual ? bandeirasCartao[bandeiraAtual]?.cor : "#ffc125" }
                ]}>
                  <View style={styles.cartaoHeader}>
                    <Text style={styles.cartaoChip}>⌷</Text>
                    {bandeiraAtual && (
                      <View style={styles.bandeiraIcon}>
                        <Image
                          source={bandeirasCartao[bandeiraAtual]?.imagem}
                          style={{ width: 60, height: 40, resizeMode: "contain", marginLeft: 7 }}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.cartaoNumero}>
                    {dadosCartao.numero || "•••• •••• •••• ••••"}
                  </Text>
                  <View style={styles.cartaoFooter}>
                    <View>
                      <Text style={styles.cartaoLabel}>NOME DO TITULAR</Text>
                      <Text style={styles.cartaoTexto}>
                        {dadosCartao.nome || "SEU NOME"}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.cartaoLabel}>VALIDADE</Text>
                      <Text style={styles.cartaoTexto}>
                        {dadosCartao.validade || "MM/AA"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Formulário do Cartão */}
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Número do cartão"
                      style={styles.input}
                      keyboardType="number-pad"
                      value={dadosCartao.numero}
                      onChangeText={(text) => setDadosCartao({ ...dadosCartao, numero: formatarNumeroCartao(text) })}
                      maxLength={19}
                    />
                  </View>
                  {errors.numero && <Text style={styles.error}>{errors.numero}</Text>}

                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nome no cartão"
                      style={styles.input}
                      value={dadosCartao.nome}
                      onChangeText={(text) => setDadosCartao({ ...dadosCartao, nome: text })}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 2, marginRight: 10 }]}>
                      <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInputMask
                        type={"custom"}
                        options={{ mask: '99/99' }}
                        placeholder="MM/AA"
                        style={styles.input}
                        value={dadosCartao.validade}
                        onChangeText={(text) => setDadosCartao({ ...dadosCartao, validade: text })}
                      />
                    </View>

                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        placeholder="CVV"
                        style={styles.input}
                        keyboardType="number-pad"
                        secureTextEntry
                        value={dadosCartao.cvv}
                        onChangeText={(text) => setDadosCartao({ ...dadosCartao, cvv: text })}
                        maxLength={4}
                      />
                    </View>
                  </View>
                  {(errors.validade || errors.cvv) && (
                    <Text style={styles.error}>{errors.validade || errors.cvv}</Text>
                  )}

                  {tipoPagamento === "credito" && (
                    <View style={styles.inputContainer}>
                      <Ionicons name="grid-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        placeholder="Parcelas (1x)"
                        style={styles.input}
                        value={dadosCartao.parcelas}
                        onChangeText={(text) => setDadosCartao({ ...dadosCartao, parcelas: text })}
                        keyboardType="number-pad"
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.pixContainer}>
                <View style={styles.pixInfo}>
                  <Ionicons name="qr-code" size={50} color="#FFC125" />
                  <Text style={styles.pixTitle}>Pagamento via PIX</Text>
                  <Text style={styles.pixDescription}>
                    Escaneie o QR Code ou use a chave PIX para pagar
                  </Text>
                </View>

                <View style={styles.qrCodeContainer}>
                  <Image
                    source={{ uri: dadosPix.qrCode }}
                    style={styles.qrCode}
                  />
                </View>

                <View style={styles.pixChaveContainer}>
                  <Text style={styles.pixChaveLabel}>Chave PIX:</Text>
                  <View style={styles.pixChaveValue}>
                    <Text style={styles.pixChaveText}>{dadosPix.chave}</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                      <Ionicons name="copy-outline" size={20} color="#FFC125" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.pixTimer}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.pixTimerText}>Válido por 30 minutos</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.botao, loading && styles.botaoDisabled]}
              onPress={handlePagamento}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.botaoTexto}>
                    {tipoPagamento === "pix" ? "Gerar PIX" : `Pagar R$ ${planoSelecionado.valor.toFixed(2).replace('.', ',')}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {step === "loading" && (
          <View style={[styles.section, styles.centerContent]}>
            <ActivityIndicator size="large" color="#FFC125" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Processando pagamento...</Text>
            <Text style={styles.subtitle}>Aguarde enquanto confirmamos seu pagamento</Text>

            <View style={styles.loadingSteps}>
              <View style={styles.loadingStep}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.loadingStepText}>Dados validados</Text>
              </View>
              <View style={styles.loadingStep}>
                <ActivityIndicator size="small" color="#FFC125" />
                <Text style={styles.loadingStepText}>Processando pagamento</Text>
              </View>
              <View style={styles.loadingStep}>
                <Ionicons name="time-outline" size={24} color="#CCC" />
                <Text style={styles.loadingStepText}>Finalizando</Text>
              </View>
            </View>
          </View>
        )}

        {/* Sucesso */}
        {step === "sucesso" && planoSelecionado && (
          <View style={[styles.section, styles.centerContent]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>

            <Text style={styles.title}>Pagamento Aprovado!</Text>
            <Text style={styles.subtitle}>Seu plano foi ativado com sucesso</Text>

            <View style={styles.resumoContainer}>
              <Text style={styles.resumoTitle}>Resumo da Compra</Text>
              <View style={styles.resumoItem}>
                <Text>Plano:</Text>
                <Text style={styles.resumoValue}>{planoSelecionado.nome}</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text>Valor:</Text>
                <Text style={styles.resumoValue}>R$ {planoSelecionado.valor.toFixed(2).replace('.', ',')}/mês</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text>Forma de pagamento:</Text>
                <Text style={styles.resumoValue}>
                  {tipoPagamento === "credito" ? "Cartão de Crédito" :
                    tipoPagamento === "debito" ? "Cartão de Débito" : "PIX"}
                </Text>
              </View>
              {tipoPagamento === "credito" && (
                <View style={styles.resumoItem}>
                  <Text>Parcelas:</Text>
                  <Text style={styles.resumoValue}>{dadosCartao.parcelas}x</Text>
                </View>
              )}
              <View style={styles.resumoItem}>
                <Text>Próxima cobrança:</Text>
                <Text style={styles.resumoValue}>
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => {
                setStep("dados");
                setPlanoSelecionado(null);
                setDadosCartao({ numero: "", nome: "", validade: "", cvv: "", parcelas: "1" });
                setForm({ nome: "", cpf: "", nascimento: "", email: "", telefone: "" });
                router.replace("/tabs/home");
              }}
            >
              <Text style={styles.botaoTexto}>Acessar Minha Conta</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffe772ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  progressDotCompleted: {
    backgroundColor: "#FFC125",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#CCC",
    marginHorizontal: 5,
  },
  progressLineCompleted: {
    backgroundColor: "#FFC125",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  error: {
    color: "#FF3B30",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 8,
  },
  botao: {
    backgroundColor: "#FFC125",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  botaoDisabled: {
    backgroundColor: "#CCC",
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  // Estilos para planos
  planoCard: {
    borderWidth: 2,
    borderColor: "#EEE",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  planoCardSelecionado: {
    borderColor: "#FFC125",
    backgroundColor: "#FFFBF0",
  },
  planoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  planoRadio: {
    marginRight: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelecionado: {
    borderColor: "#FFC125",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFC125",
  },
  planoInfo: {
    flex: 1,
  },
  planoNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  planoValor: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFC125",
    marginTop: 4,
  },
  beneficiosContainer: {
    marginBottom: 16,
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
    flex: 1,
  },
  // Estilos para pagamento
  resumoPlano: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  resumoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  resumoPlanoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resumoPlanoValor: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFC125",
  },
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  tipoButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#EEE",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tipoSelecionado: {
    borderColor: "#FFC125",
    backgroundColor: "#FFFBF0",
  },
  tipoButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  tipoButtonTextSelecionado: {
    color: "#FFC125",
    fontWeight: "bold",
  },
  // Estilos para cartão
  cartaoContainer: {
    marginBottom: 16,
  },
  cartaoPreview: {
    backgroundColor: "#f5db9bff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    height: 200,
    justifyContent: "space-between",
  },
  cartaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartaoChip: {
    fontSize: 32,
    color: "#ffbb00ff",
  },
  bandeiraIcon: {
    height: 10,
  },
  cartaoNumero: {
    fontSize: 18,
    letterSpacing: 2,
    color: "#FFF",
    fontWeight: "500",
  },
  cartaoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartaoLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  cartaoTexto: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },
  formContainer: {
    marginTop: 8,
  },
  // Estilos para PIX
  pixContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  pixInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  pixTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },
  pixDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  qrCodeContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  pixChaveContainer: {
    width: "100%",
    marginBottom: 16,
  },
  pixChaveLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  pixChaveValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  pixChaveText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  copyButton: {
    padding: 4,
  },
  pixTimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
  },
  pixTimerText: {
    marginLeft: 8,
    color: "#856404",
    fontWeight: "500",
  },
  // Estilos para loading
  loadingSteps: {
    width: "100%",
    marginTop: 30,
  },
  loadingStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingStepText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  // Estilos para sucesso
  successIcon: {
    marginBottom: 20,
  },
  resumoContainer: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
  },
  resumoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  resumoValue: {
    fontWeight: "600",
    color: "#333",
  },
});