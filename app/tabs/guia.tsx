import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";



export default function UserGuideScreen({ navigation }) {
    const sections = [
        {
            title: "Monitoramento de Energia",
            icon: "sunny-outline",
            text:
                "Acompanhe a geração de energia em tempo real, visualize gráficos e consulte o desempenho de cada placa solar individualmente.",
        },
        {
            title: "Notificações Internas",
            icon: "notifications-outline",
            text:
                "Receba alertas importantes dentro do app sobre falhas, avisos, atualizações e lembretes de manutenção.",
        },
        {
            title: "Manutenção",
            icon: "construct-outline",
            text:
                "Veja recomendações automáticas de manutenção e solicite suporte diretamente quando alguma placa precisar de atenção.",
        },
        {
            title: "Gestão das Placas",
            icon: "grid-outline",
            text:
                "Adicione, visualize e exclua placas solares do sistema, acompanhando sua produtividade e energia total gerada.",
        },
        {
            title: "Configurações do Sistema",
            icon: "settings-outline",
            text:
                "Ajuste preferências do app, controle notificações e gerencie informações pessoais e sincronização.",
        },
        {
            title: "Ajuda e Suporte",
            icon: "help-circle-outline",
            text:
                "Consulte o FAQ ou entre em contato com o suporte para tirar dúvidas, enviar feedback ou relatar problemas.",
        },
    ];
    const router = useRouter();


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Guia do Usuário</Text>
                <Text style={styles.subheader}>
                    Tudo o que você precisa para aproveitar ao máximo o Solaire.
                </Text>

                {sections.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name={item.icon} size={24} color="#4a4a4a" />
                            <Text style={styles.cardTitle}>{item.title}</Text>
                        </View>
                        <Text style={styles.cardText}>{item.text}</Text>
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/tabs/suporte")}
                >
                    <Ionicons name="arrow-back" size={18} color="#000" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>



                <View style={{ height: 40 }} />
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        marginTop: 30
    },
    content: {
        padding: 22,
    },
    header: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111",
    },
    subheader: {
        fontSize: 15,
        color: "#666",
        marginTop: 4,
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: "#eee",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    cardTitle: {
        marginLeft: 10,
        fontSize: 17,
        fontWeight: "600",
        color: "#222",
    },
    cardText: {
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
    },
    backButton: {
        marginTop: 24,
        backgroundColor: "#ffc125",
        paddingVertical: 12,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    backButtonText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "600",
    },
});
