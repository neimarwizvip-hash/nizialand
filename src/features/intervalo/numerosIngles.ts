// Números por extenso em inglês (−100 a 100), usados nos jogos de intervalo.
const UNIDADES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const DEZENAS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numeroEmIngles(n: number): string {
  if (n < 0) return `minus ${numeroEmIngles(-n)}`;
  if (n === 100) return 'one hundred';
  if (n < 20) return UNIDADES[n];
  const d = Math.floor(n / 10), u = n % 10;
  return u ? `${DEZENAS[d]}-${UNIDADES[u]}` : DEZENAS[d];
}
