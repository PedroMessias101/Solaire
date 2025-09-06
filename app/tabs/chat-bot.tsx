import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Mensagem = {
  origem: "usuario" | "bot";
  texto: string;
};

export default function AssistenteVirtual() {
  const [visivel, setVisivel] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [digitando, setDigitando] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const abrirChat = () => {
    setVisivel(true);
    setMensagens([]);
    setDigitando(true);

    setTimeout(() => {
      setDigitando(false);
      setMensagens([
        {
          origem: "bot",
          texto:
            "Olá, eu sou o seu assistente virtual do app Solaire. Como posso te ajudar?",
        },
      ]);
    }, 1500);
  };

  const perguntasFrequentes = [
    {
      pergunta: "Como funciona a mini placa solar?",
      resposta: "Ela converte a energia do sol em eletricidade em tempo real.",
    },
    {
      pergunta: "Posso carregar uma bateria Li-ion?",
      resposta:
        "Sim, desde que use um regulador de carga apropriado para proteger a bateria.",
    },
    {
      pergunta: "O app mostra os dados em tempo real?",
      resposta:
        "Sim! O Arduino envia as informações para o app via Bluetooth/Wi-Fi.",
    },
    {
      pergunta: "Qual a potência máxima da placa?",
      resposta:
        "A potência depende do modelo, mas geralmente varia de 5W a 20W.",
    },
    {
      pergunta: "Funciona em dias nublados?",
      resposta:
        "Sim, mas a eficiência é reduzida pois a radiação solar é menor.",
    },
  ];

  const responderPergunta = (pergunta: string, resposta: string) => {
    setMensagens((prev) => [...prev, { origem: "usuario", texto: pergunta }]);
    setDigitando(true);

    setTimeout(() => {
      setDigitando(false);
      setMensagens((prev) => [...prev, { origem: "bot", texto: resposta }]);
    }, 1500);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [mensagens, digitando]);

  return (
    <View style={estilos.tela}>
      <TouchableOpacity style={estilos.botaoChat} onPress={abrirChat}>
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={estilos.fundoModal}>
          <View style={estilos.conteudoModal}>
            <View style={estilos.cabecalho}>
              <Text style={estilos.textoCabecalho}>Assistente Virtual</Text>
              <TouchableOpacity onPress={() => setVisivel(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={estilos.areaChat}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {mensagens.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    estilos.mensagem,
                    msg.origem === "usuario"
                      ? estilos.mensagemUsuario
                      : estilos.mensagemBot,
                  ]}
                >
                  <Text style={estilos.textoMensagem}>{msg.texto}</Text>
                </View>
              ))}

              {digitando && (
                <View style={[estilos.mensagem, estilos.mensagemBot]}>
                  <IndicadorDigitando />
                </View>
              )}
            </ScrollView>

            <View style={estilos.areaPerguntas}>
              <Text style={estilos.tituloOpcoes}>Qual a sua dúvida?</Text>
              <ScrollView
                style={estilos.listaPerguntas}
                showsVerticalScrollIndicator={false}
              >
                {perguntasFrequentes.map((item, index) => (
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[ponto1, ponto2, ponto3].map((ponto, i) => (
        <Animated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#555",
            marginHorizontal: 3,
            transform: [{ translateY: ponto }],
          }}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  botaoChat: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#fcbb30",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  conteudoModal: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    flex: 1,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  textoCabecalho: {
    fontSize: 18,
    fontWeight: "bold",
  },
  areaChat: {
    flex: 1,
    marginBottom: 10,
  },
  mensagem: {
    padding: 10,
    marginVertical: 5,
    maxWidth: "75%",
    borderRadius: 12,
  },
  mensagemUsuario: {
    backgroundColor: "#ffdd95ff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  mensagemBot: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  textoMensagem: {
    fontSize: 14,
    color: "#000",
  },
  areaPerguntas: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 8,
    maxHeight: 130,
  },
  listaPerguntas: {
    flexGrow: 0,
  },
  tituloOpcoes: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  botaoOpcao: {
    backgroundColor: "#fcbb30",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  textoOpcao: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
