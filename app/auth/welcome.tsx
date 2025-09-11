import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("@/assets/fundo3.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.1,
    paddingBottom: height * 0.05,
  },
  title: {
    fontSize: width * 0.1,
    color: "#fff",
    fontWeight: "600",
    lineHeight: width * 0.12,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#fcbb30",
    borderColor: "#000",
    borderWidth: 1.5,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.25,
    borderRadius: 50,
    marginBottom: height * 0.02,
  },
  buttonText: {
    color: "#000",
    fontSize: width * 0.05,
    fontWeight: "600",
  },
  linkText: {
    color: "#fcbb30",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
});
