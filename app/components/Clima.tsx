import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WeatherAndSolar() {
  const [weather, setWeather] = useState<any>(null);
  const [solarData, setSolarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Localização fixa (troque depois por geolocation real)
  const latitude = -23.55; // São Paulo
  const longitude = -46.63;

  const fetchData = async () => {
    try {
      // 1️⃣ PREVISÃO DO TEMPO + RADIAÇÃO SOLAR (Open-Meteo)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=shortwave_radiation_sum&timezone=America%2FSao_Paulo`
      );
      const data = await response.json();

      // Clima atual
      setWeather(data.current);

      // Radiação solar diária
      const today = data.daily.shortwave_radiation_sum[0];
      const yesterday = data.daily.shortwave_radiation_sum[1];

      setSolarData({
        today,
        yesterday,
        variation: ((today - yesterday) / yesterday) * 100,
      });

      // Atualizar horário
      setCurrentTime(new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    const icons = {
      0: "sunny",
      1: "partly-sunny",
      2: "partly-sunny",
      3: "cloudy",
      51: "rainy",
      61: "rainy",
      80: "rainy"
    };
    return icons[code as keyof typeof icons] || "cloud";
  };

  const getWeatherCondition = (code: number) => {
    const conditions = {
      0: "Ensolarado",
      1: "Parc. Nublado",
      2: "Parc. Nublado", 
      3: "Nublado",
      51: "Chuva Leve",
      61: "Chuva Moderada",
      80: "Chuva"
    };
    return conditions[code as keyof typeof conditions] || "Nublado";
  };

  const getWeatherColor = (code: number) => {
    const colors = {
      0: "#F59E0B", // Sol
      1: "#94A3B8", // Parcialmente nublado
      2: "#94A3B8",
      3: "#64748B", // Nublado
      51: "#60A5FA", // Chuva
      61: "#3B82F6",
      80: "#2563EB"
    };
    return colors[code as keyof typeof colors] || "#64748B";
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Atualiza a cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Carregando dados meteorológicos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.card}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <View style={styles.headerTitle}>
              <MaterialCommunityIcons name="weather-sunny" size={28} color="#F59E0B" />
              <View>
                <Text style={styles.appTitle}>Solar Analytics</Text>
                <Text style={styles.appSubtitle}>Monitoramento Inteligente</Text>
              </View>
            </View>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.timeText}>{currentTime}</Text>
            </View>
          </View>
          
          <View style={styles.location}>
            <Ionicons name="location-sharp" size={16} color="#F59E0B" />
            <Text style={styles.locationText}>São Paulo, SP • Brasil</Text>
          </View>
        </View>

        {/* WEATHER SECTION */}
        <View style={styles.weatherSection}>
          <View style={styles.weatherHeader}>
            <Text style={styles.sectionTitle}>CONDIÇÕES ATUAIS</Text>
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherBadgeText}>
                {getWeatherCondition(weather.weather_code)}
              </Text>
            </View>
          </View>
          
          <View style={styles.weatherContent}>
            <View style={styles.weatherMain}>
              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>{Math.round(weather.temperature_2m)}</Text>
                <Text style={styles.temperatureUnit}>°C</Text>
              </View>
              <Ionicons 
                name={getWeatherIcon(weather.weather_code)} 
                size={80} 
                color={getWeatherColor(weather.weather_code)} 
              />
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="water-outline" size={16} color="#60A5FA" />
                <Text style={styles.weatherDetailText}>{weather.relative_humidity_2m}%</Text>
                <Text style={styles.weatherDetailLabel}>Umidade</Text>
              </View>
              
              <View style={styles.weatherDetailItem}>
                <Ionicons name="speedometer-outline" size={16} color="#10B981" />
                <Text style={styles.weatherDetailText}>{weather.wind_speed_10m} km/h</Text>
                <Text style={styles.weatherDetailLabel}>Vento</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SOLAR SECTION */}
        <View style={styles.solarSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EFICIÊNCIA SOLAR</Text>
            <MaterialCommunityIcons name="solar-panel-large" size={24} color="#F59E0B" />
          </View>
          
          <View style={styles.solarGrid}>
            <View style={styles.solarCard}>
              <View style={styles.solarCardHeader}>
                <Ionicons name="flash" size={20} color="#F59E0B" />
                <Text style={styles.solarCardTitle}>Radiação Atual</Text>
              </View>
              <Text style={styles.solarMainValue}>{solarData.today}</Text>
              <Text style={styles.solarUnit}>Wh/m²</Text>
            </View>
            
            <View style={styles.solarCard}>
              <View style={styles.solarCardHeader}>
                <Ionicons name="calendar" size={20} color="#94A3B8" />
                <Text style={styles.solarCardTitle}>Comparativo</Text>
              </View>
              <Text style={styles.solarMainValue}>{solarData.yesterday}</Text>
              <Text style={styles.solarUnit}>Wh/m² (ontem)</Text>
            </View>
          </View>

          <View style={[
            styles.variationContainer,
            solarData.variation >= 0 ? styles.positive : styles.negative
          ]}>
            <View style={styles.variationHeader}>
              <Ionicons 
                name={solarData.variation >= 0 ? "trending-up" : "trending-down"} 
                size={24} 
                color={solarData.variation >= 0 ? "#10B981" : "#EF4444"} 
              />
              <View>
                <Text style={styles.variationValue}>
                  {solarData.variation >= 0 ? "+" : ""}
                  {solarData.variation.toFixed(1)}%
                </Text>
                <Text style={styles.variationLabel}>
                  Variação de eficiência
                </Text>
              </View>
            </View>
            <Text style={styles.variationSubtext}>
              {solarData.variation >= 0
                ? "✓ Condições otimizadas para geração solar"
                : "⚠ Condições abaixo do ideal para geração"}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="refresh-circle" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>Atualizado automaticamente</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="shield-checkmark" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>Dados em tempo real</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ========================
// ESTILOS PROFISSIONAIS
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  card: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontFamily: "System",
    fontWeight: '500',
  },
  header: {
    marginBottom: 32,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
    marginLeft: 12,
    fontFamily: "System",
  },
  appSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 12,
    marginTop: 2,
    fontFamily: "System",
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 4,
    fontFamily: "System",
    fontWeight: '600',
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#CBD5E1",
    marginLeft: 6,
    fontFamily: "System",
    fontWeight: '500',
  },
  weatherSection: {
    marginBottom: 32,
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: "System",
    letterSpacing: 1,
  },
  weatherBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weatherBadgeText: {
    fontSize: 12,
    color: "#CBD5E1",
    fontFamily: "System",
    fontWeight: '600',
  },
  weatherContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperatureContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  temperature: {
    fontSize: 64,
    fontWeight: "200",
    color: "#F8FAFC",
    fontFamily: "System",
  },
  temperatureUnit: {
    fontSize: 20,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 12,
    fontFamily: "System",
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F8FAFC",
    marginTop: 4,
    fontFamily: "System",
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
    fontFamily: "System",
    fontWeight: '500',
  },
  solarSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  solarGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  solarCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  solarCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  solarCardTitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 6,
    fontWeight: "600",
    fontFamily: "System",
  },
  solarMainValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
    fontFamily: "System",
  },
  solarUnit: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    fontFamily: "System",
    fontWeight: '500',
  },
  variationContainer: {
    borderRadius: 16,
    padding: 20,
  },
  positive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negative: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  variationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  variationValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F8FAFC",
    marginLeft: 12,
    fontFamily: "System",
  },
  variationLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 12,
    fontFamily: "System",
    fontWeight: '500',
  },
  variationSubtext: {
    fontSize: 13,
    color: "#CBD5E1",
    fontFamily: "System",
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 6,
    fontFamily: "System",
    fontWeight: '500',
  },
});