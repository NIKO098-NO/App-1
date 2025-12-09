import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client. The API key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ParsedOrderData {
  customerName: string;
  phoneNumber: string;
  items: string;
  totalPrice: number;
  notes: string;
}

/**
 * Parses unstructured text into structured order data using Gemini 2.5 Flash.
 */
export const parseOrderFromText = async (text: string): Promise<ParsedOrderData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract order details from the following text. 
      If a value is missing, use an empty string or 0.
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING, description: "Full name of the customer" },
            phoneNumber: { type: Type.STRING, description: "Phone number formatted nicely" },
            items: { type: Type.STRING, description: "Summary of items ordered, e.g. '2x Cookies'" },
            totalPrice: { type: Type.NUMBER, description: "Total price of the order in numbers only" },
            notes: { type: Type.STRING, description: "Any special instructions or delivery notes" },
          },
          required: ["customerName", "items", "totalPrice"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ParsedOrderData;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse order with Gemini:", error);
    throw error;
  }
};
