import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const { width } = Dimensions.get("window");

// 3 abas: Home, Adicionar Placa e Perfil
const tabs = [
  { icon: "home", route: "/tabs/home" },
  { icon: "add-circle", route: "/add-plate" },
  { icon: "person", route: "/tabs/perfil" },
];

const tabWidth = width / tabs.length;

export const AnimatedBottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // pega a rota atual

  // Define qual aba está ativa com base na rota atual
  const activeIndex = tabs.findIndex(tab => tab.route === pathname);

  const handlePress = (route: string) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tab}
          onPress={() => handlePress(tab.route)}
        >
          <Ionicons
            name={tab.icon}
            size={28}
            color={activeIndex === index ? "#ffc215" : "#fff"}
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
  },
});
