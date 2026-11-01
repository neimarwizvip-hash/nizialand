/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // "wide": desktop ou celular deitado (paisagem baixa) — usa o layout de tela inteira sem rolagem
      screens: {
        wide: { raw: '(min-width: 1024px), (orientation: landscape) and (max-height: 600px)' },
        // "short": celular deitado (altura baixa) — cabeçalho e telas compactos para caber sem rolar
        short: { raw: '(max-height: 480px)' },
        // "largo": tela larga com margem sobrando ao lado do painel (personagens podem espiar sem cobrir nada)
        largo: { raw: '(min-width: 1300px) and (min-height: 600px)' },
        // "alto": tela com altura sobrando (1080p, notebooks altos) — mostra frases extras dos cartazes
        alto: { raw: '(min-height: 860px)' },
      },
      colors: {
        // ===== Kit visual NISIALAND (Fase 0) =====
        // Cores tiradas da arte oficial da abertura: fachada, logo, botão JOGAR, árvores, Purple Team.
        nisia: {
          azul: { 100: '#D6E8FF', 200: '#A9CDFF', 400: '#4F86E8', 500: '#1F5FD0', 700: '#143F97', 900: '#0C2A66' },
          sol: { 100: '#FFF3C4', 300: '#FFE27A', 400: '#FFD23F', 500: '#FFC000', 700: '#D98E00' },
          laranja: { 100: '#FFE4CC', 400: '#F9A05A', 500: '#F2811D', 700: '#B85A0A' },
          verde: { 100: '#DDF5D9', 400: '#6CC877', 500: '#3FA34D', 700: '#22703A' },
          roxo: { 100: '#EDE3FF', 400: '#A67CF0', 500: '#7B3FE4', 700: '#5325A8' },
          papel: { DEFAULT: '#FFF6DF', escuro: '#F3E4BE', linha: '#E7D3A6' },
          madeira: { DEFAULT: '#C98A4B', clara: '#E0A96A', escura: '#8A5A2B' },
          lousa: { DEFAULT: '#2F6B57', escura: '#234F41', giz: '#F5F1E6' },
          cortica: { DEFAULT: '#D4A26A', escura: '#B8864E' },
          tinta: { DEFAULT: '#1A2A4A', suave: '#4A5A78' },
          certo: '#2FA84F',
          erro: '#E5484D',
        },
        // ===== Cores antigas (telas ainda não refeitas) =====
        'nisia-blue': { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#60a5fa', deep: '#1e3a8a', glow: 'rgba(59, 130, 246, 0.6)' },
        'nizia-blue': { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#60a5fa', deep: '#1e3a8a', glow: 'rgba(59, 130, 246, 0.6)' },
        'nisia-purple': { DEFAULT: '#7c3aed', dark: '#6d28d9', light: '#c084fc', deep: '#4c1d95', glow: 'rgba(168, 85, 247, 0.6)' },
        'nizia-purple': { DEFAULT: '#7c3aed', dark: '#6d28d9', light: '#c084fc', deep: '#4c1d95', glow: 'rgba(168, 85, 247, 0.6)' },
        'nisia-gold': { DEFAULT: '#f59e0b', light: '#fde047', dark: '#b45309', glow: 'rgba(245, 158, 11, 0.6)' },
        'nizia-gold': { DEFAULT: '#f59e0b', light: '#fde047', dark: '#b45309', glow: 'rgba(245, 158, 11, 0.6)' },
        'nisia-green': { DEFAULT: '#10b981', light: '#6ee7b7', dark: '#047857' },
        'nizia-green': { DEFAULT: '#10b981', light: '#6ee7b7', dark: '#047857' },
      },
      fontFamily: {
        // display: títulos de jogo (próxima do logo oficial, arredondada e pesada; licença OFL)
        display: ['"Lilita One"', 'Bungee', 'Outfit', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        bungee: ['Bungee', 'Outfit', 'sans-serif'],
        // body: Fredoka — arredondada e legível para 6º ano
        body: ['Fredoka', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        // Kit: sombra sólida de "peça de jogo" (bisel) + sombra suave
        'peca': '0 4px 0 0 rgba(26, 42, 74, 0.22), 0 10px 24px -10px rgba(26, 42, 74, 0.35)',
        'peca-press': '0 1px 0 0 rgba(26, 42, 74, 0.22)',
        'papel': '0 2px 0 0 #E7D3A6, 0 12px 28px -12px rgba(80, 50, 10, 0.45)',
        'moldura': 'inset 0 0 0 6px #C98A4B, inset 0 0 0 8px #8A5A2B, 0 10px 30px -10px rgba(0,0,0,0.5)',
        'game-sm': '0 4px 0 #1e293b',
        'game': '0 6px 0 #1e293b',
        'game-lg': '0 10px 0 #0f172a',
        'game-blue': '0 8px 0 #1e3a8a, 0 12px 24px rgba(37, 99, 235, 0.4)',
        'game-purple': '0 8px 0 #4c1d95, 0 12px 24px rgba(124, 58, 237, 0.4)',
        'game-gold': '0 8px 0 #b45309, 0 12px 24px rgba(245, 158, 11, 0.45)',
        'game-green': '0 8px 0 #065f46, 0 12px 24px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.8)',
        'glow-purple': '0 0 25px rgba(168, 85, 247, 0.8)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.8)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'bounce-slight': 'bounceSlight 1.5s infinite ease-in-out',
        'shake-wrong': 'wrongShake 0.5s ease-in-out',
        'pulse-correct': 'correctPulse 0.6s ease-in-out',
        'ze-slide-in': 'zeSlideIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'card-shuffle': 'cardShuffle 0.45s ease-in-out 3',
        'moeda-pop': 'moedaPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'anel-pulsa': 'anelPulsa 1.6s ease-out infinite',
        'balao-in': 'balaoIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' },
          '50%': { transform: 'scale(1.03)', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.95))' },
        },
        bounceSlight: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        wrongShake: { '0%, 100%': { transform: 'translateX(0)' }, '20%, 60%': { transform: 'translateX(-8px)' }, '40%, 80%': { transform: 'translateX(8px)' } },
        correctPulse: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
        zeSlideIn: { '0%': { transform: 'translateX(120%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        cardShuffle: { '0%, 100%': { transform: 'translateX(0) rotate(0deg)' }, '25%': { transform: 'translateX(-14px) rotate(-6deg)' }, '75%': { transform: 'translateX(14px) rotate(6deg)' } },
        moedaPop: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.35)' }, '100%': { transform: 'scale(1)' } },
        anelPulsa: { '0%': { transform: 'scale(1)', opacity: '0.8' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        balaoIn: { '0%': { transform: 'scale(0.6)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      }
    },
  },
  plugins: [],
}
