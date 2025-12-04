import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArduinoProvider } from "../context/ArduinoContext";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      // Apenas para dar tempo do splash
      await new Promise(resolve => setTimeout(resolve, 2000));

      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };

    checkLogin();
  }, []);

  if (isLoading) return null;

  return (
    <ArduinoProvider> 
      
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="tabs" />
        ) : (
          <Stack.Screen name="auth" />
        )}
      </Stack>
    </ArduinoProvider>
  );
}
