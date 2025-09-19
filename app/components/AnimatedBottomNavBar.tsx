import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// 3 abas: Home, Adicionar Placa e Perfil
const tabs = [
  { icon: "home" },        // Home
  { icon: "add-circle" },  // Adicionar placa
  { icon: "person" },      // Perfil
];

const tabWidth = width / tabs.length;

interface Props {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export const AnimatedBottomNavBar: React.FC<Props> = ({ activeIndex, onTabPress }) => {
  const translateX = useRef(new Animated.Value(activeIndex * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      {/* Círculo animado atrás do ícone */}
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ translateX: translateX }],
          },
        ]}
      />
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tab}
          onPress={() => onTabPress(index)}
        >
          <Ionicons
            name={tab.icon}           // <- aqui está a mudança principal
            size={28}
            color={activeIndex === index ? "#000" : "#fff"} // preto se ativo, branco se não
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "#111",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20, // garante que o ícone fique acima do círculo
  },
  circle: {
    position: "absolute",
    width: tabWidth - 70, // tamanho menor
    height: tabWidth - 70,
    borderRadius: (tabWidth - 70) / 2,
    backgroundColor: "#ffc125",
    bottom: 5,
    left: (tabWidth - (tabWidth - 70)) / 2, // centraliza atrás do ícone
    zIndex: 10,
  },
});
