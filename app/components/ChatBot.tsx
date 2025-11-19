import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Mensagem {
  id: string;
  remetente: "user" | "bot";
  texto: string;
  timestamp: Date;
}

interface Categoria {
  nome: string;
  perguntas: { pergunta: string; resposta: string }[];
}

const { width, height } = Dimensions.get('window');

export default function ChatAssistenteModal(): JSX.Element {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [digitando, setDigitando] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animações para o efeito de collapse do header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(80)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  const categorias: Categoria[] = [
    {
      nome: "Funcionamento do Sistema",
      perguntas: [
        {
          pergunta: "Como o meu sistema de energia solar funciona?",
          resposta:
            "Os painéis solares captam a luz do sol e a transformam em energia elétrica através do efeito fotovoltaico. Essa energia é enviada para o inversor, que a converte para o formato utilizado em sua residência. O excedente é injetado na rede da distribuidora, gerando créditos energéticos.",
        },
        {
          pergunta: "Qual o desempenho do sistema em condições climáticas adversas?",
          resposta:
            "Em dias nublados, a produção é reduzida, porém o sistema continua operando com luz difusa. Durante a noite ou produção insuficiente, o sistema automaticamente utiliza energia da rede convencional, garantindo abastecimento contínuo.",
        },
        {
          pergunta: "Qual a manutenção necessária para os painéis solares?",
          resposta:
            "Recomendamos limpeza semestral para otimizar o desempenho. A chuva realiza limpeza natural, porém em regiões com maior incidência de poeira ou folhas, pode ser necessária limpeza trimestral.",
        },
      ],
    },
    {
      nome: "Suporte Técnico",
      perguntas: [
        {
          pergunta: "O sistema apresentou falha. Quais procedimentos adotar?",
          resposta:
            "Verifique: 1) Mensagens de erro no inversor 2) Chave geral ligada 3) Conexão com a rede. Persistindo o problema, registre um chamado técnico através do aplicativo para atendimento especializado.",
        },
        {
          pergunta: "O inversor está sinalizando alerta vermelho",
          resposta:
            "Indicativo de anomalia operacional. Documente o código de erro e entre em contato com nosso suporte técnico através do aplicativo para diagnóstico remoto.",
        },
        {
          pergunta: "Sistema não está visível no aplicativo",
          resposta:
            "Execute: 1) Verificação de conectividade internet 2) Reinicialização do aplicativo 3) Aguarde 30 minutos. Caso persista, contate nosso suporte para verificação de comunicação com o inversor.",
        },
      ],
    },
    {
      nome: "Relatórios e Dados",
      perguntas: [
        {
          pergunta: "Como acessar relatórios de produção energética?",
          resposta:
            "Acesse: Configurações > Exportar Dados. Disponibilizamos relatórios detalhados em formatos PDF e Excel para análise de desempenho.",
        },
        {
          pergunta: "Quais métricas estão disponíveis para monitoramento?",
          resposta:
            "Fornecemos: produção horária/diária/mensal, eficiência do sistema, comparação com períodos anteriores, e projeções de economia.",
        },
      ],
    },
  ];

  // Configurar animações baseadas no scroll
  useEffect(() => {
    const headerListener = scrollY.addListener(({ value }) => {
      // Calcula o progresso da animação baseado no scroll
      const progress = Math.min(value / 50, 1);
      
      // Header encolhe de 80 para 60
      headerHeight.setValue(80 - (20 * progress));
      
      // Título desaparece gradualmente
      titleOpacity.setValue(1 - progress);
      
      // Ícone cresce ligeiramente
      iconScale.setValue(1 + (0.2 * progress));
    });

    return () => {
      scrollY.removeListener(headerListener);
    };
  }, []);

  // Mensagem de boas-vindas com delay
  useEffect(() => {
    if (visivel && mensagens.length === 0) {
      setDigitando(true);
      const timer = setTimeout(() => {
        adicionarMensagem(
          "bot",
          "Olá! Eu sou o assistente virtual da Solaire. Estou aqui para ajudar você com dúvidas sobre seu sistema de energia solar. 😊"
        );
        setDigitando(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [visivel]);

  const adicionarMensagem = (remetente: "user" | "bot", texto: string) => {
    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      remetente,
      texto,
      timestamp: new Date(),
    };
    setMensagens((prev) => [...prev, novaMensagem]);
  };

  const responderPergunta = (pergunta: string, resposta: string) => {
    adicionarMensagem("user", pergunta);
    setDigitando(true);

    setTimeout(() => {
      adicionarMensagem("bot", resposta);
      setDigitando(false);
    }, 1500);
  };

  // Scroll automático para novas mensagens
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [mensagens, digitando]);

  const fecharModal = () => {
    setVisivel(false);
    setCategoriaSelecionada(null);
    // Resetar animações quando fechar
    headerHeight.setValue(80);
    titleOpacity.setValue(1);
    iconScale.setValue(1);
    scrollY.setValue(0);
  };

  const reiniciarChat = () => {
    setMensagens([]);
    setCategoriaSelecionada(null);
    setDigitando(true);
    
    // Resetar scroll position
    scrollY.setValue(0);
    
    setTimeout(() => {
      adicionarMensagem(
        "bot",
        "Olá! Eu sou o assistente virtual da Solaire. Estou aqui para ajudar você com dúvidas sobre seu sistema de energia solar. 😊"
      );
      setDigitando(false);
    }, 1000);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Botão flutuante */}
      <TouchableOpacity 
        style={estilos.botaoChat} 
        onPress={() => setVisivel(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#ffff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visivel} animationType="slide" transparent>
        <View style={estilos.modalFundo}>
          <View style={estilos.modalContainer}>
            
            {/* Cabeçalho Animado */}
            <Animated.View 
              style={[
                estilos.topoModal,
                { height: headerHeight }
              ]}
            >
              <View style={estilos.infoAssistente}>
                <Animated.View 
                  style={[
                    estilos.avatar,
                    { transform: [{ scale: iconScale }] }
                  ]}
                >
                  <Ionicons name="solar" size={20} color="#FFA500" />
                </Animated.View>
                <Animated.View 
                  style={[
                    estilos.textoContainer,
                    { opacity: titleOpacity }
                  ]}
                >
                  <Text style={estilos.tituloModal}>Assistente Solaire</Text>
                  <Text style={estilos.status}>Online</Text>
                </Animated.View>
              </View>
              <View style={estilos.botoesTopo}>
                <TouchableOpacity onPress={reiniciarChat} style={estilos.botaoTopo}>
                  <Ionicons name="refresh" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={fecharModal} style={estilos.botaoTopo}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Área de Mensagens com Scroll Animado */}
            <Animated.ScrollView
              ref={scrollViewRef}
              style={estilos.mensagensContainer}
              contentContainerStyle={estilos.conteudoMensagens}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {mensagens.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    estilos.mensagem,
                    msg.remetente === "user" ? estilos.mensagemUser : estilos.mensagemBot,
                  ]}
                >
                  <Text style={estilos.textoMensagem}>{msg.texto}</Text>
                  <Text style={estilos.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              ))}

              {/* Indicador de digitando */}
              {digitando && (
                <View style={[estilos.mensagem, estilos.mensagemBot]}>
                  <IndicadorDigitacao />
                </View>
              )}
            </Animated.ScrollView>

            {/* Área de Perguntas */}
            {!categoriaSelecionada ? (
              <View style={estilos.areaPerguntas}>
                <Text style={estilos.tituloOpcoes}>Escolha um tema para conversarmos:</Text>
                <ScrollView 
                  style={estilos.listaCategorias}
                  showsVerticalScrollIndicator={false}
                >
                  {categorias.map((cat, index) => (
                    <TouchableOpacity
                      key={index}
                      style={estilos.botaoOpcao}
                      onPress={() => setCategoriaSelecionada(cat.nome)}
                    >
                      <Text style={estilos.textoOpcao}>{cat.nome}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={estilos.areaPerguntas}>
                <View style={estilos.topoPerguntas}>
                  <TouchableOpacity
                    style={estilos.botaoVoltar}
                    onPress={() => setCategoriaSelecionada(null)}
                  >
                    <Ionicons name="arrow-back" size={20} color="#333" />
                    <Text style={estilos.textoVoltar}>Voltar</Text>
                  </TouchableOpacity>
                  <Text style={estilos.tituloCategoria}>
                    {categoriaSelecionada}
                  </Text>
                  <View style={{ width: 60 }} />
                </View>

                <ScrollView 
                  style={estilos.listaPerguntas}
                  showsVerticalScrollIndicator={false}
                >
                  {categorias
                    .find((c) => c.nome === categoriaSelecionada)
                    ?.perguntas.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={estilos.botaoPergunta}
                        onPress={() => responderPergunta(item.pergunta, item.resposta)}
                      >
                        <Text style={estilos.textoPergunta}>{item.pergunta}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Componente de Indicador de Digitação
function IndicadorDigitacao(): JSX.Element {
  const ponto1 = useRef(new Animated.Value(0)).current;
  const ponto2 = useRef(new Animated.Value(0)).current;
  const ponto3 = useRef(new Animated.Value(0)).current;

  const animar = (ponto: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ponto, {
          toValue: -5,
          duration: 300,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(ponto, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animar(ponto1, 0);
    animar(ponto2, 150);
    animar(ponto3, 300);
  }, []);

  return (
    <View style={estilos.containerDigitacao}>
      <Text style={estilos.textoDigitacao}>Digitando</Text>
      <View style={estilos.pontosContainer}>
        <Animated.View style={[estilos.ponto, { transform: [{ translateY: ponto1 }] }]} />
        <Animated.View style={[estilos.ponto, { transform: [{ translateY: ponto2 }] }]} />
        <Animated.View style={[estilos.ponto, { transform: [{ translateY: ponto3 }] }]} />
      </View>
    </View>
  );
}

// Estilos
const estilos = StyleSheet.create({
  botaoChat: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
    overflow: "hidden",
  },
  topoModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    minHeight: 60,
  },
  infoAssistente: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#FFE4B2",
  },
  textoContainer: {
    flex: 1,
  },
  tituloModal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  status: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "500",
  },
  botoesTopo: {
    flexDirection: "row",
    alignItems: "center",
  },
  botaoTopo: {
    padding: 8,
    marginLeft: 8,
  },
  mensagensContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  conteudoMensagens: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  mensagem: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  mensagemUser: {
    backgroundColor: "#FFA500",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  mensagemBot: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  textoMensagem: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  areaPerguntas: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    backgroundColor: "#fff",
    maxHeight: 250,
  },
  tituloOpcoes: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  listaCategorias: {
    maxHeight: 150,
  },
  topoPerguntas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  textoVoltar: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
  },
  tituloCategoria: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  listaPerguntas: {
    maxHeight: 150,
  },
  botaoOpcao: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  botaoPergunta: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  textoOpcao: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  textoPergunta: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  containerDigitacao: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoDigitacao: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  pontosContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ponto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666",
    marginHorizontal: 2,
  },
});