import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";

// Substitua pela sua chave da API do OpenWeatherMap
const API_KEY = "SUA_API_KEY_OPENWEATHERMAP";

// Latitude e longitude padrão (São Paulo). Para localização dinâmica, use expo-location.
const LAT = -23.55052;
const LON = -46.633308;

export default function ClimaBox() {
  const [clima, setClima] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const buscarClima = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      const data = await res.json();
      setClima(data);
    } catch (e) {
      setClima(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarClima();
  }, []);

  return (
    <View style={estilos.climaBox}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFC125" />
      ) : clima && clima.weather ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{
              uri: `https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`,
            }}
            style={{ width: 48, height: 48, marginRight: 8 }}
          />
          <View>
            <Text style={estilos.climaTitulo}>{clima.weather[0].description}</Text>
            <Text style={estilos.climaTemp}>{Math.round(clima.main.temp)}°C</Text>
            <Text style={estilos.climaCidade}>{clima.name}</Text>
          </View>
        </View>
      ) : (
        <Text style={estilos.climaErro}>Não foi possível obter o clima.</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  climaBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  climaTitulo: { fontSize: 16, fontWeight: "600", color: "#333" },
  climaTemp: { fontSize: 22, fontWeight: "bold", color: "#FFC125" },
  climaCidade: { fontSize: 12, color: "#666" },
  climaErro: { color: "#b00020" },
});