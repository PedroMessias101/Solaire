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
       <Tabs.Screen
        name="config"
        options={{
          title: "Config",
              tabBarStyle: { display: "none" }, 
        }}
      />
       <Tabs.Screen
        name="gerenciarConta"
        options={{
          title: "gerenciarConta",
              tabBarStyle: { display: "none" }, 
        }}
      />
       <Tabs.Screen
        name="slides"
        options={{
          title: "slides",
              tabBarStyle: { display: "none" }, 
        }}
      />
       <Tabs.Screen
        name="alterar-senha"
        options={{
          title: "alterar-senha",
              tabBarStyle: { display: "none" }, 
        }}
      />
       <Tabs.Screen
        name="chat-bot"
        options={{
          title: "chatbot",
              tabBarStyle: { display: "none" }, 
        }}
      />
       <Tabs.Screen
        name="conta"
        options={{
          title: "conta",
              tabBarStyle: { display: "none" }, 
        }}
      />
             <Tabs.Screen
        name="manutecao"
        options={{
          title: "manuntecao",
              tabBarStyle: { display: "none" }, 
        }}
      />
      
    </Tabs>
  );
}
