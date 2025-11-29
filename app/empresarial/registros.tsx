import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions,
  RefreshControl 
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width - 40;

interface Placa {
  id: number;
  serial: string;
  location: string;
  status?: "Ativa" | "Desativada";
}

interface DadosPlacaAPI {
  energia_kWh: number;
  tensao: number;
  temperatura: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, color, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={[styles.statusIndicator, { backgroundColor: color }]} />
    </View>
    {children}
    <View style={styles.cardFooter}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

export default function TelaGraficoResumo() {
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [dadosAgregados, setDadosAgregados] = useState<{ 
    energia: number[]; 
    tensao: number[]; 
    temp: number[] 
  }>({
    energia: [],
    tensao: [],
    temp: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");

  const fetchToken = async () => await AsyncStorage.getItem("userToken");

  const fetchPlacas = async () => {
    try {
      const token = await fetchToken();
      if (!token) return;

      const res = await fetch("https://solaire-z8mw.onrender.com/panels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar placas");
      const data = await res.json();
      setPlacas(data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDadosPlacaSimulacao = async (serial: string) => {
    try {
      const token = await fetchToken();
      if (!token) return { energia_kWh: 0, tensao: 0, temperatura: 0 };

      const res = await fetch(`https://placa-api-eaho.onrender.com/${serial}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar dados da placa na simulação");
      const data: DadosPlacaAPI = await res.json();
      return data;
    } catch (err) {
      console.log(err);
      return { energia_kWh: 0, tensao: 0, temperatura: 0 };
    }
  };

  const atualizarDadosAgregados = async () => {
    if (!placas.length) return;

    const placasAtivas = placas.filter(p => p.status === "Ativa");
    if (!placasAtivas.length) {
      setDadosAgregados({ energia: [], tensao: [], temp: [] });
      setLoading(false);
      return;
    }

    const resultados = await Promise.all(placasAtivas.map(p => fetchDadosPlacaSimulacao(p.serial)));

    setDadosAgregados({
      energia: resultados.map(d => d.energia_kWh),
      tensao: resultados.map(d => d.tensao),
      temp: resultados.map(d => d.temperatura),
    });
    
    setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }));
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    atualizarDadosAgregados();
  };

  useEffect(() => {
    fetchPlacas();
  }, []);

  useEffect(() => {
    if (!placas.length) return;

    atualizarDadosAgregados();
    const interval = setInterval(() => atualizarDadosAgregados(), 5000);
    return () => clearInterval(interval);
  }, [placas]);

  const chartConfig = (color: string) => ({
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => color,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "3",
      strokeWidth: "1",
      stroke: color,
    },
    propsForBackgroundLines: {
      stroke: "#E5E7EB",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 10,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando dados das placas...</Text>
      </View>
    );
  }

  const placasAtivas = placas.filter(p => p.status === "Ativa").length;
  const totalEnergia = dadosAgregados.energia.reduce((a, b) => a + b, 0);
  const mediaTensao = dadosAgregados.tensao.reduce((a, b) => a + b, 0) / (dadosAgregados.tensao.length || 1);
  const mediaTemperatura = dadosAgregados.temp.reduce((a, b) => a + b, 0) / (dadosAgregados.temp.length || 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.titulo}>Performance</Text>
            <Text style={styles.subtitulo}>
              {placasAtivas} {placasAtivas === 1 ? 'placa ativa' : 'placas ativas'}
            </Text>
          </View>
          <View style={styles.atualizacaoContainer}>
            <Text style={styles.atualizacaoText}>Atualizado</Text>
            <Text style={styles.atualizacaoHora}>{ultimaAtualizacao}</Text>
          </View>
        </View>

        <MetricCard
          title="Produção de Energia"
          value={`${totalEnergia.toFixed(2)} kWh`}
          subtitle="Total gerado"
          color="#10B981"
        >
          <LineChart
            data={{
              labels: dadosAgregados.energia.map((_, i) => `${i + 1}`),
              datasets: [{ data: dadosAgregados.energia }],
            }}
            width={screenWidth}
            height={160}
            chartConfig={chartConfig("#10B981")}
            bezier
            withVerticalLines={false}
            withHorizontalLines={true}
            withInnerLines={true}
            style={styles.chart}
          />
        </MetricCard>

        <MetricCard
          title="Tensão do Sistema"
          value={`${mediaTensao.toFixed(1)} V`}
          subtitle="Média atual"
          color="#3B82F6"
        >
          <LineChart
            data={{
              labels: dadosAgregados.tensao.map((_, i) => `${i + 1}`),
              datasets: [{ data: dadosAgregados.tensao }],
            }}
            width={screenWidth}
            height={160}
            chartConfig={chartConfig("#3B82F6")}
            bezier
            withVerticalLines={false}
            withHorizontalLines={true}
            withInnerLines={true}
            style={styles.chart}
          />
        </MetricCard>

        <MetricCard
          title="Temperatura"
          value={`${mediaTemperatura.toFixed(1)}°C`}
          subtitle="Média atual"
          color="#EF4444"
        >
          <LineChart
            data={{
              labels: dadosAgregados.temp.map((_, i) => `${i + 1}`),
              datasets: [{ data: dadosAgregados.temp }],
            }}
            width={screenWidth}
            height={160}
            chartConfig={chartConfig("#EF4444")}
            bezier
            withVerticalLines={false}
            withHorizontalLines={true}
            withInnerLines={true}
            style={styles.chart}
          />
        </MetricCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dados atualizados automaticamente a cada 5 segundos
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#F8FAFC"
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: "#64748B" 
  },
  scrollContent: { 
    padding: 20 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#1E293B",
    marginBottom: 4 
  },
  subtitulo: { 
    fontSize: 16, 
    color: "#64748B",
    fontWeight: "500" 
  },
  atualizacaoContainer: {
    alignItems: "flex-end"
  },
  atualizacaoText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2
  },
  atualizacaoHora: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000"
  },
  card: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#1E293B" 
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cardValue: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1E293B" 
  },
  cardSubtitle: { 
    fontSize: 14, 
    color: "#64748B" 
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
});