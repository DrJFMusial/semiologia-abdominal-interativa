/**
 * Palpação.
 * tonus:       tensão da parede ao longo do tempo. A defesa VOLUNTÁRIA cede
 *              com manobras de relaxamento; a INVOLUNTÁRIA (rigidez) persiste
 *              porque é reflexa à irritação peritoneal. Modelo didático.
 * massaParede: manobra de elevar a cabeça (tensão dos retos). A massa da
 *              parede continua palpável; a intra-abdominal fica oculta.
 */
import { VB, base } from '../core/abdomen.js';
import { button, captureKeys, prefersReducedMotion } from '../core/ui.js';

const ESTADOS = {
  relaxado: { n: 'Abdome relaxado', t0: 0.15, cede: 1, loc: null, txt: 'Parede flácida, depressível, sem dor. É o ponto de partida para a palpação profunda.' },
  voluntaria: { n: 'Defesa voluntária', t0: 0.75, cede: 0.85, loc: null, txt: 'Contração por medo, frio, cócegas ou ansiedade. Cede com as manobras de relaxamento e na expiração. Não indica, por si, irritação peritoneal.' },
  rigidezFid: { n: 'Rigidez localizada (fossa ilíaca direita)', t0: 0.8, cede: 0.08, loc: [175, 410], txt: 'Contração reflexa, involuntária, sobre o peritônio inflamado. Persiste apesar das manobras e na expiração. Sugere irritação peritoneal localizada (por exemplo, apendicite).' },
  rigidezGen: { n: 'Rigidez generalizada ("abdome em tábua")', t0: 0.95, cede: 0.04, loc: 'all', txt: 'Rigidez difusa e persistente, com o paciente imóvel. Sugere peritonite generalizada, como na perfuração de víscera oca. Em idosos e imunossuprimidos pode ser discreta ou ausente.' },
};
const ACOES = [
  ['maos', 'Mãos aquecidas e unhas curtas'],
  ['conversa', 'Conversar e distrair'],
  ['joelhos', 'Fletir os joelhos'],
  ['expira', 'Palpar na expiração'],
  ['longe', 'Começar longe da dor'],
];

export function tonus(node) {
  node.classList.add('tn');
  node.innerHTML = `
    <div class="tn-ops" role="radiogroup" aria-label="Situação"></div>
    <div class="tn-main">
      <svg class="tn-svg" viewBox="${VB}" role="img" aria-label="Abdome com a área de tensão">${base({ retos: true })}<g class="tn-zone"></g><g class="tn-hand"><ellipse cx="0" cy="0" rx="46" ry="30"/><text y="5">mão</text></g></svg>
      <div class="tn-side">
        <div class="tn-face" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"/><circle class="ey" cx="42" cy="50" r="5"/><circle class="ey" cx="78" cy="50" r="5"/><path class="br" d=""/><path class="mo" d=""/></svg></div>
        <div class="tn-gauge"><canvas aria-label="Tensão da parede ao longo do tempo"></canvas><p class="tn-gl"><span>Tensão da parede</span><b class="tn-v"></b></p></div>
      </div>
    </div>
    <div class="tn-panel">
      <p class="tn-q">Manobras de relaxamento (marque e observe a curva):</p>
      <div class="tn-acts"></div>
      <div class="tn-card" aria-live="polite"></div>
      <p class="tn-note">Tradução: em inglês, <i>guarding</i> designa a defesa, voluntária ou involuntária; <i>rigidity</i> é a contração involuntária. Em português, "defesa" sem qualificação gera ambiguidade no registro: escreva "defesa voluntária, cede com relaxamento" ou "rigidez (defesa involuntária) em fossa ilíaca direita".</p>
    </div>`;
  const cv = node.querySelector('canvas');
  const zone = node.querySelector('.tn-zone');
  const hand = node.querySelector('.tn-hand');
  const card = node.querySelector('.tn-card');
  let est = 'voluntaria', on = new Set(), hist = [], raf = 0, t = 0, last = 0, running = false;
  const alvo = () => {
    const e = ESTADOS[est];
    const frac = on.size / ACOES.length;
    let v = e.t0 - (e.t0 - 0.15) * frac * e.cede;
    if (on.has('expira')) v -= 0.05 * e.cede;
    // começar longe da dor muda onde a mão está, e só ajuda se a dor for localizada
    return Math.max(0.1, Math.min(1, v));
  };
  let cur = alvo();
  const drawZone = () => {
    const e = ESTADOS[est];
    const longe = on.has('longe');
    const hx = e.loc && e.loc !== 'all' ? (longe ? 330 : 175) : 250;
    const hy = e.loc && e.loc !== 'all' ? (longe ? 250 : 410) : 330;
    hand.setAttribute('transform', `translate(${hx} ${hy})`);
    if (e.loc === 'all') zone.innerHTML = '<ellipse class="tz rig" cx="250" cy="360" rx="140" ry="200"/>';
    else if (e.loc) zone.innerHTML = `<ellipse class="tz rig" cx="${e.loc[0]}" cy="${e.loc[1]}" rx="56" ry="48"/>`;
    else zone.innerHTML = est === 'voluntaria' ? '<ellipse class="tz vol" cx="250" cy="360" rx="130" ry="190"/>' : '';
    const dolNaMao = e.loc === 'all' || (e.loc && !longe);
    const f = node.querySelector('.tn-face svg');
    const dor = dolNaMao ? 1 : est === 'voluntaria' ? 0.35 * (1 - on.size / 5) : 0;
    f.querySelector('.mo').setAttribute('d', `M38 ${84 + dor * 4} Q60 ${84 - 14 + dor * 26} 82 ${84 + dor * 4}`);
    f.querySelector('.br').setAttribute('d', `M32 ${38 - dor * 2} L52 ${38 + dor * 6} M88 ${38 - dor * 2} L68 ${38 + dor * 6}`);
    f.classList.toggle('pain', dor > 0.5);
    let txt = `<h4>${e.n}</h4><p>${e.txt}</p>`;
    if (e.loc && e.loc !== 'all') txt += `<p class="tn-hint">${longe ? 'A mão está longe da área dolorosa: comece por aí e só depois se aproxime. A rigidez continua lá.' : 'A mão está sobre a área dolorosa. Marque "Começar longe da dor".'}</p>`;
    card.innerHTML = txt;
  };
  const paint = () => {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(195,50,60,.08)'; g.fillRect(0, 0, w, h * 0.35);
    g.fillStyle = '#6b7d89'; g.font = '11px Inter, sans-serif';
    g.fillText('rígida', 6, 14); g.fillText('flácida', 6, h - 6);
    g.strokeStyle = '#0e5462'; g.lineWidth = 2.2; g.beginPath();
    hist.forEach((v, i) => { const x = (i / 239) * w, y = h - v * (h - 10) - 4; i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
    node.querySelector('.tn-v').textContent = cur > 0.6 ? 'alta' : cur > 0.35 ? 'moderada' : 'baixa';
  };
  const step = (ts) => {
    const dt = Math.min(0.1, (ts - last) / 1000 || 0); last = ts; t += dt;
    const insp = on.has('expira') ? 0 : 0.04 * Math.sin(t * 1.4);
    cur += (alvo() - cur) * Math.min(1, dt * 2.2);
    hist.push(Math.max(0, Math.min(1, cur + insp)));
    if (hist.length > 240) hist.shift();
    paint();
    if (running) raf = requestAnimationFrame(step);
  };
  const start = () => {
    if (running) return;
    if (prefersReducedMotion()) { cur = alvo(); hist = Array(240).fill(cur); paint(); return; }
    running = true; last = performance.now(); raf = requestAnimationFrame(step);
  };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const ops = node.querySelector('.tn-ops');
  Object.entries(ESTADOS).forEach(([k, e]) => {
    const b = button({ label: e.n, text: e.n, cls: 'chip', pressed: k === est });
    b.addEventListener('click', () => { est = k; on.clear(); acts.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', 'false')); ops.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); drawZone(); if (prefersReducedMotion()) start(); });
    ops.appendChild(b);
  });
  const acts = node.querySelector('.tn-acts');
  ACOES.forEach(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'chip', pressed: false });
    b.addEventListener('click', () => { on.has(k) ? on.delete(k) : on.add(k); b.setAttribute('aria-pressed', String(on.has(k))); drawZone(); if (prefersReducedMotion()) start(); });
    acts.appendChild(b);
  });
  hist = Array(240).fill(cur);
  drawZone();
  captureKeys(node, () => false);
  const ro = new ResizeObserver(paint); ro.observe(cv);
  return { activate: start, deactivate: stop, pause: stop };
}

/* ------------------------------------------------------------------------ */
const MASSAS = {
  parede: { n: 'Massa da parede (lipoma, hematoma do reto)', txt: 'Com a cabeça elevada e os retos contraídos, a massa continua palpável e às vezes fica mais evidente: está na parede, à frente do músculo.' },
  intra: { n: 'Massa intra-abdominal', txt: 'Com os retos contraídos, a massa deixa de ser palpada ou fica menos nítida: está atrás do músculo, dentro da cavidade.' },
};
export function massaParede(node) {
  node.classList.add('mp');
  node.innerHTML = `
    <div class="mp-ops" role="radiogroup" aria-label="Tipo de massa"></div>
    <svg class="mp-svg" viewBox="0 0 520 300" role="img" aria-label="Corte sagital da parede abdominal com o paciente deitado">
      <path class="mp-bed" d="M0 270 H520"/>
      <g class="mp-head"><circle cx="70" cy="200" r="34"/></g>
      <path class="mp-cav" d="M110 250 C150 160 420 160 470 250 Z"/>
      <path class="mp-musc" d="M110 236 C160 164 410 164 470 236"/>
      <path class="mp-skin" d="M104 232 C156 126 414 126 476 232"/>
      <g class="mp-mass"></g>
      <g class="mp-hand"><path d="M250 118 C270 112 310 112 330 122 L330 140 C306 146 272 146 250 140 Z"/></g>
      <text class="mp-l" x="380" y="122">pele</text><text class="mp-l" x="420" y="190">músculo reto</text><text class="mp-l" x="300" y="226">cavidade</text>
    </svg>
    <div class="mp-tools"></div>
    <div class="mp-card" aria-live="polite"></div>`;
  const mass = node.querySelector('.mp-mass');
  const musc = node.querySelector('.mp-musc');
  const head = node.querySelector('.mp-head');
  const card = node.querySelector('.mp-card');
  let tipo = 'parede', elev = false;
  const draw = () => {
    musc.classList.toggle('tens', elev);
    head.setAttribute('transform', elev ? 'rotate(-28 110 236) translate(0 -14)' : '');
    mass.innerHTML = tipo === 'parede'
      ? '<ellipse class="mm" cx="290" cy="166" rx="34" ry="8"/>'
      : '<ellipse class="mm in" cx="290" cy="214" rx="44" ry="20"/>';
    const palp = tipo === 'parede' || !elev;
    node.querySelector('.mp-hand').classList.toggle('feel', palp);
    const m = MASSAS[tipo];
    card.innerHTML = `<h4>${m.n}</h4><p>${elev ? m.txt : 'Paciente relaxado: as duas massas podem ser palpadas. Peça que eleve a cabeça (ou os ombros) do travesseiro.'}</p><p class="mp-r"><b>${palp ? 'Palpável' : 'Não palpável'}</b> com a cabeça ${elev ? 'elevada' : 'apoiada'}.</p>`;
  };
  const ops = node.querySelector('.mp-ops');
  Object.entries(MASSAS).forEach(([k, m]) => {
    const b = button({ label: m.n, text: m.n, cls: 'chip', pressed: k === tipo });
    b.addEventListener('click', () => { tipo = k; ops.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    ops.appendChild(b);
  });
  const bE = button({ label: 'Elevar a cabeça', text: 'Elevar a cabeça', cls: 'primary', pressed: false });
  bE.addEventListener('click', () => { elev = !elev; bE.setAttribute('aria-pressed', String(elev)); bE.querySelector('span').textContent = elev ? 'Relaxar' : 'Elevar a cabeça'; draw(); });
  node.querySelector('.mp-tools').appendChild(bE);
  draw();
  return {};
}
