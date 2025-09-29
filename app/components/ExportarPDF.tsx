import React from "react";
import { TouchableOpacity, Text, Share, Platform, StyleProp, TextStyle, ViewStyle } from "react-native";
import * as Print from "expo-print";

interface ExportarPDFProps {
  filial: string;
  dados: {
    irradiacao: string;
    corrente: string;
    tensao: string;
    potencia: string;
    co2: string;
    ranking: string[];
    projecao: string;
  };
  styleBotao?: StyleProp<ViewStyle>;
  styleTexto?: StyleProp<TextStyle>;
}

const ExportarPDF: React.FC<ExportarPDFProps> = ({ filial, dados, styleBotao, styleTexto }) => {
  const gerarPDF = async () => {
    try {
      // HTML personalizado do relatório
      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #444; }
              ul { margin-top: 10px; }
              li { margin-bottom: 6px; font-size: 16px; }
            </style>
          </head>
          <body>
            <h1>Relatório de Energia - ${filial}</h1>
            <ul>
              <li><strong>Irradiação:</strong> ${dados.irradiacao}</li>
              <li><strong>Corrente:</strong> ${dados.corrente}</li>
              <li><strong>Tensão:</strong> ${dados.tensao}</li>
              <li><strong>Potência:</strong> ${dados.potencia}</li>
              <li><strong>CO₂ evitado:</strong> ${dados.co2}</li>
              <li><strong>Ranking de Unidades:</strong>
                <ul>
                  ${dados.ranking.map(item => `<li>${item}</li>`).join("")}
                </ul>
              </li>
              <li><strong>Projeção Financeira:</strong> ${dados.projecao}</li>
            </ul>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      await Share.share({
        url: Platform.OS === "ios" ? uri : `file://${uri}`,
        title: "Relatório de Energia",
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar PDF.");
    }
  };

  return (
    <TouchableOpacity style={styleBotao} onPress={gerarPDF}>
      <Text style={styleTexto}>Exportar Relatório</Text>
    </TouchableOpacity>
  );
};

export default ExportarPDF;
