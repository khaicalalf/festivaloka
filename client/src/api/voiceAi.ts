import { parseLocalVoiceCommand } from "./mockData";

export type VoiceAIResponse = {
  tenantId: number;
  menuId: number;
  quantity: number;
  reason: string;
};

export async function getAIRecommendation(
  query: string
): Promise<VoiceAIResponse> {
  try {
    const res = await fetch(
      "https://festivaloka-dev.up.railway.app/api/kolosal-ai/voice-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }
    );

    if (!res.ok) {
      throw new Error("AI voice order API failed");
    }

    return await res.json();
  } catch (error) {
    console.warn("Voice AI API failed. Using local parser.", error);
    // Simulate minor delay
    await new Promise((resolve) => setTimeout(resolve, 650));
    return parseLocalVoiceCommand(query);
  }
}

