import React, { useState } from "react";
import { 
  View, Text, StyleSheet, ImageBackground, 
  TouchableOpacity, TextInput 
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Imagem de fundo no topo */}
      <ImageBackground
        source={require("@/assets/welcome.jpeg")}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        {/* Botão de voltar */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()} // volta para a tela anterior
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </ImageBackground>

      {/* Card de cadastro */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Crie sua conta</Text>
        <Text style={styles.cardSubtitle}>Preencha os campos abaixo</Text>

        {/* Nome completo */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="user" size={16} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={18} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            keyboardType="email-address"
          />
        </View>

        {/* Senha */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry={!showPassword}
          />
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#888"
            style={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        {/* Confirmar senha */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={16} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            secureTextEntry={!showConfirmPassword}
          />
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={20}
            color="#888"
            style={styles.iconRight}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </View>

        {/* Botão de cadastro */}
        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Cadastrar</Text>
        </TouchableOpacity>

        {/* Link para login */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.signupLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f3f0",
  },
  imageBackground: {
    height: 250,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 50,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    padding: 30,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: "#0a3a5a",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#888",
  },
  signupLink: {
    color: "#0a3a5a",
    fontWeight: "bold",
  },
});
