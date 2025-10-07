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

// Funções auxiliares
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

export const adicionarNotificacao = async (
  titulo: string,
  mensagem: string
) => {
  const hora = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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

// === COMPONENTE ===
const Notificacoes = () => {
  const [visible, setVisible] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  // Carrega notificações quando o componente monta
  useEffect(() => {
    atualizarLista();
  }, []);

  const atualizarLista = async () => {
    const lista = await carregarNotificacoes();
    setNotificacoes(lista);
  };

  const abrirModal = async () => {
    await atualizarLista();
    setVisible(true);
  };

  const fecharModal = () => {
    setVisible(false);
    atualizarLista(); // Atualiza depois de fechar (caso tenha limpado)
  };

  const limparNotificacoes = async () => {
    await salvarNotificacoes([]);
    setNotificacoes([]);
  };

  return (
    <View>
      {/* Ícone do sino */}
      <TouchableOpacity style={styles.sino} onPress={abrirModal}>
        <Ionicons name="notifications-outline" size={28} color="#000" />
        {notificacoes.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificacoes.length > 9 ? "9+" : notificacoes.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal popover */}
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.popover}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notificações</Text>
              <TouchableOpacity onPress={fecharModal}>
                <Ionicons name="close" size={25} color="#000" />
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
                    <Text style={styles.hora}>{item.hora}</Text>
                    <Text style={styles.titulo}>{item.titulo}</Text>
                    <Text style={styles.msg}>{item.mensagem}</Text>
                  </View>
                )}
              />
            )}

            {notificacoes.length > 0 && (
              <TouchableOpacity
                style={styles.limparBtn}
                onPress={limparNotificacoes}
              >
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

// === ESTILOS ===
const styles = StyleSheet.create({
  sino: {
    marginRight: 15,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 10,
  },
  popover: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 280,
    maxHeight: 400,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  semNotif: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  card: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  hora: {
    fontSize: 12,
    color: "#666",
  },
  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 3,
  },
  msg: {
    fontSize: 14,
    color: "#444",
  },
  limparBtn: {
    backgroundColor: "#e53935",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  limparTxt: {
    color: "#fff",
    fontWeight: "bold",
  },
});
