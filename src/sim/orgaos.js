/**
 * Exploradores de órgãos (palpação dirigida).
 * orgao:    fígado, baço ou rins e aorta (data-orgao). A mão é posicionada na
 *           linha de busca e o paciente inspira: a borda desce e toca, ou não,
 *           as pontas dos dedos. Ensina por que se começa BAIXO.
 * murphy:   par de ilustrações (expiração e inspiração) e corte sagital: a
 *           vesícula inflamada desce, encontra os dedos e a inspiração para.
 * apendice: McBurney, Blumberg, Rovsing, psoas e obturador, com o peso de cada
 *           um. Nenhum sinal isolado confirma apendicite.
 * Esquemas didáticos; distâncias aproximadas (10 px = 1 cm).
 */
import { VB, base, ORGAOS } from '../core/abdomen.js';
import { button, captureKeys, prefersReducedMotion } from '../core/ui.js';

const img = (n) => (window.__img && window.__img[n]) || '';
const fig = (n, alt, cap) => `<figure class="og-img"><img src="${img(n)}" alt="${alt}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
/** Uma ou mais figuras (lista de [arquivo, alt, legenda]); duas ficam lado a lado, na mesma escala. */
const figs = (T) => { const l = T.imgs || (T.img ? [T.img] : []); return l.length ? `<div class="og-imgs n${l.length}">${l.map((x) => fig(...x)).join('')}</div>` : ''; };

/* ---------- configuração por órgão ---------- */
const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
const CFG = {
  figado: {
    titulo: 'Fígado', A: [168, 480], B: [168, 200], margem: 0.964, // rebordo na LHC direita (~y 210)
    conds: { normal: ['Normal', 0.93], hepatomeg: ['Hepatomegalia', 0.66] }, ds: 0.093, med: 'abaixo do rebordo costal direito, na linha hemiclavicular',
    tecs: {
      bimanual: { n: 'Bimanual (Bates)', sim: true, passos: ['Mão esquerda sob o tórax posterior direito, na altura da 11ª e 12ª costelas, empurrando o fígado para frente.', 'Mão direita no quadrante superior direito, lateral ao músculo reto, com as pontas dos dedos abaixo do limite inferior da macicez.', 'Pedir inspiração profunda: a borda desce e toca as pontas dos dedos. Pressão suave, sem empurrar para dentro com força.', 'Se não sentir, subir a mão 1 a 2 cm e repetir.'], dica: 'Comece baixo. Com a mão já sobre um fígado aumentado, a borda passa despercebida e a hepatomegalia vira "fígado não palpável".', imgs: [
        ['ab07-figado-bimanual.webp', 'Fígado, palpação bimanual vista de cima: mão anterior do examinador no hipocôndrio direito e mão de apoio sob as últimas costelas direitas', 'Mão anterior no hipocôndrio direito e apoio posterior sob as últimas costelas.'],
        ['ab23-figado-inicio-inferior.webp', 'Fígado, início da busca: mão do examinador no hemiabdome direito, abaixo do rebordo costal, vista de cima', 'Início inferior ao rebordo. Ilustração parcial: não fixa uma altura de início válida para todos nem mostra a borda de um fígado aumentado; a linha de busca está no esquema.'],
      ] },
      garra: { n: 'Em garra (Mathieu)', sim: true, img: ['ab08-figado-garra.webp', 'Examinadora à direita do paciente, voltada para os pés dele, com as mãos sobre o hipocôndrio direito; as mãos não estão em garra', 'Uso limitado: a figura mostra só a posição do examinador; as mãos não estão em garra. Na técnica, os dedos ficam fletidos, enganchados abaixo do rebordo, e a borda vem ao encontro deles na inspiração.'], passos: ['Examinador à direita do paciente, voltado para os pés dele.', 'Dedos das duas mãos fletidos em garra, logo abaixo do rebordo costal direito.', 'Pedir inspiração profunda e sentir a borda deslizar sob os dedos.'], dica: 'Útil quando a parede é espessa. Também aqui convém começar mais baixo se houver suspeita de hepatomegalia.' },
      descrever: { n: 'O que descrever', passos: ['Distância da borda ao rebordo, em centímetros, na linha hemiclavicular (e, se útil, no epigástrio).', 'Borda: fina ou romba. Superfície: lisa ou nodular. Consistência: elástica, firme ou endurecida.', 'Sensibilidade à palpação.', 'Confronto com a hepatimetria por percussão: borda palpável abaixo do rebordo não é, sozinha, hepatomegalia, porque o fígado pode estar rebaixado (por exemplo, por hiperinsuflação pulmonar).'], dica: 'Fígado palpável não é sinônimo de fígado aumentado; meça a extensão total antes de concluir.' },
      rechaco: { n: 'Rechaço (ascite volumosa)', passos: ['Com muito líquido, a palpação comum não alcança a borda.', 'Golpes curtos e rápidos com os dedos estendidos deslocam o líquido; o órgão volta e bate contra os dedos.', 'A mesma manobra serve para baço e massas em ascite.'], dica: 'É manobra de exceção: use quando a ascite impede a palpação habitual.' },
    },
  },
  baco: {
    titulo: 'Baço', A: [176, 486], B: [372, 252], margem: 0.985,
    conds: { normal: ['Normal', 1.2], espleno: ['Esplenomegalia', 0.65] }, ds: 0.1, med: 'abaixo do rebordo costal esquerdo, na direção da cicatriz umbilical',
    tecs: {
      dorsal: { n: 'Decúbito dorsal (Bates)', sim: true, passos: ['Examinador à direita do paciente. Mão esquerda sob o rebordo costal esquerdo, por trás, trazendo o baço para frente.', 'Mão direita abaixo do rebordo esquerdo. Com suspeita de baço grande, começar baixo, na fossa ilíaca direita ou perto do umbigo, e subir ao longo da diagonal.', 'Pedir inspiração profunda e sentir a ponta do baço.'], dica: 'O baço cresce para baixo e para a direita, na diagonal: a linha de busca não é vertical.', img: ['ab10-baco-decubito-dorsal.webp', 'Baço, palpação em decúbito dorsal vista de cima: mão de apoio sob o hemitórax esquerdo e mão anterior oblíqua no hemiabdome esquerdo', 'Apoio posterior no hemitórax esquerdo e mão anterior oblíqua no hemiabdome esquerdo. Na figura o examinador está do lado esquerdo do paciente; Bates descreve o examinador à direita.'] },
      schuster: { n: 'Posição de Schuster', passos: ['Paciente em posição intermediária entre o decúbito dorsal e o lateral direito, perna direita estendida, perna esquerda fletida com o joelho tocando a mesa (ABD).', 'A posição desloca o baço em direção ao rebordo costal.', 'Mesma técnica: mão sob o rebordo esquerdo, palpação na inspiração.'], dica: 'Repita em Schuster quando o decúbito dorsal for negativo e a suspeita persistir.', img: ['ab11-schuster-posicionamento.webp', 'Posição de Schuster: paciente vestido, deitado de lado sobre o lado direito, braço esquerdo elevado sobre a cabeça, perna direita estendida e esquerda fletida', 'Braço esquerdo elevado, perna direita estendida e esquerda fletida, com paciente apoiado. Ilustração de posicionamento com roupa: não demonstra a exposição para o exame, a palpação nem a percussão.'] },
      descrever: { n: 'O que descrever', passos: ['Distância da ponta ao rebordo costal esquerdo, em centímetros, ao longo da diagonal.', 'Consistência, superfície, sensibilidade e a presença de incisura na borda medial, que ajuda a distinguir baço de rim aumentado.', 'Confronto com a percussão do espaço de Traube e o sinal de Castell.'], dica: 'Cerca de 5% dos adultos normais têm a ponta do baço palpável (Bates); baço palpável pede investigação, mas não define causa.' },
    },
  },
  rins: {
    titulo: 'Rins e aorta', A: [188, 440], B: [188, 300], margem: null,
    conds: { normal: ['Magro, rim normal', 0.54], aumentado: ['Rim aumentado', 0.12] }, ds: 0.11, med: '',
    tecs: {
      bimanual: { n: 'Rim: bimanual', sim: true, passos: ['Mão esquerda sob o flanco direito, entre o rebordo e a crista ilíaca, levantando o rim.', 'Mão direita no quadrante superior direito, lateral e paralela ao reto.', 'Inspiração profunda: em pessoas magras o polo inferior do rim direito pode ser sentido.', 'Para o rim esquerdo, o examinador passa para o lado esquerdo do paciente.'], dica: 'Rim normal costuma não ser palpável, sobretudo o esquerdo. Massa no flanco que se move com a respiração e é "rechaçada" entre as mãos sugere origem renal.', img: ['ab12-rim-direito-bimanual.webp', 'Rim direito, palpação bimanual vista de cima: mão anterior no lado direito do abdome e mão de apoio sob o flanco direito', 'Mão anterior no lado direito do abdome e apoio posterior no flanco e na região lombar.'] },
      punho: { n: 'Punho-percussão lombar', imgs: [
        ['ab13a-punho-percussao.webp', 'Punho-percussão indireta, lado direito: paciente sentado de costas; a examinadora apoia a mão espalmada sobre o ângulo costovertebral direito e mantém o punho fechado sobre ela', 'Variante indireta, lado direito: mão de apoio espalmada sobre o ângulo costovertebral, punho fechado sobre o dorso dela.'],
        ['ab13b-punho-percussao-contato.webp', 'Punho-percussão indireta, lado esquerdo: face ulnar do punho da examinadora em contato com o dorso da mão de apoio sobre o ângulo costovertebral esquerdo', 'Variante indireta, lado esquerdo: face ulnar do punho sobre o dorso da mão de apoio. Compare os dois lados.'],
      ], passos: ['Paciente sentado, de costas. A pressão com as pontas dos dedos pode bastar para provocar dor; se não, percutir (Bates).', '<b>Indireta</b> (Bates, figuras): mão de apoio espalmada sobre o ângulo costovertebral; a face ulnar do punho golpeia o dorso dela. <b>Direta</b> (Swartz): o punho golpeia de leve a própria pele. <b>Giordano</b> (ABD): borda ulnar da mão, dedos estendidos, sem apoio.', 'Abalo perceptível e indolor em pessoa saudável; um lado e depois o outro, comparando.', 'Dor sugere comprometimento renal (pielonefrite, obstrução), sobretudo com febre e disúria, mas também aparece em afecções musculoesqueléticas.'], dica: 'No Brasil as três variantes costumam ser chamadas de "sinal de Giordano". Registre a manobra e o lado: "punho-percussão indireta dolorosa à direita, indolor à esquerda".' },
      aorta: { n: 'Aorta', aorta: true, passos: ['Palpação profunda no epigástrio, levemente à esquerda da linha média.', 'Com uma mão de cada lado, estimar a largura da pulsação.', 'Pulsação que afasta os dedos lateralmente é expansível; pulsação que só empurra os dedos para cima é transmitida por algo que está sobre a aorta.'], dica: 'Acima de 50 anos, largura de 3 cm ou mais ou pulsação expansível levanta suspeita de aneurisma (Bates). A palpação negativa não exclui aneurisma, e a parede espessa reduz a sensibilidade: a confirmação é por imagem.', img: ['ab22-palpacao-aorta.webp', 'Aorta, posição das mãos vista de cima: duas mãos no epigástrio, uma de cada lado da linha média, com uma faixa de pele entre os dedos', 'Mãos separadas no epigástrio, com faixa de pele entre os dedos. A figura mostra a posição das mãos; não representa a medida real da largura da aorta.'] },
    },
  },
};

export function orgao(node) {
  const k = node.dataset.orgao || 'figado';
  const c = CFG[k];
  node.classList.add('og');
  node.innerHTML = `
    <div class="og-tabs" role="radiogroup" aria-label="Técnica"></div>
    <div class="og-fig">
      <svg class="og-svg" viewBox="${VB}" role="img" aria-label="${c.titulo}: posição da mão e da borda do órgão">${base()}<g class="og-org"></g><path class="og-line"/><g class="og-hand"><path d="M-36 -10 C-30 -24 30 -24 36 -10 L36 8 C20 14 -20 14 -36 8 Z"/><path class="tips" d="M-30 -14 H30"/></g><g class="og-aorta" style="display:none"></g></svg>
      <div class="og-ctl">
        <div class="og-conds" role="radiogroup" aria-label="Situação"></div>
        <label class="og-sl">Posição da mão <input type="range" min="0" max="100" value="10" aria-label="Posição da mão na linha de busca, de baixo para cima"></label>
        <div class="og-btns"></div>
        <p class="og-res" aria-live="polite"></p>
      </div>
    </div>
    <div class="og-card" aria-live="polite"></div>`;
  const orgG = node.querySelector('.og-org');
  const hand = node.querySelector('.og-hand');
  const line = node.querySelector('.og-line');
  const aortaG = node.querySelector('.og-aorta');
  const res = node.querySelector('.og-res');
  const sl = node.querySelector('.og-sl input');
  const card = node.querySelector('.og-card');
  const firstSim = Object.entries(c.tecs).find(([, t]) => t.sim)?.[0];
  let tec = Object.keys(c.tecs)[0], cond = Object.keys(c.conds)[0], insp = 0, raf = 0, aRaf = 0, aMode = 'transmitida';
  const lenCm = Math.hypot(c.B[0] - c.A[0], c.B[1] - c.A[1]) / 10;
  line.setAttribute('d', `M${c.A} L${c.B}`);

  const sEdge = () => c.conds[cond][1] - c.ds * insp;
  function drawOrg() {
    const se = sEdge();
    if (k === 'figado') {
      const [, ey] = lerp(c.A, c.B, se);
      const ky = (ey - 122) / (245 - 122);
      orgG.innerHTML = `<g class="org org-figado sup" transform="translate(0 ${122 - 122 * ky}) scale(1 ${ky.toFixed(3)})"><path d="${ORGAOS.figado.d}"/></g>`;
    } else if (k === 'baco') {
      const top = [404, 166], tip = lerp(c.A, c.B, se);
      const cx = (top[0] + tip[0]) / 2, cy = (top[1] + tip[1]) / 2;
      const ry = Math.hypot(tip[0] - top[0], tip[1] - top[1]) / 2, ang = (Math.atan2(tip[1] - top[1], tip[0] - top[0]) * 180) / Math.PI - 90;
      orgG.innerHTML = `<g class="org org-baco prof"><ellipse cx="${cx}" cy="${cy}" rx="${Math.max(20, ry * 0.42)}" ry="${ry}" transform="rotate(${ang} ${cx} ${cy})"/></g>`;
    } else {
      const [, ey] = lerp(c.A, c.B, se);
      const top = 272 + insp * 16, ry = (ey - top) / 2;
      orgG.innerHTML = `<g class="org org-rins retro"><ellipse cx="188" cy="${top + ry}" rx="${cond === 'aumentado' ? 40 : 24}" ry="${ry}" transform="rotate(-8 188 ${top + ry})"/><ellipse cx="314" cy="${300 + insp * 16}" rx="23" ry="46" transform="rotate(10 314 ${300 + insp * 16})"/></g><path class="org org-aorta retro ln" d="M256 150 V352 M256 352 L212 440 M256 352 L300 440"/>`;
    }
  }
  function placeHand() {
    const s = Number(sl.value) / 100;
    const [x, y] = lerp(c.A, c.B, s);
    const ang = (Math.atan2(c.B[1] - c.A[1], c.B[0] - c.A[0]) * 180) / Math.PI + 90;
    hand.setAttribute('transform', `translate(${x} ${y}) rotate(${ang})`);
  }
  function avaliar(final) {
    const s = Number(sl.value) / 100, se0 = c.conds[cond][1], seI = se0 - c.ds, tol = 0.03;
    hand.classList.remove('touch');
    if (seI > 1.03) { res.textContent = final ? `A borda não chegou à mão${k === 'baco' ? ': baço não palpável, como na maioria dos adultos' : ''}.` : ''; return; }
    if (s > se0 + tol) { res.innerHTML = '<b>A mão já está sobre o órgão.</b> A borda fica abaixo dos dedos e não é percebida. Recomece mais baixo.'; return; }
    if (!final) { res.textContent = ''; return; }
    if (s >= seI - tol) {
      hand.classList.add('touch');
      const cm = c.margem ? Math.max(0, Math.round((c.margem - se0) * lenCm)) : null;
      res.innerHTML = `<b>A borda tocou as pontas dos dedos na inspiração.</b>${cm !== null ? ` Em repouso ela está cerca de ${cm} cm ${c.med}.` : ' Polo inferior palpável.'}`;
    } else res.innerHTML = 'A borda não chegou até a mão. Suba 1 a 2 cm e peça nova inspiração.';
  }
  function respirar() {
    cancelAnimationFrame(raf);
    if (prefersReducedMotion()) { insp = 1; drawOrg(); avaliar(true); setTimeout(() => { insp = 0; drawOrg(); }, 1200); return; }
    const t0 = performance.now(), T = 2600;
    const f = (ts) => {
      const p = Math.min(1, (ts - t0) / T);
      insp = Math.sin(Math.PI * p);
      drawOrg();
      if (p > 0.45 && p < 0.55) avaliar(true);
      if (p < 1) raf = requestAnimationFrame(f); else insp = 0;
    };
    raf = requestAnimationFrame(f);
  }
  function aorta(on) {
    aortaG.style.display = on ? '' : 'none'; hand.style.display = on ? 'none' : ''; line.style.display = on ? 'none' : '';
    cancelAnimationFrame(aRaf);
    if (!on) return;
    const draw = (p) => {
      const pul = Math.max(0, Math.sin(p * Math.PI * 2)) ** 2;
      const exp = aMode === 'expansivel', w = exp ? 36 : 22;
      const dx = exp ? pul * 10 : 0, dy = exp ? 0 : -pul * 8;
      aortaG.innerHTML = `<ellipse class="ao-w${exp ? ' an' : ''}" cx="256" cy="250" rx="${w + dx * 0.6}" ry="30"/>${exp ? '' : '<ellipse class="ao-m" cx="256" cy="246" rx="44" ry="26"/>'}
        <g class="ao-f" transform="translate(${-dx} ${dy})"><rect x="${200 - w}" y="226" width="22" height="50" rx="10"/></g>
        <g class="ao-f" transform="translate(${dx} ${dy})"><rect x="${290 + w}" y="226" width="22" height="50" rx="10"/></g>
        <text class="ao-t" x="256" y="320">${exp ? 'dedos afastados a cada pulso' : 'dedos sobem juntos'}</text>`;
    };
    if (prefersReducedMotion()) { draw(0.25); return; }
    const t0 = performance.now();
    const f = (ts) => { draw(((ts - t0) / 900) % 1); aRaf = requestAnimationFrame(f); };
    aRaf = requestAnimationFrame(f);
  }
  const ctl = node.querySelector('.og-ctl');
  const conds = node.querySelector('.og-conds');
  const btns = node.querySelector('.og-btns');
  const bI = button({ label: 'Pedir inspiração profunda', text: 'Inspirar', cls: 'primary' });
  bI.addEventListener('click', respirar);
  const aBtns = [['transmitida', 'Massa sobre a aorta'], ['expansivel', 'Aneurisma (expansível)']].map(([m, l]) => {
    const b = button({ label: l, text: l, cls: 'chip', pressed: m === aMode });
    b.addEventListener('click', () => { aMode = m; aBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); aorta(true); });
    return b;
  });
  btns.append(bI);
  const condBtns = Object.entries(c.conds).map(([ck, [n]]) => {
    const b = button({ label: n, text: n, cls: 'chip', pressed: ck === cond });
    b.addEventListener('click', () => { cond = ck; condBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); sl.value = 10; placeHand(); drawOrg(); avaliar(false); });
    conds.appendChild(b); return b;
  });
  function showTec(t) {
    tec = t;
    const T = c.tecs[t];
    const isSim = !!T.sim, isA = !!T.aorta;
    conds.replaceChildren(...(isA ? aBtns : condBtns));
    conds.hidden = !isSim && !isA;
    node.querySelector('.og-sl').hidden = !isSim;
    bI.hidden = !isSim;
    res.textContent = isSim ? 'Posicione a mão (comece baixo) e peça inspiração.' : '';
    ctl.classList.toggle('dim', !isSim && !isA);
    aorta(isA);
    card.innerHTML = `<h4>${T.n}</h4><ol>${T.passos.map((p) => `<li>${p}</li>`).join('')}</ol><p class="og-dica">${T.dica}</p>${figs(T)}`;
  }
  const tabs = node.querySelector('.og-tabs');
  Object.entries(c.tecs).forEach(([tk, T]) => {
    const b = button({ label: T.n, text: T.n, cls: 'seg', pressed: tk === tec });
    b.addEventListener('click', () => { tabs.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); showTec(tk); });
    tabs.appendChild(b);
  });
  sl.addEventListener('input', () => { placeHand(); avaliar(false); });
  captureKeys(node, (e) => { if (e.key === 'i' || e.key === 'I') { if (!bI.hidden) respirar(); return true; } return false; });
  placeHand(); drawOrg(); showTec(tec);
  if (!firstSim) bI.hidden = true;
  const stop = () => { cancelAnimationFrame(raf); cancelAnimationFrame(aRaf); };
  return { deactivate: stop, pause: stop, activate() { if (c.tecs[tec].aorta) aorta(true); } };
}

/* ======================================================================== */
export function murphy(node) {
  node.classList.add('mu');
  node.innerHTML = `
    <div class="mu-pics">
      <figure class="mu-pic"><img alt="" loading="lazy"><figcaption></figcaption></figure>
      <div class="mu-fr" role="radiogroup" aria-label="Quadro"></div>
    </div>
    <div class="mu-sim">
      <div class="mu-conds" role="radiogroup" aria-label="Situação"></div>
      <svg class="mu-svg" viewBox="0 0 420 330" role="img" aria-label="Corte sagital do hipocôndrio direito: diafragma, fígado, vesícula e dedos do examinador sob o rebordo">
        <path class="mu-wall" d="M40 300 C60 200 70 120 110 40"/>
        <path class="mu-rib" d="M60 150 C120 150 170 160 210 176"/>
        <g class="mu-move"><path class="mu-dia" d="M90 70 C170 30 300 40 400 80"/><path class="mu-liv" d="M92 76 C170 40 300 50 398 86 L398 170 C320 200 220 214 120 206 C100 170 94 120 92 76 Z"/><ellipse class="mu-gb" cx="180" cy="214" rx="40" ry="16" transform="rotate(-20 180 214)"/></g>
        <g class="mu-hand"><path d="M70 236 C100 234 150 236 196 248 L198 262 C150 256 100 256 66 258 Z"/></g>
        <text class="mu-l" x="300" y="34">diafragma</text><text class="mu-l" x="290" y="130">fígado</text><text class="mu-l mu-lgb" x="226" y="236">vesícula</text><text class="mu-l" x="20" y="286">dedos sob o rebordo</text>
        <g class="mu-curve"><rect x="250" y="250" width="160" height="70" rx="6"/><polyline points=""/><text x="258" y="266">volume inspirado</text></g>
      </svg>
      <div class="mu-tools"></div>
      <div class="mu-res" aria-live="polite"></div>
    </div>
    <div class="mu-card">
      <h4>Sinal de Murphy</h4>
      <p>Dedos enganchados sob o rebordo costal direito, no ponto cístico (cruzamento do rebordo com a borda lateral do reto). Pede-se inspiração profunda: a vesícula desce ao encontro dos dedos. É positivo quando a dor faz o paciente <b>interromper a inspiração</b>.</p>
      <p class="mu-ev">Evidência: ABD cita sensibilidade de cerca de 65% e especificidade de cerca de 87% para colecistite aguda; Bates descreve que o sinal positivo aumenta a probabilidade de colecistite (RV+ aproximada de 3). Pode ser negativo em idosos. Um sinal isolado não confirma o diagnóstico: some à história, à febre e à imagem.</p>
    </div>`;
  const FR = { exp: ['ab09a-murphy-expiracao.webp', 'Dedos do examinador sob o rebordo costal direito com o paciente em expiração', 'Expiração: dedos posicionados sob o rebordo, no ponto cístico.'], insp: ['ab09b-murphy-inspiracao.webp', 'Paciente em inspiração profunda com os dedos do examinador mantidos sob o rebordo', 'Inspiração: a vesícula desce até os dedos; observe a face e a respiração.'] };
  const pic = node.querySelector('.mu-pic img'), cap = node.querySelector('.mu-pic figcaption');
  const setFr = (f) => { pic.src = img(FR[f][0]); pic.alt = FR[f][1]; cap.textContent = FR[f][2]; };
  const fr = node.querySelector('.mu-fr');
  const frB = [['exp', 'Expiração'], ['insp', 'Inspiração']].map(([f, l], i) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: i === 0 });
    b.addEventListener('click', () => { frB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); setFr(f); });
    fr.appendChild(b); return b;
  });
  setFr('exp');
  let cond = 'normal', raf = 0;
  const move = node.querySelector('.mu-move'), poly = node.querySelector('.mu-curve polyline'), res = node.querySelector('.mu-res');
  const gb = node.querySelector('.mu-gb');
  const set = (p) => move.setAttribute('transform', `translate(${-p * 6} ${p * 34})`);
  const conds = node.querySelector('.mu-conds');
  const cB = [['normal', 'Vesícula normal'], ['colecistite', 'Colecistite aguda']].map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'chip', pressed: k === cond });
    b.addEventListener('click', () => { cond = k; cB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); gb.classList.toggle('infl', k === 'colecistite'); set(0); poly.setAttribute('points', ''); res.textContent = ''; });
    conds.appendChild(b); return b;
  });
  const run = () => {
    cancelAnimationFrame(raf);
    const pts = [], T = 3000, stopAt = cond === 'colecistite' ? 0.62 : 1;
    res.textContent = '';
    if (prefersReducedMotion()) {
      set(stopAt); poly.setAttribute('points', `256,312 ${cond === 'colecistite' ? '330,285 400,285' : '330,264 400,312'}`);
      res.innerHTML = cond === 'colecistite' ? '<b>Parada súbita da inspiração com dor:</b> Murphy positivo.' : 'Inspiração completa, sem dor: Murphy negativo.';
      return;
    }
    const t0 = performance.now(); let stopped = false, held = 0;
    const f = (ts) => {
      const t = (ts - t0) / T;
      let p = t < 0.5 ? Math.sin(Math.PI * t) : Math.sin(Math.PI * t);
      if (cond === 'colecistite' && t < 0.5 && p >= stopAt) { stopped = true; }
      if (stopped) { held = held || t; p = t - held < 0.18 ? stopAt : Math.max(0, stopAt - (t - held - 0.18) * 2.4); }
      set(p);
      pts.push(`${(256 + Math.min(1, t) * 148).toFixed(1)},${(312 - p * 46).toFixed(1)}`);
      poly.setAttribute('points', pts.join(' '));
      gb.classList.toggle('hit', p > 0.55);
      if (stopped && t - held > 0.05 && !res.textContent) res.innerHTML = '<b>Parada súbita da inspiração com dor:</b> Murphy positivo.';
      if (t < 1 && !(stopped && p <= 0)) raf = requestAnimationFrame(f);
      else { gb.classList.remove('hit'); if (!stopped) res.textContent = 'Inspiração completa, sem dor: Murphy negativo.'; }
    };
    raf = requestAnimationFrame(f);
  };
  const b = button({ label: 'Pedir inspiração profunda', text: 'Inspirar', cls: 'primary' });
  b.addEventListener('click', run);
  node.querySelector('.mu-tools').appendChild(b);
  captureKeys(node, () => false);
  const stop = () => cancelAnimationFrame(raf);
  return { deactivate: stop, pause: stop };
}

/* ======================================================================== */
const SIN = {
  mcburney: { n: 'McBurney', txt: 'Dor à palpação no ponto de McBurney: na linha entre a espinha ilíaca anterossuperior direita e o umbigo, a cerca de um terço da espinha (4 a 5 cm). O apêndice varia de posição: retrocecal ou pélvico pode doer em outro lugar.', ev: 'Bates: dor no ponto de McBurney aumenta a probabilidade de apendicite (RV+ aproximada de 3).' },
  blumberg: { n: 'Descompressão (Blumberg)', txt: 'Comprimir devagar a fossa ilíaca direita e soltar de repente: dor maior na liberação indica irritação peritoneal. Dói muito; se a percussão ou a tosse já doem no local, a descompressão é dispensável.', ev: 'Sinal de irritação peritoneal, não específico de apendicite. As figuras mostram a pressão e a retirada; a resposta positiva é a dor maior no momento da retirada, que o recorte não mostra no rosto do paciente.', imgs: [
    ['ab16a-descompressao-compressao.webp', 'Descompressão, quadro 1: pontas de três dedos do examinador comprimindo o quadrante inferior direito, abaixo do umbigo', 'Quadro 1: pressão lenta e progressiva no quadrante inferior direito.'],
    ['ab16b-descompressao-retirada.webp', 'Descompressão, quadro 2: mesmo enquadramento após a retirada rápida dos dedos, com a pele voltando ao contorno', 'Quadro 2: retirada rápida; a pele recupera o contorno. A expressão de dor não aparece neste recorte.'],
  ] },
  rovsing: { n: 'Rovsing', txt: 'Comprimir o quadrante inferior ESQUERDO e perguntar onde dói: dor referida na fossa ilíaca DIREITA é positiva. Erro frequente: comprimir o lado direito, que é só palpação do local doloroso.', ev: 'Bates: Rovsing positivo aumenta a probabilidade (RV+ aproximada de 2).' },
  psoas: { n: 'Psoas', txt: 'Paciente em decúbito lateral esquerdo; o examinador estende a coxa direita (ou, em decúbito dorsal, o paciente flete a coxa direita contra a resistência da mão). Dor indica irritação do músculo iliopsoas, comum no apêndice retrocecal.', ev: 'Bates: sinal do psoas aumenta a probabilidade (RV+ aproximada de 2).', img: ['ab18-psoas-detalhe.webp', 'Sinal do psoas, detalhe: o examinador sustenta com uma mão a perna e com a outra a coxa do membro de cima do paciente deitado de lado', 'Detalhe do apoio da coxa e da perna na manobra passiva. O recorte não mostra o decúbito lateral esquerdo completo nem deixa claro o sentido do movimento: a coxa direita deve ser levada para trás (extensão do quadril), como descrito no texto.'] },
  obturador: { n: 'Obturador', img: ['ab19-obturador.webp', 'Examinador flete o quadril e o joelho direitos do paciente e roda a coxa internamente', 'Flexão de quadril e joelho a 90 graus e rotação interna da coxa direita.'], txt: 'Fletir quadril e joelho direitos e rodar a coxa internamente: dor hipogástrica direita sugere irritação do músculo obturador interno, como no apêndice pélvico.', ev: 'Bates: sensibilidade baixa; negativo não afasta.' },
};
export function apendice(node) {
  node.classList.add('ap');
  node.innerHTML = `
    <div class="ap-tabs" role="radiogroup" aria-label="Sinal"></div>
    <div class="ap-fig"><svg class="ap-svg" viewBox="${VB}" role="img" aria-label="Abdome com os pontos de cada sinal">${base({ marcos: true })}<path class="ap-mcl" d="M138 445 L250 335"/><g class="ap-draw"></g></svg><div class="ap-img"></div></div>
    <div class="ap-card" aria-live="polite"></div>
    <p class="ap-nota">Nenhum destes sinais, isolado, confirma ou exclui apendicite. A combinação com a história (migração da dor, anorexia, vômitos depois da dor), a febre e os exames é o que muda a probabilidade.</p>`;
  const draw = node.querySelector('.ap-draw'), card = node.querySelector('.ap-card'), im = node.querySelector('.ap-img');
  const mc = [175, 408];
  const G = {
    mcburney: `<circle class="ap-pt" cx="${mc[0]}" cy="${mc[1]}" r="12"/><text class="ap-tx" x="${mc[0] - 64}" y="${mc[1] + 34}">ponto de McBurney</text><text class="ap-tx s" x="168" y="372">1/3</text>`,
    blumberg: `<circle class="ap-pt" cx="${mc[0]}" cy="${mc[1]}" r="12"/><path class="ap-ar" d="M${mc[0]} ${mc[1] - 70} V${mc[1] - 18}"/><path class="ap-ar up" d="M${mc[0] + 26} ${mc[1] - 20} V${mc[1] - 76}"/><text class="ap-tx" x="${mc[0] + 32}" y="${mc[1] - 40}">soltar de repente</text>`,
    rovsing: `<circle class="ap-press" cx="325" cy="408" r="22"/><text class="ap-tx" x="290" y="452">comprimir aqui</text><circle class="ap-pt pulse" cx="${mc[0]}" cy="${mc[1]}" r="14"/><path class="ap-ar dash" d="M300 400 C260 370 220 380 194 400"/><text class="ap-tx" x="92" y="452">dor aqui</text>`,
    psoas: `<g class="ap-psoas"><path class="ap-ps" d="M216 300 C206 360 188 420 176 470"/><text class="ap-tx" x="200" y="296">psoas direito</text><circle class="ap-pt" cx="${mc[0] + 4}" cy="${mc[1] + 10}" r="10"/></g>`,
    obturador: `<g><circle class="ap-pt" cx="214" cy="540" r="12"/><text class="ap-tx" x="120" y="580">dor hipogástrica direita</text></g>`,
  };
  const show = (k) => {
    const s = SIN[k];
    draw.innerHTML = G[k];
    im.innerHTML = figs(s);
    node.classList.toggle('has-img', !!(s.img || s.imgs));
    card.innerHTML = `<h4>${s.n}</h4><p>${s.txt}</p><p class="ap-ev">${s.ev}</p>`;
  };
  const tabs = node.querySelector('.ap-tabs');
  Object.entries(SIN).forEach(([k, s], i) => {
    const b = button({ label: s.n, text: s.n, cls: 'seg', pressed: i === 0 });
    b.addEventListener('click', () => { tabs.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); show(k); });
    tabs.appendChild(b);
  });
  show('mcburney');
  return {};
}
