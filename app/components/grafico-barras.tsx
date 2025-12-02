import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { Rect, Svg } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface GraficoBarrasProps {
  placas: any[];
}

const GraficoBarras: React.FC<GraficoBarrasProps> = ({ placas }) => {
  const data = placas.map((p) => ({
    name: p.name || p.serial,
    value: p.energia_kWh || 0,
    status: p.status,
  }));

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minBarHeight = 8;

  const barWidth = Math.min(60, (screenWidth - 60) / Math.max(data.length, 1));

  const animatedValues = useRef<Animated.Value[]>([]).current;

  // --- 🔥 FIX 1: Sempre manter animatedValues sincronizado ---
  if (animatedValues.length !== data.length) {
    animatedValues.splice(0, animatedValues.length);
    data.forEach(() => animatedValues.push(new Animated.Value(0)));
  }

  useEffect(() => {
    Animated.stagger(
      150,
      animatedValues.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [data.length]);

  return (
    <View style={styles.container}>
      <View style={styles.baseLine} />

      <View style={styles.svgWrapper}>
        {data.map((item, index) => {
          // --- 🔥 FIX 2: evitar erro caso animatedValues[index] esteja undefined ---
          if (!animatedValues[index]) return null;

          const rawHeight = (item.value / maxValue) * 130;
          const barHeight =
            item.value === 0 ? minBarHeight : Math.max(rawHeight, minBarHeight);

          return (
            <View key={index} style={styles.barColumn}>
              <Animated.View
                style={{
                  height: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, barHeight],
                  }),
                  marginBottom: 8,
                }}
              >
                <Svg height={barHeight} width={barWidth}>
                  <Rect
                    x={0}
                    y={0}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill={
                      item.status === "Ativa"
                        ? item.value > 0
                          ? "#fcc335ff"
                          : "#FFD166"
                        : "#95A5A6"
                    }
                    opacity={item.status === "Ativa" ? 1 : 0.6}
                  />

                  {item.status === "Ativa" && item.value > 0 && (
                    <Rect
                      x={0}
                      y={0}
                      width={barWidth}
                      height={Math.max(4, barHeight * 0.3)}
                      rx={6}
                      fill="white"
                      opacity={0.3}
                    />
                  )}
                </Svg>

                <Text
                  style={[
                    styles.value,
                    item.value === 0 && styles.zeroValue,
                  ]}
                >
                  {item.value.toFixed(1)} kWh
                </Text>
              </Animated.View>

              <Text
                style={[styles.label, { width: barWidth }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "Ativa" ? "#ffc125" : "#7F8C8D",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.status === "Ativa" ? "✓" : "●"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  baseLine: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "#E0E0E0",
    zIndex: -1,
  },
  svgWrapper: {
    height: 180,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 5,
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    color: "#2C3E50",
    fontSize: 11,
    marginTop: 8,
    lineHeight: 14,
  },
  value: {
    position: "absolute",
    top: -22,
    width: "100%",
    textAlign: "center",
    fontSize: 11,
    color: "#2C3E50",
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 2,
    borderRadius: 4,
  },
  zeroValue: {
    color: "#7F8C8D",
    fontWeight: "500",
  },
  statusBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
});

export default GraficoBarras;
