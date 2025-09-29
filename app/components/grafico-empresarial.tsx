import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function MultiDonutChart() {
  const dados = [
    { valor: 0.9, cor: "#ffc125", raio: 60, largura: 8, label: "nn sei 40%" },
    { valor: 0.7, cor: "#fae6b0ff", raio: 45, largura: 8, label: "non 50%" },
    { valor: 0.5, cor: "#f8ce62ff", raio: 30, largura: 8, label: "not 10%" },
  ];

  return (
    <View style={estilos.wrapper}>
      {/* Gráfico */}
      <Svg height="150" width="150" viewBox="0 0 150 150">
        {dados.map((item, index) => {
          const circunferencia = 2 * Math.PI * item.raio;
          const progresso = circunferencia * (1 - item.valor);

          return (
            <Circle
              key={index}
              cx="75"
              cy="75"
              r={item.raio}
              stroke={item.cor}
              strokeWidth={item.largura}
              strokeLinecap="round"
              strokeDasharray={`${circunferencia}`}
              strokeDashoffset={progresso}
              fill="none"
            />
          );
        })}
      </Svg>

      {/* Legenda lateral */}
      <View style={estilos.legenda}>
        {dados.map((item, index) => (
          <View key={index} style={estilos.legendaItem}>
            <View
              style={[estilos.corLegenda, { backgroundColor: item.cor }]}
            />
            <Text style={estilos.textoLegenda}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  legenda: {
    marginLeft: 20,
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  corLegenda: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  textoLegenda: {
    fontSize: 14,
  },
});
