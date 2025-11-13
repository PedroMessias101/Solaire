import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedBottomNavBar } from "../components/AnimatedBottomNavBar";
import { useRouter } from "expo-router";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Como posso adicionar minha placa solar?",
      answer: "Para adicionar sua placa, vá até a tela de 'Gerenciar Placas' e clique em 'Adicionar Placa'."
    },
    {
      question: "Como funcionam os alertas de produção baixa?",
      answer: "Você será notificado automaticamente quando a produção de energia da sua placa cair abaixo do esperado."
    },
    {
      question: "Posso alterar minhas preferências de notificação?",
      answer: "Sim! Acesse 'Configurações > Notificações' para habilitar ou desabilitar os alertas que desejar."
    },
    {
      question: "Como entrar em contato com o suporte?",
      answer: "Você pode entrar em contato através do chat ou enviando um e-mail para suporte@solaire.com."
    }
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tela}>
        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <Text style={styles.tituloCabecalho}>FAQ</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Lista de perguntas */}
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.tituloItem}>{faq.question}</Text>
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#ffc125"
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.subtituloItemResposta}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AnimatedBottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tituloCabecalho: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  tituloItem: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subtituloItemResposta: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
  },
});
