import { MessageIA } from "@features/chatIA/domain/entities/MessageIA";
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from "@google/generative-ai";

export class GeminiDataSource {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(
    userMessage: string,
    history: MessageIA[],
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Convertir nuestras entidades al formato que Gemini entiende
    const geminiHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: { maxOutputTokens: 1000 },
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  }
}
