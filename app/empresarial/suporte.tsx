import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function SupportScreen() {
  const PUBLIC_KEY = "edbyeqt6mlrlyclvpbhww5s5";

  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <Text style={styles.text}>
          O chat de suporte não é compatível com a versão web.  
          Acesse pelo aplicativo mobile.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: `https://widget.tidiochat.com/${PUBLIC_KEY}` }}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    textAlign: "center",
    color: "#555",
  },
});
