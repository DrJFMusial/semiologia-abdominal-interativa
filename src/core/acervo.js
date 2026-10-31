/**
 * Sons sintetizados pelo autor para fins didáticos.
 * Origem: projeto "Auscultation Simulator Application" (Kumar-laxmi, GitHub),
 * cópia local organizada pelo Codex. O projeto não declara de onde vieram as
 * gravações: a procedência NÃO foi verificada e a interface diz isso.
 * Identificação de autoria atualizada por declaração do professor; arquivos preservados.
 *
 * Modificações: reamostragem de 44 100 para 11 025 Hz (soxr), rampas de 20 ms
 * no início e no fim, sem alteração de ganho (o nível relativo entre os
 * trechos foi mantido: o íleo paralítico é baixo de propósito).
 * Os trechos do acervo têm cerca de 5 s e mostram sinais de edição (emendas).
 */
const urls = import.meta.glob('../assets/audio/acervo-*.wav', { query: '?url', import: 'default', eager: true });
const URL = Object.fromEntries(Object.entries(urls).map(([k, v]) => [k.split('/').pop(), v]));

export const ACERVO = {
  normal: {
    nome: 'Ruídos hidroaéreos normais', original: 'normal_bowel', arquivo: 'acervo-normal.wav',
    sha: '0948b6bd0b08e825a4c1750fcb8f6f78208b159c118ffd5388d1276f7cd5f032',
    desc: 'Cliques e gorgolejos irregulares, em intervalos variáveis. Em poucos segundos pode haver poucos eventos: a frequência só se estima com escuta mais longa.',
  },
  hiperativo: {
    nome: 'Ruídos hiperativos', original: 'hyperactive_sounds', arquivo: 'acervo-hiperativo.wav',
    sha: 'e7b99831455b75543d43526f7643c0b643a29172915a4c3c6308ab3c75030a37',
    desc: 'Sequências frequentes e intensas de gorgolejos. Ocorrem em diarreia e na fase inicial da obstrução; na obstrução surgem em salvas que coincidem com a cólica e podem ter timbre metálico (ABD, Bates).',
  },
  hipoativo: {
    nome: 'Ruídos hipoativos', original: 'hypoactive_sounds', arquivo: 'acervo-hipoativo.wav',
    sha: 'ba16626031807ac9c4a60a04908ef9de7d57603b431a37941a55b7c5b2104212',
    desc: 'Eventos raros e fracos, com longos intervalos. Indicam motilidade reduzida (ABD). Para afirmar ausência é preciso ouvir 2 minutos ou mais (Bates, Swartz): um trecho curto não decide.',
  },
  borborigmo: {
    nome: 'Borborigmo', original: 'borborygmus', arquivo: 'acervo-borborigmo.wav',
    sha: 'bbbaa477e8eeb90e40c06b57ed42ce7f87bb001ad9e9ae0fc1cefd8a29c00376',
    desc: 'Gorgolejo prolongado, às vezes audível sem estetoscópio (o "ronco" da fome). No ABD, "borborigmos" é sinônimo de ruídos hidroaéreos; aqui o rótulo do acervo designa o gorgolejo longo.',
  },
  ileo: {
    nome: 'Íleo paralítico (rótulo do acervo)', original: 'paralytic_ileus', arquivo: 'acervo-ileo_paralitico.wav',
    sha: '1f28aada23d3e1c4be5806f941976d741d71b7cb1e9d645375df213045efa2e8',
    desc: 'Quase só o ruído de fundo, com um evento fraco: o trecho não permite classificar a frequência ou afirmar ausência. O volume baixo é do próprio trecho. Ruídos abolidos com dor, rigidez e percussão dolorosa apontam peritonite (Bates).',
  },
  atrito: {
    nome: 'Atrito peritoneal', original: 'peritoneal_friction_rub', arquivo: 'acervo-atrito_peritoneal.wav',
    sha: '6bd2c57234837c349f35e57919c41659be94b63a309dcfb3a03287695e7fa838',
    desc: 'Ruído áspero, raspante, que acompanha os movimentos respiratórios. É raro e costuma ser ouvido sobre o fígado ou o baço: tumor hepático, peri-hepatite, infarto esplênico (ABD, Bates).',
  },
  sopro: {
    nome: 'Sopro abdominal (estenose de artéria renal)', original: 'bruits_due_to_renal_arteries_stenosis', arquivo: 'acervo-sopro_renal.wav',
    sha: '90364c02c33a855c37f50041b29ed3c736dd7dc88ea4b3d5b4b6d3c2cbb55473',
    desc: 'Sopro no epigástrio ou nos quadrantes superiores. Com componentes sistólico e diastólico, em hipertenso, sugere estenose de artéria renal (Bates). A causa é o rótulo do acervo, não um diagnóstico verificado.',
  },
  normalSopro: {
    nome: 'Ruídos normais com sopro', original: 'normal_bowel_sound_with_bruits', arquivo: 'acervo-normal_com_sopro.wav',
    sha: '8914605d5233464f476b87e025b2a04ad518de1c3be3749587c8b89fd4a50006',
    desc: 'Ruídos hidroaéreos com um sopro vascular sobreposto. Sopros abdominais aparecem também em pessoas saudáveis (4% a 20%, Bates; 7% a 31%, ABD), sobretudo jovens: o contexto decide.',
  },
  patinhacao: {
    nome: 'Patinhação (capotement)', original: 'capotement', arquivo: 'acervo-patinhacao.wav',
    sha: 'ff08cfb6f4ddc5935daed0cb4bf88cbe1c25e5b56d87f6396fc5b8da596c020b',
    desc: 'Ruído de "palmadas em superfície líquida", provocado por golpes rápidos ou pelo balanço do abdome, em víscera dilatada com líquido e gás. Mais comum no epigástrio, na obstrução distal do estômago (ABD; Swartz).',
  },
};

/** Lê um WAV PCM 16 bits mono e devolve { data: Float32Array, sr }. */
function parseWav(ab) {
  const v = new DataView(ab);
  const tag = (o) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('Arquivo WAV inválido');
  let o = 12, sr = 11025, ch = 1, bits = 16, off = 0, len = 0;
  while (o + 8 <= v.byteLength) {
    const id = tag(o), l = v.getUint32(o + 4, true);
    if (id === 'fmt ') { ch = v.getUint16(o + 10, true); sr = v.getUint32(o + 12, true); bits = v.getUint16(o + 22, true); }
    if (id === 'data') { off = o + 8; len = Math.min(l, v.byteLength - off); break; }
    o += 8 + l + (l % 2);
  }
  if (bits !== 16) throw new Error('Somente PCM de 16 bits');
  const n = Math.floor(len / (2 * ch)), data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = v.getInt16(off + i * 2 * ch, true) / 32768;
  return { data, sr };
}

const cache = new Map();
export function loadAcervo(k) {
  if (!cache.has(k)) {
    const f = ACERVO[k];
    cache.set(k, fetch(URL[f.arquivo]).then((r) => { if (!r.ok) throw new Error(`Falha ao carregar ${f.arquivo}`); return r.arrayBuffer(); }).then(parseWav));
  }
  return cache.get(k);
}

export const PROCEDENCIA = 'Sons sintetizados pelo autor para fins didáticos.';
