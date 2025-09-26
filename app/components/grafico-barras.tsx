import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Svg, Rect } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

// Tipagem do dado
interface DataItem {
  day: string;
  value: number;
}

// Dados reais dos últimos 7 dias
const data: DataItem[] = [
  { day: "Seg", value: 5000 },
  { day: "Ter", value: 7000 },
  { day: "Qua", value: 4000 },
  { day: "Qui", value: 9000 },
  { day: "Sex", value: 6000 },
  { day: "Sáb", value: 3000 },
  { day: "Dom", value: 8000 },
];

const maxValue = Math.max(...data.map(d => d.value));

// Dia atual (0 = domingo)
const todayIndex = (() => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
})();

const GraficoBarras: React.FC = () => {
  const barWidth = (screenWidth - 40) / data.length - 5; 
  return (
    <View style={styles.container}>
      <Svg height={200} width="100%">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 150;
          const isToday = index === todayIndex;
          return (
            <Rect
              key={index}
              x={index * (barWidth + 5)}
              y={150 - barHeight}
              width={barWidth}
              height={barHeight}
              rx={5}
              fill={isToday ? "#ffc125" : "#ffc1251a"} 
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {data.map((item, index) => (
          <Text key={index} style={[styles.label, { width: barWidth }]}>
            {item.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2, 
  },
  label: {
    textAlign: "center",
    fontWeight: "500",
  },
});

export default GraficoBarras;
