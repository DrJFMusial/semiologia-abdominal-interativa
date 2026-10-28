/**
 * Laboratório da ascite (componente principal da aula).
 * Corte axial visto dos pés (direita do paciente à esquerda da tela): o
 * líquido livre ocupa a parte declive, as alças com gás flutuam presas ao
 * mesentério, e a mudança de decúbito move a fronteira. Volume pequeno não
 * produz sinais (grau 1 de ABD). O piparote depende do volume e do bloqueio
 * da parede. Modelo geométrico simples: nível horizontal, sem viscosidade;
 * nenhum volume em mililitros é exibido, porque as fontes não dão o limiar.
 */
import { VB, base } from '../core/abdomen.js';
import { PERCUSSAO, renderPercussao } from '../core/synth.js';
import { toBuffer, playOneShot } from '../core/audio.js';
import { button, captureKeys, prefersReducedMotion } from '../core/ui.js';

const A = 150, B = 110, CA = 134, CB = 94; // corpo e cavidade (semieixos)
const VOL = { 0: ['Nenhum', 0], 1: ['Pequeno', 0.08], 2: ['Moderado', 0.3], 3: ['Grande', 0.56] };
const DEC = { dorsal: ['Decúbito dorsal', 0], direito: ['Decúbito lateral direito', -90], esquerdo: ['Decúbito lateral esquerdo', 90] };
const COND = {
  ascite: 'Ascite',
  obeso: 'Obesidade, sem líquido',
  gas: 'Distensão gasosa',
  cisto: 'Cisto gigante de ovário',
};
const PONTOS = { fd: [-138, 42, 'flanco direito'], fe: [138, 42, 'flanco esquerdo'], ant: [0, -108, 'face anterior, perto do umbigo'] };

const bufs = {};
const tocar = (k) => { if (!bufs[k]) { const r = renderPercussao(k); bufs[k] = toBuffer(r.data, r.sr); } playOneShot(bufs[k]); };
const rot = ([x, y], th) => { const c = Math.cos(th), s = Math.sin(th); return [x * c - y * s, x * s + y * c]; };

/** Largura da cavidade (elipse girada) na altura y do mundo. */
function largura(y, th) {
  const c = Math.cos(th), s = Math.sin(th);
  const a2 = CA * CA, b2 = CB * CB;
  const AA = c * c / a2 + s * s / b2, BB = 2 * s * c * (1 / a2 - 1 / b2), CC = s * s / a2 + c * c / b2;
  const disc = (BB * y) ** 2 - 4 * AA * (CC * y * y - 1);
  if (disc <= 0) return null;
  const r = Math.sqrt(disc);
  return [(-BB * y - r) / (2 * AA), (-BB * y + r) / (2 * AA)];
}
const meiaAltura = (th) => Math.sqrt((CA * Math.sin(th)) ** 2 + (CB * Math.cos(th)) ** 2);
function nivel(f, th) {
  if (f <= 0) return Infinity;
  const h = meiaAltura(th);
  const area = (L) => { let s = 0; const n = 120; for (let i = 0; i < n; i++) { const y = L + ((h - L) * (i + 0.5)) / n; const w = largura(y, th); if (w) s += (w[1] - w[0]) * ((h - L) / n); } return s; };
  const tot = Math.PI * CA * CB;
  let lo = -h, hi = h;
  for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (area(m) / tot > f) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** Alças com gás: empacotadas de cima para baixo acima do nível do líquido. */
function alcas(L, th, cond) {
  const h = meiaAltura(th), N = 11;
  let r = 19;
  if (cond === 'cisto') {
    // o cisto ocupa o centro anterior; alças empurradas para flancos e dorso
    return [[-108, 10], [-96, 50], [-60, 76], [60, 76], [96, 50], [108, 10], [-112, -30], [112, -30]].map((p) => [...rot(p, th), 17]);
  }
  for (let tent = 0; tent < 6; tent++) {
    const out = [];
    for (let y = -h + r + 2; y < Math.min(h - r, L - r * 0.6) && out.length < N; y += r * 1.75) {
      const w = largura(y, th); if (!w) continue;
      const n = Math.max(0, Math.floor((w[1] - w[0] - 2 * r) / (r * 2.05)) + 1);
      const x0 = (w[0] + w[1]) / 2 - ((n - 1) * r * 2.05) / 2;
      for (let i = 0; i < n && out.length < N; i++) out.push([x0 + i * r * 2.05, y, r]);
    }
    if (out.length >= N || r < 11) return out;
    r -= 2;
  }
  return [];
}

export function ascite(node) {
  node.classList.add('as');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="as-ctrl">
      <div class="as-row"><span class="as-l">Situação</span><div class="as-cond" role="radiogroup"></div></div>
      <div class="as-row as-volrow"><span class="as-l">Volume de líquido</span><div class="as-vol" role="radiogroup"></div></div>
      <div class="as-row"><span class="as-l">Posição</span><div class="as-dec" role="radiogroup"></div></div>
    </div>
    <div class="as-stage">
      <figure class="as-ax"><svg viewBox="-200 -190 400 380" role="img" aria-label="Corte axial do abdome visto dos pés">
        <defs><clipPath id="as-clip"><ellipse class="as-cavc" rx="${CA}" ry="${CB}"/></clipPath></defs>
        <g class="as-world"></g>
        <path class="as-table" d="M-200 172 H200"/>
        <text class="as-cap" x="-196" y="-174">visto dos pés · direita do paciente à esquerda</text>
      </svg><figcaption class="as-fc">Corte axial</figcaption></figure>
      <figure class="as-fr"><svg viewBox="${VB}" role="group" aria-label="Abdome visto de frente, em decúbito dorsal">${base({ marcos: false })}<g class="as-front"></g></svg><figcaption>De frente, em decúbito dorsal: linhas de transição (semicírculos de Skoda)</figcaption></figure>
    </div>
    <div class="as-panel">
      <figure class="as-photo"><img alt="" loading="lazy"><figcaption></figcaption></figure>
      <div class="as-acts"></div>
      <div class="as-res" aria-live="polite"></div>
      <details class="as-ev"><summary>Evidência e limites</summary>
        <table class="as-tab"><thead><tr><th>Sinal</th><th>Sens.</th><th>Espec.</th><th>RV+</th></tr></thead><tbody>
        <tr><td>Flancos abaulados</td><td>81%</td><td>59%</td><td>2,0</td></tr><tr><td>Macicez nos flancos</td><td>84%</td><td>59%</td><td>2,0</td></tr>
        <tr><td>Macicez móvel</td><td>86%</td><td>72%</td><td>2,7</td></tr><tr><td>Onda líquida evidente</td><td>62%</td><td>90%</td><td>6,0</td></tr></tbody></table>
        <p>Dados agrupados (Swartz, Tabela 17.4). Swartz: macicez móvel é o sinal mais sensível e a onda líquida, o mais específico. ABD: macicez móvel é o mais sensível, específico e reprodutível. Bates: onda líquida, macicez móvel e edema juntos tornam a ascite 3 a 6 vezes mais provável, mas "ambos os sinais podem enganar".</p>
        <p class="tag div">Fontes divergem na leitura</p>
      </details>
      <span class="tag esq">Sons sintetizados esquemáticos · modelo geométrico simplificado</span>
    </div>`;
  const IMG = (n) => (window.__img && window.__img[n]) || '';
  const FOTO = {
    dorsal: ['ab14a-macicez-movel-dorsal.webp', 'Macicez móvel, posição dorsal: homem com abdome muito distendido deitado de costas na maca, visto de lado', 'Paciente com distensão abdominal em decúbito dorsal. Ilustra só a posição: a percussão e sua interpretação estão no simulador.'],
    esquerdo: ['ab14b-macicez-movel-lateral.webp', 'Macicez móvel, mudança de posição: o mesmo paciente deitado de lado, com o tórax e o abdome voltados para quem olha', 'Mesmo paciente em decúbito lateral, com o lado esquerdo apoiado na maca (decúbito lateral esquerdo). Ilustra só a mudança de posição; não demonstra a percussão.'],
    piparote: ['ab15-piparote-preparacao.webp', 'Piparote, preparação: borda da mão do paciente na linha média do abdome distendido e mãos do examinador nos flancos, vista de cima', 'Preparação do piparote com bloqueio: borda ulnar da mão do paciente na linha média e mãos do examinador nos flancos. Mostra a montagem; o golpe e a transmissão da onda estão no esquema ao lado.'],
  };
  const photo = (k) => {
    const fig = node.querySelector('.as-photo'), im = fig.querySelector('img'), cap = fig.querySelector('figcaption');
    const f = FOTO[k];
    if (!f) { fig.classList.add('vazio'); im.removeAttribute('src'); im.alt = ''; cap.textContent = 'Sem ilustração fotográfica para o decúbito lateral direito nesta versão; o corte axial mostra a posição.'; return; }
    fig.classList.remove('vazio'); im.src = IMG(f[0]); im.alt = f[1]; cap.textContent = f[2];
  };
  const world = node.querySelector('.as-world'), front = node.querySelector('.as-front'), res = node.querySelector('.as-res');
  const st = { cond: 'ascite', vol: 2, dec: 'dorsal', th: 0, bloqueio: true, onda: -1 };
  let anim = 0, waveRaf = 0;
  const f = () => (st.cond === 'ascite' ? VOL[st.vol][1] : 0);
  const somEm = (k) => {
    const [bx, by] = PONTOS[k];
    const [x, y] = rot([bx, by], st.th);
    if (st.cond === 'cisto') return k === 'ant' && st.dec === 'dorsal' ? 'macico' : 'timpanico';
    if (st.cond === 'gas') return 'hiper';
    const L = nivel(f(), st.th);
    if (y > L + 10) return 'macico';
    if (y > L - 12) return 'submacico';
    return 'timpanico';
  };
  function draw() {
    const th = (st.th * Math.PI) / 180;
    const L = nivel(f(), th);
    const loops = alcas(L, th, st.cond);
    const root = rot([0, 46], th);
    const gord = st.cond === 'obeso' ? 30 : 12;
    const spine = rot([0, 92], th);
    const cyst = st.cond === 'cisto' ? `<ellipse class="as-cyst" cx="${rot([0, -20], th)[0]}" cy="${rot([0, -20], th)[1]}" rx="${84}" ry="${66}" transform="rotate(${st.th} ${rot([0, -20], th)[0]} ${rot([0, -20], th)[1]})"/>` : '';
    const pts = Object.entries(PONTOS).map(([k, [bx, by]]) => { const [x, y] = rot([bx, by], th); return `<g class="as-pt" data-k="${k}" tabindex="0" role="button" aria-label="Percutir o ${PONTOS[k][2]}"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 4}">${k === 'fd' ? 'D' : k === 'fe' ? 'E' : 'A'}</text></g>`; }).join('');
    const waveTxt = st.onda >= 0 ? onda(th, L) : '';
    world.innerHTML = `
      <g transform="rotate(${st.th})">
        <ellipse class="as-fat" rx="${A + gord - 12}" ry="${B + gord - 12}"/>
        <ellipse class="as-wall" rx="${CA + 6}" ry="${CB + 6}"/>
        <ellipse class="as-cav" rx="${CA}" ry="${CB}"/>
        <path class="as-sp" d="M-26 88 C-20 72 20 72 26 88 C30 104 -30 104 -26 88 Z"/>
      </g>
      ${Number.isFinite(L) ? `<g clip-path="url(#as-clip-w)"><rect class="as-liq" x="-200" y="${L}" width="400" height="400"/></g>` : ''}
      ${cyst}
      <g class="as-mes">${loops.map(([x, y]) => `<path d="M${root[0]} ${root[1]} L${x} ${y}"/>`).join('')}</g>
      <g class="as-loops">${loops.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
      ${Number.isFinite(L) ? `<path class="as-lvl" d="M-190 ${L} H190"/>` : ''}
      ${st.bloqueio && st.onda >= 0 ? `<path class="as-block" d="M${rot([0, -118], th)[0] - 4} ${rot([0, -118], th)[1] - 18} v26 M${rot([0, -118], th)[0] + 4} ${rot([0, -118], th)[1] - 18} v26"/>` : ''}
      ${waveTxt}${pts}`;
    // clipPath no referencial do mundo (girado)
    let cp = node.querySelector('#as-clip-w');
    if (!cp) { cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'); cp.id = 'as-clip-w'; node.querySelector('.as-ax defs').appendChild(cp); }
    cp.innerHTML = `<ellipse rx="${CA}" ry="${CB}" transform="rotate(${st.th})"/>`;
    world.querySelectorAll('.as-pt').forEach((g) => g.addEventListener('click', () => percutir(g.dataset.k)));
    drawFront();
    node.querySelector('.as-volrow').hidden = st.cond !== 'ascite';
  }
  function onda(th, L) {
    const u = st.onda; // 0 a 1
    const temLiq = Number.isFinite(L) && f() >= 0.3;
    const xs = -CA + u * 2 * CA;
    let s = '';
    if (temLiq) s += `<path class="as-wave" d="M${xs} ${Math.max(L, -60)} q 10 40 0 ${Math.max(20, CB - Math.max(L, -60))}"/>`;
    if (!st.bloqueio) s += `<path class="as-wave wall" d="M${xs} ${-CB - 10} q 8 -6 16 0"/>`;
    return `<g class="as-waves">${s}</g><circle class="as-flick" cx="${-CA - 14}" cy="30" r="9"/><rect class="as-palm" x="${CA + 4}" y="0" width="14" height="60" rx="6"/>`;
  }
  function drawFront() {
    if (st.dec !== 'dorsal') { front.innerHTML = '<text class="as-note" x="250" y="320">vista frontal só em decúbito dorsal</text>'; return; }
    let s = '';
    if (st.cond === 'ascite' && st.vol >= 2) {
      const r0 = st.vol === 3 ? 100 : 160;
      [0, 14, 28].forEach((dr, i) => { const r = r0 + dr; s += `<path class="as-skoda s${i}" d="M${250 - r} ${335 - r * 0.25} A ${r} ${r} 0 0 0 ${250 + r} ${335 - r * 0.25}"/>`; });
      s += `<text class="as-zt" x="250" y="300">timpanismo</text><text class="as-zt d" x="250" y="${Math.min(600, 335 + r0 + 40)}">macicez</text><text class="as-zt d" x="120" y="300">macicez</text><text class="as-zt d" x="380" y="300">macicez</text>`;
    } else if (st.cond === 'cisto') {
      const r = 120;
      s += `<path class="as-skoda s0" d="M${250 - r} ${560} A ${r} ${r} 0 0 1 ${250 + r} ${560}"/><text class="as-zt d" x="250" y="500">macicez</text><text class="as-zt" x="120" y="320">timpanismo</text><text class="as-zt" x="380" y="320">timpanismo</text>`;
    } else {
      s += `<text class="as-zt" x="250" y="380">${st.cond === 'gas' ? 'hipertimpanismo difuso' : st.cond === 'obeso' ? 'timpanismo, parede espessa' : st.vol === 1 ? 'timpanismo: líquido pequeno não aparece' : 'timpanismo'}</text>`;
    }
    front.innerHTML = s;
  }
  function percutir(k) {
    const s = somEm(k);
    tocar(s);
    res.innerHTML = `<p class="as-where">${PONTOS[k][2]} · ${DEC[st.dec][0].toLowerCase()}</p><p class="pc-name ${s}">${PERCUSSAO[s].nome}</p>${interpret(k, s)}`;
  }
  function interpret(k, s) {
    if (st.cond === 'ascite' && st.vol === 1) return '<p>Com volume pequeno o líquido fica nas partes mais declives (pelve e goteiras posteriores) e não chega aos pontos percutidos: o exame pode ser normal. ABD chama isso de grau 1, diagnosticado só por ultrassonografia.</p>';
    if (st.cond === 'ascite' && k === 'fe' && st.dec === 'direito' && s === 'timpanico' && st.vol >= 2) return '<p><b>A macicez se moveu.</b> No decúbito lateral direito o líquido desceu para o lado direito e as alças com gás subiram para o flanco esquerdo, que agora é o ponto mais alto. É a macicez móvel.</p>';
    if (st.cond === 'ascite' && k === 'fd' && st.dec === 'esquerdo' && s === 'timpanico' && st.vol >= 2) return '<p><b>A macicez se moveu.</b> No decúbito lateral esquerdo o líquido desceu para o lado esquerdo e as alças com gás subiram para o flanco direito, agora o ponto mais alto. É a mesma macicez móvel, pesquisada pelo outro lado.</p>';
    if (st.cond === 'cisto') return '<p>No cisto a macicez é central e o timpanismo fica nos flancos, onde estão as alças empurradas; a transição tem concavidade para o púbis (ABD) e não muda com o decúbito.</p>';
    if (st.cond === 'obeso') return '<p>Parede espessa abafa o som, mas os flancos continuam timpânicos e nada muda com o decúbito.</p>';
    return '';
  }
  function decubito(k) {
    st.dec = k;
    photo(k);
    const alvo = DEC[k][1], ini = st.th, t0 = performance.now();
    cancelAnimationFrame(anim);
    const dur = prefersReducedMotion() ? 1 : 1600;
    const step = (now) => { const u = Math.min(1, (now - t0) / dur); st.th = ini + (alvo - ini) * (1 - Math.cos(Math.PI * u)) / 2; draw(); if (u < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
    res.innerHTML = k === 'dorsal' ? '<p>Decúbito dorsal.</p>' : `<p>${DEC[k][0]}. Mantenha o dedo plessímetro no mesmo ponto e espere alguns instantes: o líquido precisa de tempo para se redistribuir.</p>`;
  }
  function piparote() {
    if (st.dec !== 'dorsal') { res.innerHTML = '<p>O piparote é pesquisado em decúbito dorsal.</p>'; return; }
    cancelAnimationFrame(waveRaf);
    photo('piparote');
    const t0 = performance.now();
    const step = (now) => { st.onda = Math.min(1, (now - t0) / 1300); draw(); if (st.onda < 1) waveRaf = requestAnimationFrame(step); else { setTimeout(() => { st.onda = -1; draw(); }, 600); resultado(); } };
    waveRaf = requestAnimationFrame(step);
  }
  function resultado() {
    const fl = f();
    let pos, txt;
    if (st.cond === 'ascite' && fl >= 0.5) { pos = true; txt = 'A onda atravessa o líquido e chega à palma no flanco oposto: piparote positivo. É próprio das ascites de grande volume (ABD).'; }
    else if (st.cond === 'ascite' && fl >= 0.25) { pos = false; txt = 'Onda fraca, em geral não percebida: o sinal costuma ser negativo até a ascite ser evidente (Bates).'; }
    else if (!st.bloqueio && (st.cond === 'obeso' || st.cond === 'gas')) { pos = true; txt = 'Sem o bloqueio, o abalo passou pela gordura da parede e chegou à palma: falso positivo. Por isso se pede ao paciente ou a um assistente que comprima a linha média com a borda das mãos (Bates, Swartz, ABD).'; }
    else { pos = false; txt = 'Nenhum abalo chega ao flanco oposto.'; }
    res.innerHTML = `<p class="pc-name ${pos ? 'macico' : 'timpanico'}">Piparote ${pos ? 'positivo' : 'negativo'}</p><p>${txt}</p>${st.bloqueio ? '' : '<p><b>Sem bloqueio da linha média.</b></p>'}`;
  }
  const seg = (host, entries, cur, on) => entries.map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: k === cur });
    b.addEventListener('click', () => { host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); on(k); });
    host.appendChild(b); return b;
  });
  seg(node.querySelector('.as-cond'), Object.entries(COND), st.cond, (k) => { st.cond = k; res.innerHTML = ''; draw(); });
  seg(node.querySelector('.as-vol'), Object.entries(VOL).map(([k, v]) => [k, v[0]]), String(st.vol), (k) => { st.vol = Number(k); res.innerHTML = ''; draw(); });
  seg(node.querySelector('.as-dec'), Object.entries(DEC).map(([k, v]) => [k, v[0]]), st.dec, decubito);
  const acts = node.querySelector('.as-acts');
  const bFE = button({ label: 'Percutir o flanco esquerdo', text: 'Percutir flanco E', cls: 'ghost' });
  const bFD = button({ label: 'Percutir o flanco direito', text: 'Percutir flanco D', cls: 'ghost' });
  const bAnt = button({ label: 'Percutir perto do umbigo', text: 'Percutir centro', cls: 'ghost' });
  const bPip = button({ label: 'Piparote', text: 'Piparote', cls: 'primary' });
  const bBlk = button({ label: 'Bloqueio da linha média pela mão do paciente', text: 'Bloqueio da linha média', cls: 'chip', pressed: true });
  bFE.addEventListener('click', () => percutir('fe')); bFD.addEventListener('click', () => percutir('fd')); bAnt.addEventListener('click', () => percutir('ant'));
  bPip.addEventListener('click', piparote);
  bBlk.addEventListener('click', () => { st.bloqueio = !st.bloqueio; bBlk.setAttribute('aria-pressed', String(st.bloqueio)); });
  acts.append(bFE, bAnt, bFD, bPip, bBlk);
  res.innerHTML = '<p><b>Macicez móvel (ABD):</b> percuta o flanco esquerdo em decúbito dorsal; mantenha o dedo no lugar; vire o paciente para o decúbito lateral direito; percuta de novo o mesmo ponto.</p>';
  captureKeys(node, (e) => { const g = e.target.closest?.('.as-pt'); if (g && (e.key === 'Enter' || e.key === ' ')) { g.dispatchEvent(new Event('click')); return true; } return false; });
  photo('dorsal');
  draw();
  const stopAll = () => { cancelAnimationFrame(anim); cancelAnimationFrame(waveRaf); };
  return { deactivate: stopAll, pause: stopAll };
}
