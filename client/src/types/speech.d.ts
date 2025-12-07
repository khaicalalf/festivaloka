declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }

  interface ISpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;

    start: () => void;
    stop: () => void;

    onresult: ((event: ISpeechRecognitionEvent) => void) | null;
    onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

  interface ISpeechRecognitionEvent {
    results: {
      [index: number]: {
        [index: number]: {
          transcript: string;
        };
      };
    };
  }

  interface ISpeechRecognitionErrorEvent {
    error: string;
  }
}

export {};
