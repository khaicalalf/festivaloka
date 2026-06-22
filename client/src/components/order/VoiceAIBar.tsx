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
        w-full transition-all duration-300
        ${
          stickBottom
            ? "fixed bottom-0 left-0 px-4 pb-6 pt-4 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent z-40"
            : ""
        }
      `}
    >
      <div className={`${stickBottom ? "max-w-2xl mx-auto" : ""} bg-white border border-amber-200/60 rounded-[2rem] p-5 shadow-xl relative overflow-hidden`}>
        {/* Glow effect */}
        {isListening && (
          <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none"></div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            {/* Visual avatar/microphone circle */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isListening ? "bg-amber-500 text-white animate-bounce shadow-lg shadow-amber-500/30" : "bg-amber-50 text-amber-500 border border-amber-100"
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-black text-slate-800">Pesan Lewat Suara AI</h4>
              <p className="text-xs text-slate-500">
                {isListening ? "Katakan pesananmu sekarang..." : "Tekan tombol untuk pesan dengan asisten AI kami"}
              </p>
            </div>
          </div>

          {/* Trigger button */}
          <button
            onClick={isListening ? onStop : onStart}
            className={`
              px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md
              transition-all duration-300 transform w-full sm:w-auto
              flex items-center justify-center gap-2
              ${
                isListening
                  ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/15 hover:-translate-y-0.5"
              }
            `}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>Hentikan AI</span>
              </>
            ) : (
              <>
                <span>Aktifkan Suara</span>
              </>
            )}
          </button>
        </div>

        {/* Listening Wave animation */}
        {isListening && (
          <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-end gap-1.5 h-6">
              <div className="w-1 bg-amber-500 rounded-full animate-bounce h-3" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1 bg-amber-500 rounded-full animate-bounce h-5" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1 bg-amber-500 rounded-full animate-bounce h-6" style={{ animationDelay: "300ms" }}></div>
              <div className="w-1 bg-amber-500 rounded-full animate-bounce h-4" style={{ animationDelay: "450ms" }}></div>
              <div className="w-1 bg-amber-500 rounded-full animate-bounce h-2" style={{ animationDelay: "600ms" }}></div>
            </div>
            <p className="text-xs text-amber-600 font-mono tracking-widest uppercase animate-pulse">Sedang mendengarkan suara Anda...</p>
          </div>
        )}
      </div>
    </div>
  );
}
