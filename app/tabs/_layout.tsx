import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // oculta a tab bar em todas as telas
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      <Tabs.Screen name="config" options={{ title: "Config" }} />
      <Tabs.Screen name="gerenciarConta" options={{ title: "Gerenciar Conta" }} />
      <Tabs.Screen name="slides" options={{ title: "Slides" }} />
      <Tabs.Screen name="alterar-senha" options={{ title: "Alterar Senha" }} />
      <Tabs.Screen name="chat-bot" options={{ title: "Chatbot" }} />
      <Tabs.Screen name="conta" options={{ title: "Conta" }} />
      <Tabs.Screen name="manutecao" options={{ title: "Manutenção" }} />
    </Tabs>
  );
}
