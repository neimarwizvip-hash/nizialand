"""Gera um mp3 por fala do manifesto com o Phonon (no computador, sem internet depois do primeiro download).

Uso (pela raiz do projeto): npm run vozes
- Português: modelo local do Phonon pt (C:/Users/<você>/.claude-voice/model).
- Inglês: hf://gradium/phonon-31m-en (já no cache do Hugging Face).
- Só gera o que falta; apaga mp3 que não está mais no manifesto; grava indice.json (lista das chaves).
- mp3 mono 32 kb/s sem metadados.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
PASTA = RAIZ / "public" / "assets" / "vozes"
MODELO_PT = Path(os.environ.get("USERPROFILE", str(Path.home()))) / ".claude-voice" / "model"
MODELO_EN = "hf://gradium/phonon-31m-en"


def ffmpeg() -> str:
    achado = shutil.which("ffmpeg")
    if achado:
        return achado
    base = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages"
    for p in base.glob("Gyan.FFmpeg*/**/bin/ffmpeg.exe"):
        return str(p)
    sys.exit("ffmpeg não encontrado")


def main() -> None:
    import ptts

    manifesto = json.loads((PASTA / "manifesto.json").read_text(encoding="utf-8"))
    chaves = {m["chave"] for m in manifesto}
    falta = [m for m in manifesto if not (PASTA / f"{m['chave']}.mp3").exists()]
    print(f"{len(manifesto)} falas no manifesto, {len(falta)} para gerar")

    ff = ffmpeg()
    modelos: dict[str, object] = {}

    def modelo(idioma: str):
        if idioma not in modelos:
            if idioma == "en-US":
                modelos[idioma] = ptts.TTS(MODELO_EN, lang="en", quant="q8")
            else:
                modelos[idioma] = ptts.TTS(str(MODELO_PT).replace("\\", "/"), lang="pt", quant="q8")
        return modelos[idioma]

    with tempfile.TemporaryDirectory() as tmp:
        for n, m in enumerate(falta, 1):
            wav = Path(tmp) / f"{m['chave']}.wav"
            modelo(m["idioma"]).save(str(wav), m["texto"], voice=m["voz"])
            subprocess.run([ff, "-loglevel", "error", "-y", "-i", str(wav), "-map_metadata", "-1", "-ac", "1", "-ar", "24000", "-b:a", "32k",
                            str(PASTA / f"{m['chave']}.mp3")], check=True)
            if n % 20 == 0 or n == len(falta):
                print(f"  {n}/{len(falta)}")

    sobras = [p for p in PASTA.glob("*.mp3") if p.stem not in chaves]
    for p in sobras:
        p.unlink()
    (PASTA / "indice.json").write_text(json.dumps(sorted(chaves)) + "\n", encoding="utf-8")
    total = sum(p.stat().st_size for p in PASTA.glob("*.mp3"))
    print(f"pronto: {len(chaves)} arquivos, {total / 1024 / 1024:.1f} MB; {len(sobras)} antigos removidos")


if __name__ == "__main__":
    main()
