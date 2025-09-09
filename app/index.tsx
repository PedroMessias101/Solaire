import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth");
    }, 3000); 

    return () => clearTimeout(timer); 
  }, []);

  return (
    <LinearGradient
      colors={["#fcbb30","#866112ff", "#000", "#000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Image 
        source={require("@/assets/solaire-branco.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 260,
    height: 230,
  },
});
