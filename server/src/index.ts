require("dotenv").config();

import cors from "cors";
import express, { Request, Response } from "express";
import OpenAI from "openai";

const openAIKey = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({
  apiKey: openAIKey,
});

interface Data {
  photo: string;
  name: string;
  messages: string[][];
}

const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

interface Data {
  photo: string;
  name: string;
  messages: string[][];
}

async function analyzeMessages(data: Data) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            Você é um programa especializado em detecção de fraudes por mensagem em plataformas de comunicação.
            Sua tarefa é analisar conversas e fornecer uma nota de probabilidade de 0 a 10, indicando a chance do usuário estar sendo vítima de um golpe.
            Seja extremamente rigoroso e crítico na sua avaliação. Evite ao máximo falsos positivos e considere cuidadosamente o contexto da conversa.
            
            Diretrizes para avaliação:
              - Propostas que parecem ser "boas demais para ser verdade" (ofertas irrecusáveis, promessas de dinheiro fácil, etc.) devem aumentar a nota de risco.
              - Mensagens que envolvem pedidos urgentes de ação, como transferências bancárias, fornecimento de dados pessoais, ou clicar em links suspeitos, também indicam risco elevado.
              - Considere sinais de engenharia social, como o uso de confiança indevida, manipulação emocional, ou tentativa de imitar autoridades ou figuras familiares.
              - Se o nome do contato é um número de telefone, isso pode indicar que o contato não foi salvo, o que pode aumentar a suspeita.
              - Se o contato usa um nome que corresponde ao de um conhecido fraudador ou ao de uma organização suspeita, isso deve influenciar a nota.
              - Por outro lado, converse normalmente (discussões triviais, familiares ou de rotina) devem resultar em uma nota de risco baixa, a menos que contenham elementos dos mencionados acima.
              - Dê maior peso a contextos que envolvem troca de dinheiro ou informações sensíveis.

            Dados para análise:
              - Nome de contato do possível agente malicioso: ${data.name}
              - Mensagens trocadas: ${data.messages}
          `,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Failed to analyze messages:", error);
    throw error;
  }
}

app.post("/api", async (req: Request, res: Response) => {
  const data: Data = req.body;
  const analyzedData = await analyzeMessages(data);
  console.log(data);
  console.log(`Fraud chance: ${analyzedData}`);
  res.json({ note: analyzedData });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => res.send("Express on Vercel"));
