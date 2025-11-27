import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type TriState = "sim" | "nao" | null;

type GuiaStep = {
  icon: string;
  lib: "FontAwesome5" | "Entypo" | "MaterialIcons";
  text: string;
};

export default function DiagnosticoPlaca(): JSX.Element {
  const [ultimaManutencao, setUltimaManutencao] = useState<string>("");
  const [chuvasFortes, setChuvasFortes] = useState<TriState>(null);
  const [quedaEnergia, setQuedaEnergia] = useState<TriState>(null);
  const [painelSujo, setPainelSujo] = useState<TriState>(null);
  const [quedaSignificativa, setQuedaSignificativa] = useState<TriState>(null);
  const [ruidoInversor, setRuidoInversor] = useState<TriState>(null);
  const [corrosaoConectores, setCorrosaoConectores] = useState<TriState>(null);

  const router = useRouter();

  const [resultado, setResultado] = useState<string>("");
  const [guia, setGuia] = useState<GuiaStep[]>([]);

  const resetForm = () => {
    setUltimaManutencao("");
    setChuvasFortes(null);
    setQuedaEnergia(null);
    setPainelSujo(null);
    setQuedaSignificativa(null);
    setRuidoInversor(null);
    setCorrosaoConectores(null);
    setResultado("");
    setGuia([]);
  };

  const analisar = () => {
    if (
      ultimaManutencao.trim() !== "" &&
      isNaN(Number(ultimaManutencao.trim()))
    ) {
      Alert.alert("Entrada inválida", "Informe a última manutenção em meses (número).");
      return;
    }

    const causas: string[] = [];
    const passos: GuiaStep[] = [];


    if (ultimaManutencao && parseInt(ultimaManutencao) > 6) {
      causas.push("Manutenção atrasada pode reduzir a eficiência da geração.");
      passos.push(
        { icon: "calendar-check", lib: "FontAwesome5", text: "Agende uma manutenção preventiva com a equipe técnica." },
        { icon: "tools", lib: "FontAwesome5", text: "Faça uma inspeção visual completa dos painéis e suportes." },
        { icon: "water", lib: "Entypo", text: "Realize limpeza leve (pano macio e água). Evite produtos químicos." },
        { icon: "bolt", lib: "FontAwesome5", text: "Ao final, verifique a produção no app e compare com médias anteriores." }
      );
    }

    // chuvas fortes
    if (chuvasFortes === "sim") {
      causas.push("Chuvas fortes recentes podem ter causado sujeira ou danos nos cabos.");
      passos.push(
        { icon: "water", lib: "Entypo", text: "Aguarde tempo estável antes de qualquer intervenção (evite chuva e umidade alta)." },
        { icon: "tools", lib: "FontAwesome5", text: "Inspecione painéis e cabos em busca de rachaduras, infiltrações ou cabos soltos." },
        { icon: "broom", lib: "MaterialIcons", text: "Faça limpeza superficial (pano macio). Remova detritos e folhas." },
        { icon: "bolt", lib: "FontAwesome5", text: "Verifique leituras do inversor após a limpeza para confirmar retorno." }
      );
    }

    // queda de energia
    if (quedaEnergia === "sim") {
      causas.push("Quedas de energia podem afetar o inversor ou conexões elétricas.");
      passos.push(
        { icon: "power-settings-new", lib: "MaterialIcons", text: "Desligue o inversor e aguarde ~30 segundos antes de religar." },
        { icon: "plug", lib: "Entypo", text: "Cheque firmes as conexões e terminais (procure por folgas/corrosão)." },
        { icon: "bolt", lib: "FontAwesome5", text: "Verifique indicadores/LEDs do inversor para mensagens de erro." },
        { icon: "chart-line", lib: "FontAwesome5", text: "Monitore a geração nas próximas horas para confirmar estabilidade." }
      );
    }

    // painel visivelmente sujo
    if (painelSujo === "sim") {
      causas.push("Painéis sujos/empoeirados reduzem consideravelmente a eficiência.");
      passos.push(
        { icon: "broom", lib: "MaterialIcons", text: "Limpeza segura: água e pano macio — não utilize produtos abrasivos." },
        { icon: "eye", lib: "Entypo", text: "Verifique pontos de acúmulo (borda, traseira, ralo) e remova sujeiras." },
        { icon: "calendar-alt", lib: "FontAwesome5", text: "Agende limpezas periódicas (cada 3–6 meses) ou conforme acúmulo." }
      );
    }

    // queda significativa na geração
    if (quedaSignificativa === "sim") {
      causas.push("Queda significativa na geração pode indicar sombreamento, falha no inversor ou degradação.");
      passos.push(
        { icon: "chart-line", lib: "FontAwesome5", text: "Compare os dados de produção em dias semelhantes (mesma estação/horário)." },
        { icon: "sun", lib: "Entypo", text: "Verifique se há sombreamento novo (árvores, painéis desalinhados, sujeira)." },
        { icon: "tools", lib: "FontAwesome5", text: "Inspecione strings e diodos de bypass por falhas visíveis." },
        { icon: "bolt", lib: "FontAwesome5", text: "Se necessário, contate suporte para checagem do inversor." }
      );
    }

    // ruído estranho do inversor
    if (ruidoInversor === "sim") {
      causas.push("Ruído no inversor pode indicar ventilação obstruída ou falha de componentes.");
      passos.push(
        { icon: "volume-up", lib: "FontAwesome5", text: "Verifique se o inversor está em local ventilado e sem acúmulo de poeira." },
        { icon: "tools", lib: "FontAwesome5", text: "Anote quando o ruído ocorre (ao ligar, sob carga, periodicamente)." },
        { icon: "power-settings-new", lib: "MaterialIcons", text: "Desligue o inversor antes de inspeções visuais e contate suporte para testes elétricos." }
      );
    }

    // corrosão nos conectores
    if (corrosaoConectores === "sim") {
      causas.push("Corrosão nos conectores compromete a condução e segurança do sistema.");
      passos.push(
        { icon: "plug", lib: "Entypo", text: "Inspecione conectores MC4 e terminais em busca de oxidação." },
        { icon: "tools", lib: "FontAwesome5", text: "Se detectar corrosão, substitua conectores ou peça suporte técnico qualificado." },
        { icon: "bolt", lib: "FontAwesome5", text: "Após intervenção, teste a continuidade e monitore a produção." }
      );
    }

    // Se nenhuma causa detectada
    if (causas.length === 0) {
      causas.push("Nenhuma causa aparente encontrada. Sistema parece estar em condições normais.");
      passos.push(
        { icon: "eye", lib: "Entypo", text: "Mantenha inspeções visuais mensais." },
        { icon: "calendar-alt", lib: "FontAwesome5", text: "Agende limpezas preventivas a cada 3–6 meses." },
        { icon: "chart-line", lib: "FontAwesome5", text: "Monitore a produção regularmente pelo app." }
      );
    }

    // remover passos duplicados (por texto)
    const textoUnicos = new Set<string>();
    const passosUnicos: GuiaStep[] = [];
    for (const p of passos) {
      if (!textoUnicos.has(p.text)) {
        textoUnicos.add(p.text);
        passosUnicos.push(p);
      }
    }

    setResultado(causas.join("\n• "));
    setGuia(passosUnicos);
  };

  const renderIcon = (item: { icon: string; lib: GuiaStep["lib"] }) => {
    switch (item.lib) {
      case "FontAwesome5":
        return <FontAwesome5 name={item.icon as any} size={18} color="#000" />;
      case "Entypo":
        return <Entypo name={item.icon as any} size={18} color="#000" />;
      case "MaterialIcons":
        return <MaterialIcons name={item.icon as any} size={18} color="#000" />;
      default:
        return null;
    }
  };

  const renderOption = (
    question: string,
    value: TriState,
    setValue: (v: TriState) => void
  ) => (
    <View style={styles.pergunta}>
      <Text style={styles.label}>{question}</Text>
      <View style={styles.opcoesContainer}>
        {["sim", "nao"].map((opcao) => {
          const isSelected = value === (opcao as TriState);
          return (
            <TouchableOpacity
              key={opcao}
              style={[
                styles.botaoOpcao,
                isSelected && styles.botaoOpcaoSelecionado,
              ]}
              onPress={() => setValue(opcao as TriState)}
            >
              <Text style={[styles.textoOpcao, isSelected && styles.textoOpcaoSelecionado]}>
                {opcao.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const anyAlert = resultado && resultado !== "" && !resultado.includes("Nenhuma causa aparente");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <TouchableOpacity
        onPress={() => router.push("/empresarial/configuracao")} 
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Diagnóstico de Manutenção</Text>
      <Text style={styles.subtitulo}>
        Responda às perguntas abaixo para identificar possíveis causas e obter um guia passo a passo.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Quando foi sua última manutenção (em meses)?</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Ex: 4"
          value={ultimaManutencao}
          onChangeText={setUltimaManutencao}
        />
      </View>

      {renderOption("Teve chuvas fortes recentemente?", chuvasFortes, setChuvasFortes)}
      {renderOption("Houve quedas de energia nos últimos dias?", quedaEnergia, setQuedaEnergia)}
      {renderOption("Painéis estão visivelmente sujos ou empoeirados?", painelSujo, setPainelSujo)}
      {renderOption("Houve queda significativa na geração nos últimos dias?", quedaSignificativa, setQuedaSignificativa)}
      {renderOption("Há som/ruído estranho vindo do inversor?", ruidoInversor, setRuidoInversor)}
      {renderOption("Há sinais de corrosão nos conectores?", corrosaoConectores, setCorrosaoConectores)}

      <View style={styles.botoesRow}>
        <TouchableOpacity style={styles.botao} onPress={analisar}>
          <Text style={styles.botaoTexto}>Analisar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoSecundario} onPress={resetForm}>
          <Text style={styles.botaoTextoSecundario}>Resetar</Text>
        </TouchableOpacity>
      </View>

      {resultado ? (
        <View style={[styles.resultadoBox, anyAlert ? styles.resultadoAlerta : styles.resultadoOk]}>
          <Text style={styles.resultadoTitulo}>Diagnóstico:</Text>
          <Text style={styles.resultadoTexto}>• {resultado}</Text>

          <Text style={styles.guiaTitulo}>Guia passo a passo:</Text>
          {guia.map((item, index) => (
            <View key={index} style={styles.passo}>
              <View style={styles.iconCircle}>{renderIcon(item)}</View>
              <Text style={styles.passoTexto}>
                <Text style={styles.passoNumero}>{index + 1}. </Text>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.contato}>
        Caso as práticas recomendadas não resolvam, entre em contato com a equipe técnica da{" "}
        <Text style={styles.bold}>Solaire</Text>.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
    marginTop: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "center",
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  pergunta: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fbfaf9ff",
  },
  opcoesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoOpcao: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#fff",
  },
  botaoOpcaoSelecionado: {
    backgroundColor: "#ffc125",
    borderColor: "#ffc125",
  },
  textoOpcao: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  textoOpcaoSelecionado: {
    color: "#000",
    fontWeight: "600",
  },
  botoesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  botao: {
    flex: 1,
    backgroundColor: "#ffc125",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  botaoSecundario: {
    width: 110,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  botaoTextoSecundario: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  resultadoBox: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  resultadoOk: {
    backgroundColor: "#DFF6EC",
  },
  resultadoAlerta: {
    backgroundColor: "#fff",
  },
  resultadoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#423000ff",
  },
  resultadoTexto: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  guiaTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffc125",
    marginBottom: 10,
  },
  passo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffc125",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  passoTexto: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  passoNumero: {
    fontWeight: "bold",
    color: "#000",
  },
  contato: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  bold: {
    fontWeight: "700",
    color: "#ffc125",
  },
});
