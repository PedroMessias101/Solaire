import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


interface ResultadosCalculo {
  consumoMensal: number;
  tarifa: number;
  paineisViaveis: number;
  paineisIdeais: number;
  areaNecessaria: number;
  cabeNaArea: boolean;
  custoEquipamentos: number;
  custoInstalacao: number;
  custoTotalSistema: number;
  economiaMensal: number;
  economiaAnual: number;
  tempoRetornoAnos: number;
  dentroDoOrcamento: boolean;
  maxPaineisPorOrcamento: number;
  areaMaximaPorOrcamento: number;
  producaoMensalKwh: number;
  percentualCobertura: number;
  producaoDiariaKwh: number;
  potenciaRequeridaW: number;
  maxPaineisPorArea: number;
}

interface EntradaLinhaProps {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder: string;
  unidade?: string;
}

export default function SimuladorEnergiaSolar(): JSX.Element {
  const [dadosEntrada, setDadosEntrada] = useState({
    consumoMensalKwh: "450",
    tarifaEletricidade: "0.90",
    orcamento: "20000",
    areaDisponivelM2: "50",
    potenciaPainel: "400",
    areaPainel: "1.94",
    custoPainel: "650",
    custoInversor: "3500",
    custoInstalacaoPercentual: "12",
    eficienciaSistemaPercentual: "0.85",
    horasSolPicoDia: "4.5"
  });

  const atualizarEntrada = (campo: keyof typeof dadosEntrada, valor: string) => {
    setDadosEntrada(prev => ({ ...prev, [campo]: valor }));
  };

  const parseNumero = (texto: string, valorPadrao = 0): number => {
    const numero = Number(String(texto).replace(/[^0-9.,-]/g, "").replace(",", "."));
    return Number.isFinite(numero) && !isNaN(numero) ? numero : valorPadrao;
  };

  const router = useRouter();


  const resultados: ResultadosCalculo = useMemo(() => {
    const {
      consumoMensalKwh,
      tarifaEletricidade,
      orcamento,
      areaDisponivelM2,
      potenciaPainel,
      areaPainel,
      custoPainel,
      custoInversor,
      custoInstalacaoPercentual,
      eficienciaSistemaPercentual,
      horasSolPicoDia
    } = dadosEntrada;

    const consumoMensal = Math.max(0, parseNumero(consumoMensalKwh));
    const tarifa = Math.max(0, parseNumero(tarifaEletricidade));
    const valorOrcamento = Math.max(0, parseNumero(orcamento));
    const areaDisponivel = Math.max(0, parseNumero(areaDisponivelM2));

    const potenciaPainelW = Math.max(1, parseNumero(potenciaPainel));
    const areaPainelM2 = Math.max(0.1, parseNumero(areaPainel));
    const custoPainelR = Math.max(0, parseNumero(custoPainel));
    const custoInversorR = Math.max(0, parseNumero(custoInversor));
    const percentualInstalacao = Math.max(0, parseNumero(custoInstalacaoPercentual)) / 100;
    const eficiencia = Math.max(0.01, Math.min(1, parseNumero(eficienciaSistemaPercentual)));
    const horasSol = Math.max(0.1, parseNumero(horasSolPicoDia));

    // Cálculo da potência requerida
    const consumoDiarioKwh = consumoMensal / 30;
    const potenciaRequeridaKw = consumoDiarioKwh / horasSol / eficiencia;
    const potenciaRequeridaW = potenciaRequeridaKw * 1000;
    const paineisIdeais = Math.ceil(potenciaRequeridaW / potenciaPainelW);

    // Limites físicos e financeiros
    const maxPaineisPorArea = Math.floor(areaDisponivel / areaPainelM2);
    const maxPaineisPorOrcamento = Math.floor(
      (valorOrcamento - custoInversorR) / (custoPainelR * (1 + percentualInstalacao))
    );

    const paineisViaveis = Math.max(
      0,
      Math.min(paineisIdeais, maxPaineisPorArea, maxPaineisPorOrcamento)
    );

    // Cálculos de custos
    const areaNecessaria = paineisViaveis * areaPainelM2;
    const custoEquipamentos = paineisViaveis * custoPainelR + custoInversorR;
    const custoInstalacao = custoEquipamentos * percentualInstalacao;
    const custoTotalSistema = custoEquipamentos + custoInstalacao;

    // Cálculos de produção e economia
    const producaoDiariaKwh = (paineisViaveis * potenciaPainelW * horasSol * eficiencia) / 1000;
    const producaoMensalKwh = producaoDiariaKwh * 30;
    const percentualCobertura = consumoMensal ?
      Math.min(100, (producaoMensalKwh / consumoMensal) * 100) : 0;

    const economiaMensal = producaoMensalKwh * tarifa;
    const economiaAnual = economiaMensal * 12;
    const tempoRetornoAnos = economiaAnual > 0 ? custoTotalSistema / economiaAnual : Infinity;

    const areaMaximaPorOrcamento = maxPaineisPorOrcamento * areaPainelM2;

    return {
      consumoMensal,
      tarifa,
      paineisViaveis,
      paineisIdeais,
      areaNecessaria,
      cabeNaArea: areaNecessaria <= areaDisponivel,
      custoEquipamentos,
      custoInstalacao,
      custoTotalSistema,
      economiaMensal,
      economiaAnual,
      tempoRetornoAnos,
      dentroDoOrcamento: custoTotalSistema <= valorOrcamento,
      maxPaineisPorOrcamento,
      areaMaximaPorOrcamento,
      producaoMensalKwh,
      percentualCobertura,
      producaoDiariaKwh,
      potenciaRequeridaW,
      maxPaineisPorArea,
    };
  }, [dadosEntrada]);

  const compartilharEstimativa = async () => {
    const texto = `ESTIMATIVA DE ENERGIA SOLAR

• Sistema Recomendado: ${resultados.paineisViaveis} painéis de ${dadosEntrada.potenciaPainel}W
• Área Necessária: ${resultados.areaNecessaria.toFixed(1)} m²
• Investimento Total: R$ ${resultados.custoTotalSistema.toLocaleString('pt-BR')}
• Economia Mensal: R$ ${resultados.economiaMensal.toFixed(2)}
• Payback Estimado: ${Number.isFinite(resultados.tempoRetornoAnos) ?
        resultados.tempoRetornoAnos.toFixed(1) + " anos" : "—"}
• Cobertura Energética: ${resultados.percentualCobertura.toFixed(1)}% do consumo
• Produção Mensal: ${resultados.producaoMensalKwh.toFixed(0)} kWh`;

    Alert.alert(
      "Relatório do Sistema",
      texto,
      [
        { text: "Fechar", style: "cancel" },
        {
          text: "Copiar",
          onPress: async () => {
            await Clipboard.setString(texto);
            Alert.alert("Sucesso", "Relatório copiado para a área de transferência!");
          }
        }
      ]
    );
  };

  const mostrarAnaliseDetalhada = () => {
    Alert.alert(
      "Análise Técnica Detalhada",
      `DADOS DE ENTRADA:
• Consumo Mensal: ${resultados.consumoMensal} kWh
• Tarifa Energética: R$ ${resultados.tarifa.toFixed(3)}/kWh

DIMENSIONAMENTO:
• Potência Requerida: ${(resultados.potenciaRequeridaW / 1000).toFixed(1)} kW
• Painéis Ideais: ${resultados.paineisIdeais} unidades
• Painéis Viáveis: ${resultados.paineisViaveis} unidades
• Limite por Área: ${resultados.maxPaineisPorArea} unidades
• Limite por Orçamento: ${resultados.maxPaineisPorOrcamento} unidades

PRODUÇÃO ENERGÉTICA:
• Diária: ${resultados.producaoDiariaKwh.toFixed(1)} kWh
• Mensal: ${resultados.producaoMensalKwh.toFixed(1)} kWh
• Cobertura do Consumo: ${resultados.percentualCobertura.toFixed(1)}%

ASPECTOS FINANCEIROS:
• Equipamentos: R$ ${resultados.custoEquipamentos.toLocaleString('pt-BR')}
• Instalação: R$ ${resultados.custoInstalacao.toLocaleString('pt-BR')}
• Total Investido: R$ ${resultados.custoTotalSistema.toLocaleString('pt-BR')}
• Economia Anual: R$ ${resultados.economiaAnual.toLocaleString('pt-BR')}

${!resultados.dentroDoOrcamento ? '⚠️ ORÇAMENTO INSUFICIENTE' : ''}
${!resultados.cabeNaArea ? '⚠️ ÁREA INSUFICIENTE' : ''}`
    );
  };

  const formatarMoeda = (valor: string): string => {
    const numero = parseNumero(valor);
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={estilos.container}>
        <TouchableOpacity
          onPress={() => router.push("/empresarial/home")}
          style={estilos.botaoVoltar}
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>Simulador de Energia Solar</Text>
          <Text style={estilos.subtitulo}>
            Análise completa de viabilidade técnica e econômica
          </Text>
        </View>

        <Secao titulo="Consumo e Tarifa Energética">
          <EntradaLinha
            rotulo="Consumo Mensal (kWh)"
            valor={dadosEntrada.consumoMensalKwh}
            onChange={(valor) => atualizarEntrada('consumoMensalKwh', valor)}
            placeholder="ex: 450"
            unidade="kWh/mês"
          />
          <EntradaLinha
            rotulo="Tarifa de Energia"
            valor={dadosEntrada.tarifaEletricidade}
            onChange={(valor) => atualizarEntrada('tarifaEletricidade', valor)}
            placeholder="ex: 0.90"
            unidade="R$/kWh"
          />
        </Secao>

        <Secao titulo="Orçamento e Espaço Disponível">
          <EntradaLinha
            rotulo="Orçamento Disponível"
            valor={dadosEntrada.orcamento}
            onChange={(valor) => atualizarEntrada('orcamento', valor)}
            placeholder="ex: 20000"
            unidade="R$"
          />
          <EntradaLinha
            rotulo="Área Disponível"
            valor={dadosEntrada.areaDisponivelM2}
            onChange={(valor) => atualizarEntrada('areaDisponivelM2', valor)}
            placeholder="ex: 50"
            unidade="m²"
          />
        </Secao>

        <Secao titulo="Especificações Técnicas do Sistema" >
          <EntradaLinha
            rotulo="Potência por Painel"
            valor={dadosEntrada.potenciaPainel}
            onChange={(valor) => atualizarEntrada('potenciaPainel', valor)}
            placeholder="ex: 400"
            unidade="W"
          />
          <EntradaLinha
            rotulo="Área por Painel"
            valor={dadosEntrada.areaPainel}
            onChange={(valor) => atualizarEntrada('areaPainel', valor)}
            placeholder="ex: 1.94"
            unidade="m²"
          />
          <EntradaLinha
            rotulo="Custo por Painel"
            valor={dadosEntrada.custoPainel}
            onChange={(valor) => atualizarEntrada('custoPainel', valor)}
            placeholder="ex: 650"
            unidade="R$"
          />
          <EntradaLinha
            rotulo="Custo do Inversor"
            valor={dadosEntrada.custoInversor}
            onChange={(valor) => atualizarEntrada('custoInversor', valor)}
            placeholder="ex: 3500"
            unidade="R$"
          />
          <EntradaLinha
            rotulo="Custo de Instalação"
            valor={dadosEntrada.custoInstalacaoPercentual}
            onChange={(valor) => atualizarEntrada('custoInstalacaoPercentual', valor)}
            placeholder="ex: 12"
            unidade="%"
          />
          <EntradaLinha
            rotulo="Eficiência do Sistema"
            valor={dadosEntrada.eficienciaSistemaPercentual}
            onChange={(valor) => atualizarEntrada('eficienciaSistemaPercentual', valor)}
            placeholder="ex: 0.85"
            unidade=""
          />
          <EntradaLinha
            rotulo="Horas de Sol Pico"
            valor={dadosEntrada.horasSolPicoDia}
            onChange={(valor) => atualizarEntrada('horasSolPicoDia', valor)}
            placeholder="ex: 4.5"
            unidade="h/dia"
          />
        </Secao>

        <Secao titulo="Proposta Recomendada" >
          <LinhaResultado
            rotulo="Sistema Proposto"
            valor={`${resultados.paineisViaveis} painéis`}
            destaque={true}
          />
          <LinhaResultado
            rotulo="Potência Total"
            valor={`${(resultados.paineisViaveis * parseNumero(dadosEntrada.potenciaPainel) / 1000).toFixed(1)} kW`}
          />
          <LinhaResultado
            rotulo="Área Necessária"
            valor={`${resultados.areaNecessaria.toFixed(1)} m²`}
            status={resultados.cabeNaArea ? "success" : "error"}
          />
          <LinhaResultado
            rotulo="Investimento Total"
            valor={`R$ ${resultados.custoTotalSistema.toLocaleString('pt-BR')}`}
            status={resultados.dentroDoOrcamento ? "success" : "error"}
          />
          <LinhaResultado
            rotulo="Cobertura do Consumo"
            valor={`${resultados.percentualCobertura.toFixed(1)}%`}
            status={resultados.percentualCobertura >= 80 ? "success" : "warning"}
          />
          <LinhaResultado
            rotulo="Economia Mensal"
            valor={`R$ ${resultados.economiaMensal.toFixed(2)}`}
          />
          <LinhaResultado
            rotulo="Retorno do Investimento"
            valor={Number.isFinite(resultados.tempoRetornoAnos) ?
              `${resultados.tempoRetornoAnos.toFixed(1)} anos` : "—"}
          />
        </Secao>

        {/* Alertas e Recomendações */}
        <View style={estilos.containerAlertas}>
          {!resultados.cabeNaArea && (
            <Alerta
              tipo="error"
              titulo="Área Insuficiente"
              mensagem={`Necessário: ${resultados.areaNecessaria.toFixed(1)} m² | Disponível: ${dadosEntrada.areaDisponivelM2} m²`}
            />
          )}

          {!resultados.dentroDoOrcamento && (
            <Alerta
              tipo="error"
              titulo="Orçamento Insuficiente"
              mensagem={`Faltam: R$ ${(resultados.custoTotalSistema - parseNumero(dadosEntrada.orcamento)).toLocaleString('pt-BR')}`}
            />
          )}

          {resultados.percentualCobertura < 80 && resultados.percentualCobertura > 0 && (
            <Alerta
              tipo="warning"
              titulo="Cobertura Parcial"
              mensagem={`Sistema cobre ${resultados.percentualCobertura.toFixed(1)}% do consumo mensal`}
            />
          )}

          {resultados.tempoRetornoAnos < 5 && (
            <Alerta
              tipo="success"
              titulo="Excelente Retorno"
              mensagem="Payback inferior a 5 anos - investimento altamente viável"
            />
          )}
        </View>

        {/* Botões de Ação */}
        <View style={estilos.containerBotoes}>
          <TouchableOpacity style={estilos.botaoSecundario} onPress={mostrarAnaliseDetalhada}>
            <Text style={estilos.textoBotaoSecundario}>Análise Detalhada</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botaoPrimario} onPress={compartilharEstimativa}>
            <Text style={estilos.textoBotaoPrimario}>Gerar Relatório</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.rodape}>
          <Text style={estilos.textoRodape}>
            * Valores estimados - consulte um especialista para projeto final
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


function Secao({ children, titulo, icone }: {
  children: React.ReactNode;
  titulo: string;
  icone?: string;
}) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.tituloSecao}>
        {icone && `${icone} `}{titulo}
      </Text>
      <View style={estilos.conteudoSecao}>
        {children}
      </View>
    </View>
  );
}

function EntradaLinha({ rotulo, valor, onChange, placeholder, unidade }: EntradaLinhaProps) {
  return (
    <View style={estilos.linhaEntrada}>
      <View style={estilos.cabecalhoEntrada}>
        <Text style={estilos.rotulo}>{rotulo}</Text>
        {unidade && <Text style={estilos.unidade}>{unidade}</Text>}
      </View>
      <TextInput
        style={estilos.entrada}
        keyboardType="decimal-pad"
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

function LinhaResultado({
  rotulo,
  valor,
  destaque = false,
  status
}: {
  rotulo: string;
  valor: string | number;
  destaque?: boolean;
  status?: "success" | "error" | "warning";
}) {
  const getStatusColor = () => {
    switch (status) {
      case "success": return "#10B981";
      case "error": return "#EF4444";
      case "warning": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  return (
    <View style={estilos.linhaResultado}>
      <Text style={[
        estilos.rotuloResultado,
        destaque && estilos.rotuloResultadoDestaque
      ]}>
        {rotulo}
      </Text>
      <Text style={[
        estilos.valorResultado,
        destaque && estilos.valorResultadoDestaque,
        status && { color: getStatusColor() }
      ]}>
        {valor}
      </Text>
    </View>
  );
}

function Alerta({ tipo, titulo, mensagem }: {
  tipo: "success" | "error" | "warning";
  titulo: string;
  mensagem: string;
}) {
  const getEstilosAlerta = () => {
    switch (tipo) {
      case "success":
        return { container: estilos.alertaSuccess, texto: estilos.textoAlertaSuccess };
      case "error":
        return { container: estilos.alertaError, texto: estilos.textoAlertaError };
      case "warning":
        return { container: estilos.alertaWarning, texto: estilos.textoAlertaWarning };
    }
  };

  const estilosAlerta = getEstilosAlerta();

  return (
    <View style={[estilos.alerta, estilosAlerta.container]}>
      <Text style={estilos.tituloAlerta}>{titulo}</Text>
      <Text style={estilosAlerta.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    marginTop: 40,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  secao: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "600",
    color: '#111827',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  conteudoSecao: {
    padding: 16,
  },
  linhaEntrada: {
    marginBottom: 16,
  },
  cabecalhoEntrada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: "500",
    color: '#374151',
  },
  unidade: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  entrada: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  linhaResultado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rotuloResultado: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  rotuloResultadoDestaque: {
    fontWeight: "600",
    color: '#374151',
  },
  valorResultado: {
    fontSize: 14,
    fontWeight: "500",
    color: '#111827',
  },
  valorResultadoDestaque: {
    fontSize: 16,
    fontWeight: "700",
    color: '#059669',
  },
  containerAlertas: {
    gap: 8,
    marginBottom: 20,
  },
  alerta: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  alertaSuccess: {
    backgroundColor: '#ECFDF5',
    borderLeftColor: '#10B981',
  },
  alertaError: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  alertaWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  tituloAlerta: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  textoAlertaSuccess: {
    fontSize: 12,
    color: '#065F46',
  },
  textoAlertaError: {
    fontSize: 12,
    color: '#991B1B',
  },
  textoAlertaWarning: {
    fontSize: 12,
    color: '#92400E',
  },
  containerBotoes: {
    gap: 12,
    marginBottom: 16,
  },
  botaoPrimario: {
    backgroundColor: "#ffc125",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textoBotaoPrimario: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoSecundario: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  textoBotaoSecundario: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  rodape: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textoRodape: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  botaoVoltar: {
    position: "absolute",
    top: 20,
    left: 10,
    zIndex: 999,
    padding: 8,
  }

});