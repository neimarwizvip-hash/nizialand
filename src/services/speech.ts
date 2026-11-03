// Frases em inglês das atividades (ouvir a pergunta, a instrução, a fala do personagem).
// Passa pela narração: primeiro a fala GRAVADA (Phonon, sempre a mesma voz); sem arquivo, a voz do navegador.
// O script `npm run vozes` grava estas frases a partir dos mesmos dados (ver scripts/vozes/exportar-falas.ts).
import { narrar, type NomeVoz } from './narracao';

/** Texto exatamente como é falado (e como a fala gravada é procurada): sem HTML e com "blank" no lugar das lacunas. */
export const textoFalado = (texto: string) =>
  texto.replace(/<[^>]*>/g, '').replace(/_+/g, 'blank').replace(/\s+/g, ' ').trim();

let pararAtual: () => void = () => undefined;

/** Fala uma frase em inglês. `personagem` escolhe a voz (padrão: a voz das frases de escuta). */
export function speakEnglish(text: string, personagem: NomeVoz = 'professora', rate?: number) {
  pararAtual();
  pararAtual = narrar([{ texto: textoFalado(text), idioma: 'en-US', personagem, rate }]);
}

/** Fala em português com a voz gravada do Zé Cartinha (implicância). */
export function speakPortuguese(text: string) {
  pararAtual();
  pararAtual = narrar([{ texto: text, idioma: 'pt-BR', personagem: 'ze' }]);
}

export const pararFala = () => pararAtual();

export const speechService = {
  speakEnglish,
  speakPortuguese,
  speak: (text: string, _lang: string = 'en-US', personagem?: NomeVoz) => speakEnglish(text, personagem),
  parar: pararFala,
};
