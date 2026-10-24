// Web Speech API Service for NISIALAND

export function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this environment");
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/_{2,}/g, 'blank')
      .replace(/blank/g, 'blank');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en_US")) ||
                    voices.find(v => v.lang.startsWith("en"));
    if (usVoice) utterance.voice = usVoice;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech error:", err);
  }
}

// Fala em português com voz mais aguda e rápida (implicância do Zé Cartinha).
export function speakPortuguese(text: string, pitch = 1.4, rate = 1.1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = pitch;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').startsWith('pt-BR')) ||
                  window.speechSynthesis.getVoices().find(v => v.lang.startsWith('pt'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech error:", err);
  }
}

export const speechService = {
  speakEnglish,
  speakPortuguese,
  speak: (text: string, _lang: string = 'en-US') => speakEnglish(text)
};
