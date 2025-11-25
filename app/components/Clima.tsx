import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function WeatherCard() {
  const [weather, setWeather] = useState<any>(null);
  const [energyData, setEnergyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Localização fixa
  const latitude = -23.55;
  const longitude = -46.63;

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,wind_speed_10m&daily=temperature_2m_max,shortwave_radiation_sum&timezone=America%2FSao_Paulo&past_days=1`
      );
      const data = await response.json();

      setWeather(data.current);

      // Cálculo simulado de produção de energia baseado na radiação solar e temperatura
      const todayRadiation = data.daily.shortwave_radiation_sum[1]; // Hoje
      const yesterdayRadiation = data.daily.shortwave_radiation_sum[0]; // Ontem
      
      const todayTemp = data.daily.temperature_2m_max[1]; // Temperatura máxima de hoje
      const yesterdayTemp = data.daily.temperature_2m_max[0]; // Temperatura máxima de ontem

      // Fator de eficiência (temperaturas muito altas reduzem a eficiência dos painéis)
      const todayEfficiency = Math.max(0.8, 1 - (todayTemp - 25) * 0.005);
      const yesterdayEfficiency = Math.max(0.8, 1 - (yesterdayTemp - 25) * 0.005);

      // Produção estimada (radiação * eficiência)
      const todayProduction = todayRadiation * todayEfficiency;
      const yesterdayProduction = yesterdayRadiation * yesterdayEfficiency;

      const productionVariation = ((todayProduction - yesterdayProduction) / yesterdayProduction) * 100;

      setEnergyData({
        variation: productionVariation,
        todayProduction: todayProduction.toFixed(0),
        yesterdayProduction: yesterdayProduction.toFixed(0),
        temperature: todayTemp
      });

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
      45: "cloudy",
      48: "cloudy",
      51: "rainy",
      53: "rainy",
      55: "rainy",
      61: "rainy",
      63: "rainy",
      65: "rainy",
      80: "rainy",
      81: "rainy",
      82: "rainy",
      95: "thunderstorm",
      96: "thunderstorm",
      99: "thunderstorm"
    };
    return icons[code as keyof typeof icons] || "cloud";
  };

  const getWeatherCondition = (code: number) => {
    const conditions = {
      0: "Ensolarado",
      1: "Parc. nublado",
      2: "Parc. nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina",
      51: "Chuva leve",
      53: "Chuva moderada",
      55: "Chuva forte",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva forte",
      80: "Pancadas de chuva",
      81: "Pancadas de chuva",
      82: "Pancadas forte",
      95: "Tempestade",
      96: "Tempestade",
      99: "Tempestade forte"
    };
    return conditions[code as keyof typeof conditions] || "Nublado";
  };

  const getWeatherColor = (code: number) => {
    const colors = {
      0: "#F59E0B",
      1: "#FBBF24",
      2: "#FBBF24",
      3: "#94A3B8",
      45: "#CBD5E1",
      48: "#CBD5E1",
      51: "#60A5FA",
      53: "#3B82F6",
      55: "#2563EB",
      61: "#60A5FA",
      63: "#3B82F6", 
      65: "#2563EB",
      80: "#3B82F6",
      81: "#2563EB",
      82: "#1E40AF",
      95: "#7C3AED",
      96: "#6D28D9",
      99: "#5B21B6"
    };
    return colors[code as keyof typeof colors] || "#64748B";
  };

  const getEnergyStatus = (variation: number) => {
    if (variation > 5) return { text: "Alta produção", color: "#10B981" };
    if (variation > -2) return { text: "Produção normal", color: "#3B82F6" };
    if (variation > -10) return { text: "Baixa produção", color: "#F59E0B" };
    return { text: "Produção crítica", color: "#EF4444" };
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#ffc125" />
      </View>
    );
  }

  const energyStatus = getEnergyStatus(energyData.variation);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.location}>
          <Ionicons name="location-sharp" size={14} color="#64748B" />
          <Text style={styles.locationText}>São Paulo, SP</Text>
        </View>
        <Text style={styles.time}>
          {new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        {/* Ícone do Tempo */}
        <View style={styles.weatherIconContainer}>
          <Ionicons 
            name={getWeatherIcon(weather.weather_code)} 
            size={44} 
            color={getWeatherColor(weather.weather_code)} 
          />
        </View>

        {/* Temperatura e Condição */}
        <View style={styles.weatherInfo}>
          <Text style={styles.temperature}>
            {Math.round(weather.temperature_2m)}°
          </Text>
          <Text style={styles.condition}>
            {getWeatherCondition(weather.weather_code)}
          </Text>
        </View>

        {/* Comparação de Energia */}
        <View style={styles.energyContainer}>
          <View style={styles.energyIcon}>
            <Ionicons 
              name={energyData.variation >= 0 ? "trending-up" : "trending-down"} 
              size={18} 
              color={energyData.variation >= 0 ? "#10B981" : "#EF4444"} 
            />
          </View>
          <View style={styles.energyContent}>
            <Text style={[
              styles.energyVariation,
              { color: energyData.variation >= 0 ? "#10B981" : "#EF4444" }
            ]}>
              {energyData.variation >= 0 ? "+" : ""}{energyData.variation.toFixed(1)}%
            </Text>
            <Text style={styles.energyLabel}>
              vs. ontem
            </Text>
          </View>
        </View>
      </View>

      {/* Status Footer */}
      <View style={styles.footer}>
        <View style={styles.status}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: energyStatus.color }
          ]} />
          <Text style={styles.statusText}>
            {energyStatus.text}
          </Text>
        </View>
        <Text style={styles.temperatureInfo}>
          {Math.round(energyData.temperature)}°C máxima
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 354,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weatherIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  weatherInfo: {
    alignItems: 'center',
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  condition: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: '500',
    textAlign: 'center',
  },
  energyContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  energyIcon: {
    marginBottom: 4,
  },
  energyContent: {
    alignItems: 'center',
  },
  energyVariation: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: 'center',
  },
  energyLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: '500',
  },
  temperatureInfo: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: '500',
  },
});