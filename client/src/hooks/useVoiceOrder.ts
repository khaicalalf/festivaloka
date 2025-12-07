import { useCallback, useEffect, useRef, useState } from "react";
import type { Tenant, MenuItem, CartItem } from "../types";

type Props = {
  tenants: Tenant[];
  setSelectedTenant: (t: Tenant | null) => void;
  setCart: (items: CartItem[]) => void;
  setCheckoutOpen: (open: boolean) => void;
  onVoiceStopped?: () => void;
};

export function useVoiceOrder({
  tenants,
  setSelectedTenant,
  setCart,
  setCheckoutOpen,
  onVoiceStopped,
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  /* =============================
      AI PROCESSING LOGIC
  ============================== */
  const handleVoiceQuery = useCallback(
    async (text: string) => {
      try {
        const res = await fetch(
          "https://festivaloka-dev.up.railway.app/api/kolosal-ai/voice-order",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: text }),
          }
        );

        const data = await res.json();
        const { tenantId, menuId, quantity } = data;

        const tenant = tenants.find((t) => Number(t.id) === Number(tenantId));
        if (!tenant) return;

        setSelectedTenant(tenant);

        const menuItem = tenant.menus.find(
          (m: MenuItem) => Number(m.id) === Number(menuId)
        );
        if (!menuItem) return;

        setCart([{ menuItem, quantity }]);
        setCheckoutOpen(true);
      } catch (err) {
        console.error("Voice AI Error:", err);
      }
    },
    [tenants, setSelectedTenant, setCart, setCheckoutOpen]
  );

  /* =============================
      SETUP SPEECH RECOGNITION
  ============================== */
  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn("Browser tidak mendukung speech recognition");
      return;
    }

    const recog: ISpeechRecognition = new SpeechRecognitionClass();
    recog.lang = "id-ID";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onresult = async (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      await handleVoiceQuery(transcript);
      setIsListening(false);
      onVoiceStopped?.();
    };

    recog.onerror = (ev: Event) => {
      const errEvt = ev as unknown as { error?: string };
      console.error("Speech error:", errEvt.error ?? "unknown");
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
      onVoiceStopped?.();
    };

    recognitionRef.current = recog;
  }, [handleVoiceQuery, onVoiceStopped]);

  /* =============================
      START & STOP
  ============================== */
  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Browser tidak mendukung suara.");
      return;
    }
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return {
    startVoiceInput,
    stopVoiceInput,
    isListening,
  };
}
