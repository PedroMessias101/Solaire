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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animação da bolha - mais suave
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 1.2, duration: 4000, useNativeDriver: true }),
            Animated.timing(scaleY, { toValue: 0.9, duration: 4000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scaleX, { toValue: 0.9, duration: 4000, useNativeDriver: true }),
            Animated.timing(scaleY, { toValue: 1.2, duration: 4000, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(translateX, { toValue: 60, duration: 6000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -30, duration: 6000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 6000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, { toValue: 40, duration: 5000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 5000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 5000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Bolha animada suave com gradiente claro */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          {
            transform: [{ scaleX }, { scaleY }, { translateX }, { translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={["#fbf5deff", "#ffffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
      </Animated.View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        <Image
          source={require('@/assets/logo-principal.png')}
          style={styles.image}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <LinearGradient
              colors={["#ffc125", "#ffc125"]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffff" 
  },
  backgroundCircle: {
    position: "absolute",
    top: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    overflow: "hidden",
    opacity: 0.8,
  },
  gradientCircle: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.15,
  },
  buttonContainer: { 
    width: "100%", 
    alignItems: "center" 
  },
  button: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.25,
    borderRadius: 50,
    shadowColor: "#ffc125",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: height * 0.03,
  },
  image: {
    width: 300,
    height: 110,
    marginBottom: 280, 
    marginLeft: 5,
  },
  buttonText: {
    color: "#000",
    fontSize: width * 0.045,
    fontWeight: "600",
    textAlign: "center",
  },
  linkText: { 
    color: "#6c757d", 
    fontSize: width * 0.038, 
    fontWeight: "500" 
  },
  linkHighlight: { 
    color: "#ffc125", 
    fontWeight: "600", 
    textDecorationLine: "underline" 
  },
});