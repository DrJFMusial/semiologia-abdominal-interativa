/**
 * Síntese de sons ESQUEMÁTICOS para a aula abdominal.
 * Nada aqui é gravação clínica: a interface rotula cada som como esquema.
 *  - percussão: golpe curto que excita uma ressonância (ar livre, ar em
 *    alvéolos, sólido ou líquido);
 *  - ruídos hidroaéreos: trem de eventos breves (cliques e gorgolejos) com
 *    intervalos aleatórios, para ensinar contagem e variabilidade;
 *  - sopro: ruído filtrado modulado pelo ciclo cardíaco.
 */
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
export const reseed = (s) => { seed = s >>> 0 || 1; };

function onePoleLP(x, fc, sr) { const k = Math.exp((-2 * Math.PI * fc) / sr); let y = 0; for (let i = 0; i < x.length; i++) { y = (1 - k) * x[i] + k * y; x[i] = y; } return x; }
function onePoleHP(x, fc, sr) { const k = Math.exp((-2 * Math.PI * fc) / sr); let y = 0, px = 0; for (let i = 0; i < x.length; i++) { y = k * (y + x[i] - px); px = x[i]; x[i] = y; } return x; }
function resonate(x, f, q, sr) {
  const w = (2 * Math.PI * f) / sr, r = Math.exp(-w / (2 * q));
  let y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const y = x[i] * (1 - r) + 2 * r * Math.cos(w) * y1 - r * r * y2; y2 = y1; y1 = y; x[i] = y; }
  return x;
}
function normalize(d, peak = 0.9) { let m = 0; for (const v of d) m = Math.max(m, Math.abs(v)); if (m > 0) for (let i = 0; i < d.length; i++) d[i] = (d[i] / m) * peak; return d; }

/* ------------------------------------------------------------------------ */
/* Percussão                                                                 */
/* ------------------------------------------------------------------------ */
export const PERCUSSAO = {
  claro: { nome: 'Som claro pulmonar', f: 120, q: 4.5, dur: 0.38, amp: 0.8, desc: 'Grave, intenso e prolongado: pulmão aerado sob a parede.' },
  timpanico: { nome: 'Timpanismo', f: 240, q: 12, dur: 0.4, amp: 0.8, tonal: true, desc: 'Musical, como tambor: gás dentro de alça ou do estômago. É o som normal da maior parte do abdome.' },
  hiper: { nome: 'Hipertimpanismo', f: 200, q: 16, dur: 0.6, amp: 1.0, tonal: true, desc: 'Timpanismo mais intenso e prolongado: excesso de gás (distensão de alças, pneumoperitônio).' },
  submacico: { nome: 'Submacicez', f: 210, q: 2.2, dur: 0.14, amp: 0.45, desc: 'Intermediário: pouco gás sob o ponto (borda de órgão sólido, transição para líquido).' },
  macico: { nome: 'Macicez', f: 260, q: 1.4, dur: 0.07, amp: 0.3, desc: 'Seco, curto e fraco: não há gás sob o ponto. Pode ser sólido (fígado, baço, massa, fezes) ou líquido (ascite, bexiga cheia).' },
};
export function renderPercussao(tipo) {
  seed = 99;
  const p = PERCUSSAO[tipo], sr = 22050;
  const n = Math.round((p.dur + 0.08) * sr);
  const d = new Float32Array(n);
  for (let i = 0; i < Math.round(0.004 * sr); i++) d[i] = noise() * (1 - i / (0.004 * sr));
  const body = resonate(Float32Array.from(d), p.f, p.q, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s = body[i] * 30 * Math.exp(-t / (p.dur / 4.5));
    if (p.tonal) s += Math.sin(2 * Math.PI * p.f * t) * 0.5 * Math.exp(-t / (p.dur / 3.5)) + Math.sin(4 * Math.PI * p.f * t) * 0.12 * Math.exp(-t / (p.dur / 5));
    d[i] = d[i] * 0.5 + s;
  }
  onePoleLP(d, 1800, sr);
  return { data: normalize(d, p.amp * 0.95), sr };
}

/* ------------------------------------------------------------------------ */
/* Ruídos hidroaéreos esquemáticos                                            */
/* ------------------------------------------------------------------------ */
/**
 * Padrões: taxa média de eventos por minuto, proporção de gorgolejos longos
 * e intensidade. Valores escolhidos para ilustrar, não para classificar.
 */
export const RHA = {
  jejum: { nome: 'Jejum, fora do período digestivo', rate: 6, longos: 0.15, amp: 0.6, desc: 'Poucos eventos espaçados: fase em que o abdome fica quase silencioso por longos intervalos.' },
  posprandial: { nome: 'Depois de uma refeição', rate: 22, longos: 0.3, amp: 0.8, desc: 'Eventos frequentes, cliques e gorgolejos: atividade motora normal do período digestivo.' },
  borborigmo: { nome: 'Borborigmo (fome, "estômago roncando")', rate: 10, longos: 0.9, amp: 1, rumble: true, desc: 'Gorgolejos longos e graves, às vezes audíveis à distância. Fisiológico antes das refeições.' },
  hiperativo: { nome: 'Hiperativos (diarreia, obstrução inicial)', rate: 45, longos: 0.4, amp: 0.95, desc: 'Eventos muito frequentes, em salvas. O padrão sozinho não define a causa.' },
  hipoativo: { nome: 'Hipoativos', rate: 2, longos: 0.1, amp: 0.45, desc: 'Raros e fracos. Antes de chamar de ausentes, ouvir por 2 minutos ou mais (Bates).' },
  metalico: { nome: 'Timbre metálico (alça dilatada a montante de obstrução)', rate: 14, longos: 0.5, amp: 0.85, tinkle: true, desc: 'Agudo, com ressonância, como gotas em recipiente vazio: a alça dilatada funciona como câmara de ressonância.' },
};

function addClick(d, sr, t0, amp) {
  const i0 = Math.floor(t0 * sr), n = Math.floor(sr * (0.012 + rnd() * 0.03));
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = noise() * Math.exp(-i / (n / 4));
  resonate(x, 300 + rnd() * 500, 3, sr);
  normalize(x, amp);
  for (let i = 0; i < n && i0 + i < d.length; i++) d[i0 + i] += x[i];
  return n / sr;
}
function addGurgle(d, sr, t0, amp, { rumble = false, tinkle = false } = {}) {
  const dur = rumble ? 0.8 + rnd() * 1.4 : 0.18 + rnd() * 0.6;
  const i0 = Math.floor(t0 * sr), n = Math.floor(dur * sr);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = noise();
  const f = rumble ? 110 + rnd() * 60 : tinkle ? 700 + rnd() * 500 : 220 + rnd() * 380;
  resonate(x, f, tinkle ? 22 : rumble ? 3 : 5, sr);
  const am = 6 + rnd() * 10;
  for (let i = 0; i < n; i++) {
    const t = i / sr, u = i / n;
    const env = Math.sin(Math.PI * u) ** 0.6;
    x[i] *= env * (0.55 + 0.45 * Math.sin(2 * Math.PI * am * t + rnd() * 0.3));
  }
  normalize(x, amp);
  for (let i = 0; i < n && i0 + i < d.length; i++) d[i0 + i] += x[i];
  return dur;
}

/**
 * Gera `dur` segundos do padrão. Devolve as amostras e os instantes dos
 * eventos (para marcar no traçado depois da resposta do aluno).
 */
export function renderRHA(tipo, dur = 30, s = 7) {
  seed = s;
  const p = RHA[tipo], sr = 11025;
  const d = new Float32Array(Math.round(dur * sr));
  // fundo: ruído muito baixo (atrito do diafragma do estetoscópio, sala)
  for (let i = 0; i < d.length; i++) d[i] = noise() * 0.004;
  onePoleLP(d, 900, sr);
  const ev = [];
  let t = 0.4 + rnd() * 1.5;
  const mean = 60 / p.rate;
  while (t < dur - 0.5) {
    const longo = rnd() < p.longos;
    const a = p.amp * (0.5 + rnd() * 0.5);
    const len = longo ? addGurgle(d, sr, t, a, p) : addClick(d, sr, t, a);
    ev.push({ t, len, longo });
    // salvas nos hiperativos: intervalos curtos agrupados
    const burst = tipo === 'hiperativo' && rnd() < 0.5;
    t += len + (burst ? 0.15 + rnd() * 0.5 : -Math.log(1 - rnd()) * mean);
  }
  onePoleHP(d, 60, sr);
  return { data: normalize(d, 0.85), sr, events: ev };
}

/* ------------------------------------------------------------------------ */
/* Sopro abdominal esquemático                                                */
/* ------------------------------------------------------------------------ */
export function renderSopro(tipo = 'sistolico', dur = 8) {
  seed = 31;
  const sr = 11025, bpm = 72, T = 60 / bpm;
  const d = new Float32Array(Math.round(dur * sr));
  const x = new Float32Array(d.length);
  for (let i = 0; i < x.length; i++) x[i] = noise();
  onePoleHP(x, 180, sr); onePoleLP(x, 650, sr); onePoleLP(x, 650, sr);
  normalize(x, 1);
  for (let i = 0; i < d.length; i++) {
    const t = (i / sr) % T, u = t / T;
    let e = 0;
    if (u > 0.06 && u < 0.4) e = Math.sin(Math.PI * (u - 0.06) / 0.34) ** 1.4;
    if (tipo === 'continuo' && u >= 0.4) e = Math.max(e, 0.45 * Math.exp(-(u - 0.4) * 2.2));
    d[i] = x[i] * e * 0.8;
    // bulhas cardíacas transmitidas, baixas
    const b1 = Math.exp(-((u - 0.03) ** 2) / 0.00012), b2 = Math.exp(-((u - 0.42) ** 2) / 0.0001);
    d[i] += (b1 * 0.35 + b2 * 0.25) * Math.sin(2 * Math.PI * 55 * (i / sr));
  }
  return { data: normalize(d, 0.8), sr };
}
