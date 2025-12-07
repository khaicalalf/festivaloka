interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => void) | null;

  onresult:
    | ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface Window {
  SpeechRecognition?: {
    new (): ISpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new (): ISpeechRecognition;
  };
}
