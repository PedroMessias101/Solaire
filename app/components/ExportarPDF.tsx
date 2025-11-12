import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function PDFSolaire() {
  const gerarPDF = async () => {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { width: 100%; max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background-color: #FF7A00; color: #fff; padding: 20px; text-align: center; }
            .header img { width: 80px; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { padding: 20px; }
            .card { border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #fdf7f2; }
            .card p { margin: 5px 0; font-size: 15px; }
            .progress { font-weight: bold; color: #0047AB; }
            .footer { text-align: center; font-size: 12px; color: gray; padding: 15px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://i.imgur.com/6f0xJ6H.png" alt="Logo Solaire" />
              <h1>Relatório de Progresso</h1>
            </div>
            <div class="content">
              <div class="card">
                <p><strong>Usuário:</strong> Nicole Alencar</p>
                <p><strong>Curso:</strong> Energia Solar Básica</p>
                <p><strong>Progresso:</strong> <span class="progress">85%</span></p>
                <p><strong>Data de geração:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="card">
                <p>Este relatório foi gerado automaticamente pelo app <strong>Solaire</strong>.</p>
              </div>
            </div>
            <div class="footer">© 2025 Solaire - Todos os direitos reservados</div>
          </div>
        </body>
      </html>
    `;

    try {
      // Gera PDF silenciosamente
      const { uri } = await Print.printToFileAsync({ html });
      const novoCaminho = FileSystem.documentDirectory + "relatorio_solaire.pdf";

      // Move para pasta permanente
      await FileSystem.moveAsync({ from: uri, to: novoCaminho });

      Alert.alert("PDF gerado!", `Arquivo salvo em:\n${novoCaminho}`);

      // Compartilha
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(novoCaminho);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={gerarPDF}>
        <Text style={styles.text}>Gerar PDF Solaire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  button: { backgroundColor: "#FFc125", padding: 15, borderRadius: 10, width: "100%", alignItems: "center" },
  text: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
