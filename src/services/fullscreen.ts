// Tela cheia real do navegador (como a abertura). Precisa de um toque/clique do aluno para ligar.
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export const isFullscreen = (): boolean => {
  const d = document as FsDocument;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
};

export const enterFullscreen = async (): Promise<void> => {
  if (isFullscreen()) return;
  const el = document.documentElement as FsElement;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch {
    // navegador recusou (ex.: iPhone sem suporte); o jogo segue normal
  }
};

export const exitFullscreen = async (): Promise<void> => {
  if (!isFullscreen()) return;
  const d = document as FsDocument;
  try {
    if (d.exitFullscreen) await d.exitFullscreen();
    else if (d.webkitExitFullscreen) await d.webkitExitFullscreen();
  } catch {
    // ignora
  }
};

export const toggleFullscreen = (): Promise<void> => (isFullscreen() ? exitFullscreen() : enterFullscreen());

export const isFullscreenSupported = (): boolean => {
  const el = document.documentElement as FsElement;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
};

export const onFullscreenChange = (cb: () => void): (() => void) => {
  document.addEventListener('fullscreenchange', cb);
  document.addEventListener('webkitfullscreenchange', cb);
  return () => {
    document.removeEventListener('fullscreenchange', cb);
    document.removeEventListener('webkitfullscreenchange', cb);
  };
};

// Mantém o jogo em tela cheia: se o navegador sair dela (troca de tela, alerta etc.),
// o próximo toque/tecla do aluno volta para a tela cheia. Só para de fazer isso
// quando o aluno sai de propósito pelo botão de tela cheia.
let userOptedOut = false;
export const setFullscreenOptOut = (value: boolean): void => {
  userOptedOut = value;
};

export const keepFullscreen = (): (() => void) => {
  const onGesture = (e: Event) => {
    if (userOptedOut || isFullscreen()) return;
    if (e instanceof KeyboardEvent && (e.key === 'Escape' || e.key === 'F11')) return;
    void enterFullscreen();
  };
  document.addEventListener('click', onGesture, true);
  document.addEventListener('keydown', onGesture, true);
  return () => {
    document.removeEventListener('click', onGesture, true);
    document.removeEventListener('keydown', onGesture, true);
  };
};
