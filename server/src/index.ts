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
            Você é um programa de detecção de fraudes que ocorrem via WhatsApp.
            Responda apenas um número de 0 a 10 com uma nota de probabilidade do usuário estar sendo vítima de um golpe.
            Seja extretamente crítico quanto à sua análise, evite falsos positivos.
            Considere que você tem o nome do agente malicioso, e deve considerar o outro contato como o usuário.
            Dados:
              - Nome de contato do possível agente malicioso: ${data.name}
              - Mensagens trocadas: ${data.messages}`,
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
