import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Primeiro pavimento 3D', () => {
  const file = readFileSync(resolve(process.cwd(), 'public/prototipos/primeiro-pavimento-3d.html'), 'utf8');
  it('preserva circulação, planta espacial e avatar', () => {
    expect(file).toContain('ENTRADA PRINCIPAL');
    expect(file).toContain('CORREDOR');
    expect(file).toContain('INFORMÁTICA');
    expect(file).toContain('COORDENAÇÃO');
    expect(file).toContain('student_boy_tshirt.png');
    expect(file).toContain('WASD');
  });
  it('contém os seis pontos pedagógicos do Nível 2', () => {
    for (const id of ['n2_ditado', 'n2_caca', 'n2_mural', 'n2_bilhete', 'n2_relogio', 'n2_duelo']) {
      expect(file).toContain(id);
    }
  });
  it('contém os personagens institucionais e a dupla de distração', () => {
    for (const asset of ['diretor_marcio_hd.png', 'coordenadora_vania.png', 'orientadora_leia.png', 'ze_cartinha.png', 'mane_zoeira.png']) {
      expect(file).toContain(asset);
    }
  });
});
