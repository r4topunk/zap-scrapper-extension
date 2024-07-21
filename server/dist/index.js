"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const openAIKey = process.env.OPENAI_API_KEY || "";
const openai = new openai_1.default({
    apiKey: openAIKey,
});
const app = (0, express_1.default)();
const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
function analyzeMessages(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const completion = yield openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Você é um programa de detecção de fraudes via WhatsApp. Irei lhe enviar uma estrutura de dados contento nome (número de telefone), foto (se estiver vazio, significa que o usuário não tem foto adicionada) e as mensagens trocadas (veja o nome do usuário para saber quais são as mensagens do agente possivelmente malicioso). Responda apenas um número de 0 a 10 com uma nota de probabilidade de golpe. Dados: ${JSON.stringify(data)}`,
                    },
                ],
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        }
        catch (error) {
            console.error("Failed to analyze messages:", error);
            throw error;
        }
    });
}
app.post("/api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const analyzedData = yield analyzeMessages(data);
    console.log(data);
    console.log(`Fraud chance: ${analyzedData}`);
    res.json({ note: analyzedData });
}));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
app.get("/", (req, res) => res.send("Express on Vercel"));
