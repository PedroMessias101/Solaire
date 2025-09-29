import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { Svg, Rect } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface DataItem {
  day: string;
  value: number;
}

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

const todayIndex = (() => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
})();

const GraficoBarras: React.FC = () => {
  const barWidth = (screenWidth - 40) / data.length - 5;
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(100, animatedValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      })
    )).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 150;
          const isToday = index === todayIndex;

          return (
            <Animated.View
              key={index}
              style={{
                position: "absolute",
                left: index * (barWidth + 5),
                bottom: 10,
                width: barWidth,
                height: animatedValues[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, barHeight],
                }),
              }}
            >
              <Svg height={barHeight} width={barWidth}>
                <Rect
                  x={0}
                  y={0}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill={isToday ? "#ffc125" : "#ffc125"}
                  opacity={isToday ? 1 : 0.5}
                />
              </Svg>
              <Text style={[styles.value, isToday && styles.todayValue]}>
                {item.value}
              </Text>
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((item, index) => (
          <Text
            key={index}
            style={[
              styles.label,
              { width: barWidth },
              index === todayIndex && styles.todayLabel,
            ]}
          >
            {item.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  svgWrapper: {
    height: 160,
    width: "100%",
    position: "relative",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    color: "#444",
  },
  todayLabel: {
    color: "#ffc125",
    fontWeight: "bold",
    fontSize: 14,
  },
  value: {
    position: "absolute",
    top: -20,
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  todayValue: {
    color: "#ffc125",
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default GraficoBarras;
