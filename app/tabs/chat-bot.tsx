import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Mensagem {
  remetente: "user" | "bot";
  texto: string;
}

export default function ChatAssistenteModal() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [digitando, setDigitando] = useState(false); // controla bolinhas
  const scrollViewRef = useRef<ScrollView>(null);

  const categorias =
    [{
      nome: "Sobre o Sistema",
      perguntas: [{ pergunta: "Como o meu sistema de energia solar funciona?", resposta: "Os painéis solares captam a luz do sol e a transformam em energia elétrica. Essa energia é enviada para um equipamento chamado inversor, que a converte para o formato que você usa em sua casa. A energia excedente é enviada para a rede da distribuidora, gerando créditos para você." },
      { pergunta: "O que acontece em dias nublados ou chuvosos?", resposta: "Em dias nublados, a produção de energia é menor, mas o sistema continua funcionando, pois os painéis captam a luz difusa. Se a produção for insuficiente, o aplicativo irá buscar a energia que falta da rede elétrica da distribuidora, garantindo o funcionamento normal da sua casa." },
      { pergunta: "Preciso limpar os painéis solares? Com que frequência?", resposta: "Recomendamos uma limpeza anual para garantir o melhor desempenho. A chuva costuma fazer uma limpeza natural, mas o acúmulo de poeira ou folhas pode reduzir a eficiência. Se notar sujeira, é bom limpar." },],
    },
    {
      nome: "Problemas e Suporte Técnico", perguntas: [{ pergunta: "O sistema parou de funcionar. O que devo fazer?", resposta: "Primeiro, verifique se há alguma mensagem de erro no seu inversor e se a chave de energia está ligada. Se o problema persistir, abra um chamado no aplicativo, e nosso suporte técnico entrará em contato com você o mais rápido possível." },
      { pergunta: "O meu inversor está com uma luz vermelha. O que isso quer dizer?", resposta: "Uma luz vermelha geralmente indica um problema no inversor. Pode ser um erro de conexão ou outro problema técnico. Por favor, tire uma foto e abra um chamado em nosso suporte técnico no aplicativo para que possamos analisar e te ajudar." },
      { pergunta: "Meu sistema não aparece no aplicativo. O que devo fazer?", resposta: "Isso pode acontecer por alguns motivos. Primeiro, verifique sua conexão com a internet. Se estiver tudo certo, pode ser um problema de comunicação com o inversor. Reinicie o aplicativo. Se o problema persistir por mais de 30 minutos, por favor, entre em contato com nosso suporte técnico pelo próprio aplicativo" },
      { pergunta: "O aplicativo não está atualizando os dados. Existe um problema?", resposta: "A maioria dos dados é atualizada a cada 5 ou 10 minutos. Se você notar que os dados estão parados por um tempo prolongado, verifique a conexão Wi-Fi do seu inversor. Se o problema persistir, entre em contato com o suporte" },
      { pergunta: "Posso baixar um relatório de produção de energia em PDF ou Excel?", resposta: "Sim! Vá em Configurações > Exportar Dados para baixar um relatório detalhado." },],
    },
    {
      nome: "Sobre Alertas e Notificações", perguntas: [{ pergunta: "Recebi uma notificação sobre 'baixa produção'. O que isso quer dizer?", resposta: "Isso significa que o seu sistema está gerando menos energia do que o esperado para o horário. Pode ser devido a condições climáticas (nuvens ou chuva), sujeira nos painéis ou um problema técnico. O aplicativo geralmente sugere a causa provável." },
      { pergunta: "O que devo fazer quando recebo um alerta de erro?", resposta: "Não se preocupe! A maioria dos erros pode ser resolvida facilmente. O alerta fornecerá um código de erro ou uma descrição do problema. Siga as instruções do aplicativo. Se for necessário, ele irá direcioná-lo para a opção de solicitar suporte técnico." },],
    },];

  // Primeira mensagem com delay
  useEffect(() => {
    setDigitando(true);
    const timer = setTimeout(() => {
      setMensagens([
        {
          remetente: "bot",
          texto: "Olá, eu sou o assistente virtual da Solaire, como posso te ajudar?",
        },
      ]);
      setDigitando(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Responder pergunta com atraso e bolinhas
  const responderPergunta = (pergunta: string, resposta: string) => {
    setMensagens((prev) => [...prev, { remetente: "user", texto: pergunta }]);
    setDigitando(true);

    setTimeout(() => {
      setMensagens((prev) => [...prev, { remetente: "bot", texto: resposta }]);
      setDigitando(false);
    }, 2000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [mensagens, digitando]);

  return (
    <View style={{ flex: 1 }}>
      {/* Botão flutuante */}
      <TouchableOpacity style={estilos.botaoChat} onPress={() => setVisivel(true)}>
        <Ionicons name="chatbubble-ellipses" size={26} color="#000" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={estilos.modalFundo}>
          <View style={estilos.modalContainer}>
            <View style={estilos.topoModal}>
              <Text style={estilos.tituloModal}>Assistente Virtual</Text>
              <TouchableOpacity onPress={() => setVisivel(false)}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Mensagens */}
            <ScrollView
              ref={scrollViewRef}
              style={estilos.mensagensContainer}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {mensagens.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    estilos.mensagem,
                    msg.remetente === "user"
                      ? estilos.mensagemUser
                      : estilos.mensagemBot,
                  ]}
                >
                  <Text style={estilos.textoMensagem}>{msg.texto}</Text>
                </View>
              ))}

              {/* digitando (bolinhas)*/}
              {digitando && (
                <View style={[estilos.mensagem, estilos.mensagemBot]}>
                  <IndicadorDigitando />
                </View>
              )}
            </ScrollView>

            {/* Perguntas */}
            {!categoriaSelecionada ? (
              <View style={estilos.areaPerguntas}>
                <Text style={estilos.tituloOpcoes}>Escolha um tema:</Text>
                {categorias.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={estilos.botaoOpcao}
                    onPress={() => setCategoriaSelecionada(cat.nome)}
                  >
                    <Text style={estilos.textoOpcao}>{cat.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={estilos.areaPerguntas}>
                <View style={estilos.topoPerguntas}>
                  <TouchableOpacity
                    style={estilos.botaoVoltar}
                    onPress={() => setCategoriaSelecionada(null)}
                  >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={estilos.tituloCategoria}>
                    Perguntas de {categoriaSelecionada}
                  </Text>
                  <View style={{ width: 24 }} />
                </View>

                <ScrollView style={estilos.listaPerguntas}>
                  {categorias
                    .find((c) => c.nome === categoriaSelecionada)
                    ?.perguntas.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={estilos.botaoOpcao}
                        onPress={() =>
                          responderPergunta(item.pergunta, item.resposta)
                        }
                      >
                        <Text style={estilos.textoOpcao}>{item.pergunta}</Text>
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

/* digitando */
function IndicadorDigitando() {
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
    <View style={{ flexDirection: "row", padding: 6 }}>
      <Animated.View style={[estilos.ponto, { transform: [{ translateY: ponto1 }] }]} />
      <Animated.View style={[estilos.ponto, { transform: [{ translateY: ponto2 }] }]} />
      <Animated.View style={[estilos.ponto, { transform: [{ translateY: ponto3 }] }]} />
    </View>
  );
}

/* Estilos */
const estilos = StyleSheet.create({
  botaoChat: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#fcbb30",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
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
    height: "80%",
    padding: 12,
  },
  topoModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tituloModal: {
    fontSize: 16,
    fontWeight: "600",
  },
  mensagensContainer: {
    flex: 1,
    padding: 8,
  },
  mensagem: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  mensagemUser: {
    backgroundColor: "#fee5b0ff",
    alignSelf: "flex-end",
  },
  mensagemBot: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  textoMensagem: {
    fontSize: 14,
    color: "#333",
  },
  areaPerguntas: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    backgroundColor: "#fff",
  },
  tituloOpcoes: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  topoPerguntas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  botaoVoltar: {
    padding: 4,
  },
  tituloCategoria: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  listaPerguntas: {
    maxHeight: 200,
  },
  botaoOpcao: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  textoOpcao: {
    fontSize: 14,
    color: "#333",
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    marginHorizontal: 2,
  },
});
