import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const CHAVE_NOTIFICACOES = "@notificacoes";
const CHAVE_BOAS_VINDAS = "@notificacao_boas_vindas"; // flag para boas-vindas

const carregarNotificacoes = async () => {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_NOTIFICACOES);
    return valor ? JSON.parse(valor) : [];
  } catch (err) {
    console.log("Erro ao carregar notificações:", err);
    return [];
  }
};

const salvarNotificacoes = async (lista: any[]) => {
  try {
    await AsyncStorage.setItem(CHAVE_NOTIFICACOES, JSON.stringify(lista));
  } catch (err) {
    console.log("Erro ao salvar notificações:", err);
  }
};

export const adicionarNotificacao = async (titulo: string, mensagem: string) => {
  const hora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const notificacoes = await carregarNotificacoes();

  const nova = {
    id: Date.now().toString(),
    titulo,
    mensagem,
    hora,
  };

  const atualizadas = [nova, ...notificacoes];
  await salvarNotificacoes(atualizadas);
};

const Notificacoes = () => {
  const [visible, setVisible] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  useEffect(() => {
    const initNotificacoes = async () => {
      // Verifica se a notificação de boas-vindas já foi exibida
      const jaExibida = await AsyncStorage.getItem(CHAVE_BOAS_VINDAS);
      if (!jaExibida) {
        await adicionarNotificacao("Bem-vindo!", "Obrigado por instalar nosso app.");
        await AsyncStorage.setItem(CHAVE_BOAS_VINDAS, "true"); // marca como exibida
      }

      // Atualiza lista e agenda futuras notificações
      atualizarLista();
      agendarNotificacoes();
    };

    initNotificacoes();
  }, []);

  const atualizarLista = async () => {
    const lista = await carregarNotificacoes();
    setNotificacoes(lista);
  };
  const agendarNotificacoes = () => {
    setTimeout(async () => {
      await adicionarNotificacao("Você sabia?", "Placas limpas podem gerar até 15% mais energia.");
      atualizarLista();
    }, 10000);

    setTimeout(async () => {
      await adicionarNotificacao("Continue monitorando!", "Cada dia de cuidado aumenta a vida útil das placas.");
      atualizarLista();
    }, 30000);
  };

  const abrirModal = async () => {
    await atualizarLista();
    setVisible(true);
  };

  const fecharModal = () => {
    setVisible(false);
    atualizarLista();
  };

  const limparNotificacoes = async () => {
    await salvarNotificacoes([]);
    setNotificacoes([]);
  };

  return (
    <View>
      <TouchableOpacity style={styles.sino} onPress={abrirModal}>
        <Ionicons name="notifications-outline" size={28} color="#333" />
        {notificacoes.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificacoes.length > 9 ? "9+" : notificacoes.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.popover}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notificações</Text>
              <TouchableOpacity onPress={fecharModal}>
                <Ionicons name="close" size={25} color="#555" />
              </TouchableOpacity>
            </View>

            {notificacoes.length === 0 ? (
              <Text style={styles.semNotif}>Nenhuma notificação</Text>
            ) : (
              <FlatList
                data={notificacoes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="time-outline" size={14} color="#888" />
                      <Text style={styles.hora}>{item.hora}</Text>
                    </View>
                    <Text style={styles.titulo}>{item.titulo}</Text>
                    <Text style={styles.msg}>{item.mensagem}</Text>
                  </View>
                )}
              />
            )}

            {notificacoes.length > 0 && (
              <TouchableOpacity style={styles.limparBtn} onPress={limparNotificacoes}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.limparTxt}>Limpar todas</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Notificacoes;

const styles = StyleSheet.create({
  sino: {
    marginRight: 15,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 10,
  },
  popover: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 300,
    maxHeight: 420,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  semNotif: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  hora: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
  },
  titulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  msg: {
    fontSize: 14,
    color: "#444",
  },
  limparBtn: {
    flexDirection: "row",
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  limparTxt: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
});
