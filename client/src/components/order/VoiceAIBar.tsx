type VoiceAIBarProps = {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  stickBottom: boolean; // apakah fixed di bawah
};

export function VoiceAIBar({
  isListening,
  onStart,
  onStop,
  stickBottom,
}: VoiceAIBarProps) {
  return (
    <div
      className={`
        w-full
        ${stickBottom ? "fixed bottom-0 left-0 px-4 pb-4 z-50" : ""}
      `}
    >
      <button
        onClick={isListening ? onStop : onStart}
        className={`
          w-full py-3 rounded-lg text-white font-medium shadow-lg
          ${isListening ? "bg-red-600 animate-pulse" : "bg-black"}
        `}
      >
        {isListening ? "⏹ Stop Mendengarkan" : "🎤 Sampaikan Pesananmu"}
      </button>

      {isListening && (
        <p className="text-center text-xs text-red-500 mt-1 animate-pulse">
          Sedang mendengarkan…
        </p>
      )}
    </div>
  );
}
