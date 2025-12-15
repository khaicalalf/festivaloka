type VoiceAIBarProps = {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  stickBottom: boolean;
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
        ${
          stickBottom
            ? "fixed bottom-0 left-0 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent z-5"
            : ""
        }
      `}
    >
      <button
        onClick={isListening ? onStop : onStart}
        className={`
          w-full py-4 rounded-xl font-semibold shadow-lg
          transition-all transform
          flex items-center justify-center gap-3
          ${
            isListening
              ? "bg-red-600 text-white animate-pulse hover:bg-red-700"
              : "bg-[#FF385C] text-white hover:bg-[#E31C5F] hover:shadow-xl hover:-translate-y-0.5"
          }
        `}
      >
        {isListening ? (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            <span>Stop Mendengarkan</span>
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span>Sampaikan Pesananmu</span>
          </>
        )}
      </button>

      {isListening && (
        <div className="flex items-center justify-center gap-2 mt-3 animate-pulse">
          <div className="flex gap-1">
            <div
              className="w-1 h-3 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-1 h-4 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-1 h-5 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></div>
            <div
              className="w-1 h-4 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: "450ms" }}
            ></div>
            <div
              className="w-1 h-3 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: "600ms" }}
            ></div>
          </div>
          <p className="text-sm text-red-600 font-medium">
            Sedang mendengarkan...
          </p>
        </div>
      )}
    </div>
  );
}
