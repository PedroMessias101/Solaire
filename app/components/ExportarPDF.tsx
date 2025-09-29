import React from "react";
import {
  TouchableOpacity,
  Text,
  Share,
  Platform,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import * as Print from "expo-print";

interface ExportarPDFProps {
  filial?: string;
  dados?: {
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

const ExportarPDF: React.FC<ExportarPDFProps> = ({
  filial = "Não informado",
  dados = {
    irradiacao: "-",
    corrente: "-",
    tensao: "-",
    potencia: "-",
    co2: "-",
    ranking: [],
    projecao: "-",
  },
  styleBotao,
  styleTexto,
}) => {
  const gerarPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              h1 { text-align: center; color: #2c3e50; }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { width: 80px; margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background: #f4f4f4; }
              ul { padding-left: 20px; margin: 0; }
              li { margin-bottom: 4px; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="https://cdn-icons-png.flaticon.com/512/1048/1048947.png" alt="Logo" />
              <h1>Relatório de Energia - ${filial}</h1>
              <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
            </div>

            <table>
              <tr><th>Indicador</th><th>Valor</th></tr>
              <tr><td>Irradiação</td><td>${dados.irradiacao}</td></tr>
              <tr><td>Corrente</td><td>${dados.corrente}</td></tr>
              <tr><td>Tensão</td><td>${dados.tensao}</td></tr>
              <tr><td>Potência</td><td>${dados.potencia}</td></tr>
              <tr><td>CO₂ evitado</td><td>${dados.co2}</td></tr>
              <tr>
                <td>Ranking de Unidades</td>
                <td>
                  <ul>
                    ${dados.ranking.map((item) => `<li>${item}</li>`).join("")}
                  </ul>
                </td>
              </tr>
              <tr><td>Projeção Financeira</td><td>${dados.projecao}</td></tr>
            </table>
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
