import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animação da bolha
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 1.3, duration: 4000, useNativeDriver: true }),
            Animated.timing(scaleY, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
            Animated.timing(scaleY, { toValue: 1.3, duration: 4000, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(translateX, { toValue: 80, duration: 6000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -40, duration: 6000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 6000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, { toValue: 50, duration: 5000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -30, duration: 5000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 5000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={["#000", "#2f2103ff", "#fcbb30"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Bolha animada com gradiente preto -> amarelo */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          {
            transform: [{ scaleX }, { scaleY }, { translateX }, { translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={["#000", "#fcbb30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
      </Animated.View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Mais controle,{"\n"}mais economia.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <LinearGradient
              colors={["#fcbb30", "#e6a600"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
            <Text style={styles.linkText}>
              Novo por aqui?{" "}
              <Text style={styles.linkHighlight}>Crie uma conta</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundCircle: {
    position: "absolute",
    top: -height * 0.25,
    right: -width * 0.35,
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    overflow: "hidden",
  },
  gradientCircle: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.15,
  },
  title: {
    fontSize: width * 0.11,
    color: "#ffff",
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: height * 0.08,
    position: "absolute",
    top: height * 0.15,
  },
  buttonContainer: { width: "100%", alignItems: "center" },
  button: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.25,
    borderRadius: 50,
    shadowColor: "#fcbb30",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: height * 0.03,
  },
  buttonText: {
    color: "#000",
    fontSize: width * 0.05,
    fontWeight: "700",
    textAlign: "center",
  },
  linkText: { color: "#fff", fontSize: width * 0.04, fontWeight: "500" },
  linkHighlight: { color: "#fcbb30", fontWeight: "700", textDecorationLine: "underline" },
});
