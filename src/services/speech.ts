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

export const speechService = {
  speakEnglish,
  speak: (text: string, _lang: string = 'en-US') => speakEnglish(text)
};
