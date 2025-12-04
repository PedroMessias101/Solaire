import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Notificacoes() {
    const router = useRouter();

    const [config, setConfig] = useState({
        notificacoes: true,
        producaoSolar: true,
        clima: false,
        alertasPlaca: true,
    });

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("@notificacoesConfig");
            if (saved) setConfig(JSON.parse(saved));
        })();
    }, []);

    const atualizar = async (key, valor) => {
        const novaConfig = { ...config, [key]: valor };
        setConfig(novaConfig);
        await AsyncStorage.setItem("@notificacoesConfig", JSON.stringify(novaConfig));
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={estilos.tela}>
                <View style={estilos.cabecalho}>
                    <TouchableOpacity
                        onPress={() => router.push("/tabs/home")}
                        style={estilos.botaoVoltar}
                    >
                        <Ionicons name="arrow-back" size={22} color="#000" />
                    </TouchableOpacity>

                    <Text style={estilos.tituloCabecalho}>Notificações</Text>

                    <View style={{ width: 22 }} />
                </View>

                <Text style={estilos.tituloSecao}>Preferências</Text>

                <View style={estilos.item}>
                    <View style={estilos.caixaIcone}>
                        <Ionicons name="notifications-outline" size={22} color="#ffc125" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={estilos.tituloItem}>Ativar notificações</Text>
                        <Text style={estilos.subtituloItem}>
                            Controle geral das notificações
                        </Text>
                    </View>

                    <Switch
                        value={config.notificacoes}
                        onValueChange={(v) => atualizar("notificacoes", v)}
                        trackColor={{ false: "#ccc", true: "#ffc125" }}
                        thumbColor={config.notificacoes ? "#ffdd66" : "#f4f4f4"}
                    />
                </View>

                {config.notificacoes && (
                    <>
                        <View style={estilos.item}>
                            <View style={estilos.caixaIcone}>
                                <Ionicons name="sunny-outline" size={22} color="#ffc125" />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={estilos.tituloItem}>Produção Solar</Text>
                                <Text style={estilos.subtituloItem}>
                                    Receba alertas de baixa produção
                                </Text>
                            </View>

                            <Switch
                                value={config.producaoSolar}
                                onValueChange={(v) => atualizar("producaoSolar", v)}
                                trackColor={{ false: "#ccc", true: "#ffc125" }}
                                thumbColor={config.producaoSolar ? "#ffdd66" : "#f4f4f4"}
                            />
                        </View>
                        <View style={estilos.item}>
                            <View style={estilos.caixaIcone}>
                                <Ionicons name="cloud-outline" size={22} color="#ffc125" />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={estilos.tituloItem}>Clima</Text>
                                <Text style={estilos.subtituloItem}>
                                    Previsão e impacto na produção
                                </Text>
                            </View>

                            <Switch
                                value={config.clima}
                                onValueChange={(v) => atualizar("clima", v)}
                                trackColor={{ false: "#ccc", true: "#ffc125" }}
                                thumbColor={config.clima ? "#ffdd66" : "#f4f4f4"}
                            />
                        </View>

                        <View style={estilos.item}>
                            <View style={estilos.caixaIcone}>
                                <Ionicons name="alert-circle-outline" size={22} color="#ffc125" />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={estilos.tituloItem}>Alertas da Placa</Text>
                                <Text style={estilos.subtituloItem}>
                                    Avisos de erro, offline ou sobrecarga
                                </Text>
                            </View>

                            <Switch
                                value={config.alertasPlaca}
                                onValueChange={(v) => atualizar("alertasPlaca", v)}
                                trackColor={{ false: "#ccc", true: "#ffc125" }}
                                thumbColor={config.alertasPlaca ? "#ffdd66" : "#f4f4f4"}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const estilos = StyleSheet.create({
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
        marginTop: 10,
    },
    botaoVoltar: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    tituloCabecalho: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    tituloSecao: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
        color: "#444",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    caixaIcone: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    tituloItem: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
    },
    subtituloItem: {
        fontSize: 13,
        color: "#666",
    },
});
