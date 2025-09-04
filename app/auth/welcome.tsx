import React from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/welcome.jpeg")}
        style={styles.background}
        resizeMode="cover"
      />

      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>mais controle,{"\n"}mais economia.</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
            <Text style={styles.linkText}>Novo por aqui? crie uma conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 45,
    color: "#fff",
    fontWeight: "600",
    textAlign: "start",
    lineHeight: 52,
  },
  buttonContainer: { width: "100%", alignItems: "center" },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 50,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  linkText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
