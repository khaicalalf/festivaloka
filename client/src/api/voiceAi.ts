// src/api/voiceAi.ts

export type VoiceAIResponse = {
  tenantId: number;
  menuId: number;
  quantity: number;
  reason: string;
};

export async function getAIRecommendation(
  query: string
): Promise<VoiceAIResponse> {
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

  return res.json();
}
