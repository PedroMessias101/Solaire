import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
              tabBarStyle: { display: "none" }, 
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
              tabBarStyle: { display: "none" }, 
        }}
      />
    </Tabs>
  );
}
