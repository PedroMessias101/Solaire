import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // tempo da splash

      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };

    checkLogin();
  }, []);

  if (isLoading) {
    // Enquanto carrega, força a splash
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/splash" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

