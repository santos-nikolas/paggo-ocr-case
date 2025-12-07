import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Inicializa o Gemini com a chave que colocamos no .env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<string> {
    // Escolhemos o modelo 'flash' por ser mais rápido e barato (ideal para OCR)
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = 'Extract all text from this invoice image exactly as it appears. Do not summarize.';

    // O Gemini aceita a imagem direto em base64
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  }

  async chatWithDocument(contextText: string, userQuestion: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Aqui criamos o contexto para a IA responder baseada no documento
    const prompt = `
      Context: The following is the text extracted from an invoice:
      """${contextText}"""
      
      User Question: ${userQuestion}
      
      Answer the question based strictly on the context provided above.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}