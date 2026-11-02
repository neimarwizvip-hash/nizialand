// Plugin do build: monta public "pacotes.json" (o que cada nível baixa) e o service worker com a versão do build.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';
import { ENTRADAS_NIVEL, EXTRAS_NIVEL } from '../../src/config/pacotesNiveis';

interface Pedaco { type: 'chunk'; fileName: string; facadeModuleId: string | null; imports: string[]; dynamicImports: string[]; code: string; viteMetadata?: { importedCss: Set<string>; importedAssets: Set<string> } }

export function pacotesPorNivel(): Plugin {
  let raiz = process.cwd();
  return {
    name: 'nisialand-pacotes',
    apply: 'build',
    configResolved(c) { raiz = c.root; },
    generateBundle(_op, bundle) {
      const pedacos = Object.values(bundle).filter(b => b.type === 'chunk') as unknown as Pedaco[];
      const porArquivo = new Map(pedacos.map(p => [p.fileName, p]));
      const niveis: Record<number, Set<string>> = {};
      const juntar = (n: number, url: string) => { (niveis[n] ||= new Set()).add(url); };
      // Telas: o pedaço de entrada e tudo o que ele importa (inclusive o que carrega depois, como o 3D).
      const idDe = (p: Pedaco) => (p.facadeModuleId ? relative(raiz, p.facadeModuleId).replace(/\\/g, '/') : '');
      const principal = new Set<string>();
      const entradaApp = pedacos.find(p => p.fileName.startsWith('assets/index-'));
      if (entradaApp) for (const f of entradaApp.imports) principal.add(f); // já baixado com a página
      if (entradaApp) principal.add(entradaApp.fileName);
      // Fecho: importações fixas sempre; carregamentos posteriores (ex.: o 3D) só se não forem a tela de outro nível.
      const fecho = (p: Pedaco, visto = new Set<string>()): Set<string> => {
        if (visto.has(p.fileName) || principal.has(p.fileName)) return visto;
        visto.add(p.fileName);
        for (const f of p.imports) { const q = porArquivo.get(f); if (q) fecho(q, visto); }
        for (const f of p.dynamicImports) { const q = porArquivo.get(f); if (q && !ENTRADAS_NIVEL[idDe(q)]) fecho(q, visto); }
        return visto;
      };
      const ASSET = /["'`](\/assets\/[^"'`\s)]+?\.(?:png|jpe?g|webp|mp3|mp4|svg))["'`]/g;
      for (const p of pedacos) {
        const ns = ENTRADAS_NIVEL[idDe(p)];
        if (!ns) continue;
        for (const f of fecho(p)) {
          if (principal.has(f)) continue;
          const q = porArquivo.get(f)!;
          for (const n of ns) {
            juntar(n, '/' + f);
            q.viteMetadata?.importedCss.forEach(c => juntar(n, '/' + c));
            for (const m of q.code.matchAll(ASSET)) juntar(n, m[1]);
          }
        }
      }
      for (const [n, lista] of Object.entries(EXTRAS_NIVEL)) for (const u of lista) juntar(Number(n), u);
      // Vozes de cada nível (manifesto gerado no PC; só as que existem de fato).
      const pasta = join(raiz, 'public', 'assets', 'vozes');
      if (existsSync(join(pasta, 'manifesto.json')) && existsSync(join(pasta, 'indice.json'))) {
        const existe = new Set<string>(JSON.parse(readFileSync(join(pasta, 'indice.json'), 'utf8')));
        const manifesto: Array<{ chave: string; niveis?: number[] }> = JSON.parse(readFileSync(join(pasta, 'manifesto.json'), 'utf8'));
        for (const f of manifesto) if (existe.has(f.chave)) for (const n of f.niveis ?? [0]) juntar(n, `/assets/vozes/${f.chave}.mp3`);
      }
      // Só arquivos que existem em public/ ou no próprio build.
      const existeArquivo = (u: string) => !!bundle[u.slice(1)] || existsSync(join(raiz, 'public', u));
      const saida: Record<string, string[]> = {};
      for (const [n, s] of Object.entries(niveis)) saida[n] = [...s].filter(existeArquivo).sort();
      const versao = createHash('sha1').update(JSON.stringify(saida)).update(pedacos.map(p => p.fileName).sort().join()).digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'pacotes.json', source: JSON.stringify({ versao, niveis: saida }) });
      const sw = readFileSync(join(raiz, 'scripts', 'pacotes', 'sw-modelo.js'), 'utf8').replace(/__VERSAO__/g, versao);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: sw });
    },
  };
}
