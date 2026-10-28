/**
 * Atlas abdominal em camadas: regiões (duas convenções de linhas) e
 * quadrantes, órgãos superficiais e profundos, pontos de referência e
 * deslocamento respiratório. Tocar numa região lista o que se projeta nela;
 * tocar num órgão lista as regiões que ele ocupa.
 */
import { VB, base, regioes, quadrantes, orgao, ORGAOS, NOMES9, NOMES4, ROT9, regiaoEm, quadranteEm, L, TRAUBE } from '../core/abdomen.js';
import { button, captureKeys, prefersReducedMotion } from '../core/ui.js';

const REG_TXT = {
  hd: 'Fígado (lobo direito) na porção anterior; vesícula biliar, profunda, sob a borda do fígado; ângulo hepático do cólon. Na inspiração profunda, o pulmão e a pleura ocupam a parte alta da porção lateral.',
  epi: 'Lobo esquerdo do fígado em cima; parede anterior do antro gástrico embaixo. Mais profundos: pâncreas, duodeno e aorta. Na inspiração, o fígado desce para dentro do epigástrio.',
  he: 'Fundo gástrico na porção anterior; baço, posterolateral e sob as costelas; ângulo esplênico do cólon. Na inspiração, o pulmão ocupa a parte alta da porção lateral.',
  fd: 'Cólon ascendente na porção lateral; intestino delgado na medial. Profundo: rim direito, que pode se projetar aqui se aumentado ou ptótico.',
  meso: 'Grande curvatura gástrica em cima; cólon transverso (móvel) e intestino delgado. Profundos: aorta (bifurca na altura do umbigo) e veia cava.',
  fe: 'Cólon descendente na porção lateral; intestino delgado na medial. Profundo: rim esquerdo. (A Tabela 12.1 de ABD diz "colo ascendente" nesta linha: é erro tipográfico.)',
  fid: 'Ceco e apêndice na porção lateral; intestino delgado (íleo terminal) na medial. Na mulher, anexo direito na pelve.',
  hipo: 'Intestino delgado; bexiga quando cheia; útero aumentado (gravidez, miomas). Cólon sigmoide pode cruzar a linha média.',
  fie: 'Cólon sigmoide na porção lateral; intestino delgado na medial. Na mulher, anexo esquerdo na pelve.',
};
const ORG_TXT = {
  figado: ['hd', 'epi', 'he'], vesicula: ['hd'], estomago: ['epi', 'he', 'meso'], baco: ['he'], pancreas: ['epi', 'he'], duodeno: ['epi', 'hd', 'meso'],
  delgado: ['meso', 'fd', 'fe', 'fid', 'fie', 'hipo'], colon: ['hd', 'fd', 'meso', 'he', 'fe', 'fie'], ceco: ['fid'], rins: ['hd', 'fd', 'he', 'fe'], bexiga: ['hipo'], aorta: ['epi', 'meso'],
};
const ORG_NOTA = {
  figado: 'Atravessa três regiões. Desce na inspiração: por isso a palpação é feita com o paciente inspirando.',
  vesicula: 'Profunda, sob o fígado; normalmente não palpável. O fundo fica perto do encontro da borda lateral do reto com o rebordo costal (ponto cístico).',
  estomago: 'Fundo sob o rebordo esquerdo (bolha de ar: timpanismo do espaço de Traube).',
  baco: 'Posterolateral, sob as costelas 9 a 11. Normal não palpável em 95% a 98% dos adultos; aumenta em direção ao umbigo.',
  pancreas: 'Retroperitoneal, profundo: não se palpa normalmente. Dor pancreática é epigástrica e pode ir para o dorso.',
  duodeno: 'Retroperitoneal em grande parte; contorna a cabeça do pâncreas.',
  delgado: 'Ocupa todas as regiões exceto o epigástrio (ABD).',
  colon: 'Moldura em torno do delgado; o transverso é móvel e muda de altura.',
  ceco: 'Na fossa ilíaca direita; costuma ser palpável. O apêndice tem posição variável (retrocecal, pélvica).',
  rins: 'Retroperitoneais, dorsais; o direito é mais baixo e seu polo inferior pode ser palpável em pessoas magras.',
  bexiga: 'Só se projeta acima do púbis quando cheia; a macicez aparece a partir de 400 a 600 mL (Bates).',
  aorta: 'Um pouco à esquerda da linha média; bifurca na altura do umbigo. Pulsação palpável em magros é normal.',
};
const PONTOS = [
  { k: 'cistico', x: L.cistico[0], y: L.cistico[1], n: 'Ponto cístico', t: 'Encontro da borda lateral do músculo reto direito com o rebordo costal. Onde se pesquisa o sinal de Murphy.' },
  { k: 'mcburney', x: L.mcburney[0], y: L.mcburney[1], n: 'Ponto de McBurney', t: 'Cerca de 5 cm (2 polegadas) da espinha ilíaca anterossuperior direita, na linha que vai dela ao umbigo (Bates).' },
  { k: 'umbigo', x: 250, y: 335, n: 'Cicatriz umbilical', t: 'Cruzamento das linhas dos quadrantes; nível aproximado da bifurcação da aorta.' },
  { k: 'eias', x: L.eiasD[0], y: L.eiasD[1], n: 'Espinha ilíaca anterossuperior', t: 'Referência óssea das linhas inferiores e do ponto de McBurney.' },
  { k: 'xif', x: 250, y: 124, n: 'Apêndice xifoide', t: 'Ápice do ângulo formado pelos rebordos costais (ângulo de Charpy).' },
];

export function atlas(node) {
  node.classList.add('at');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="at-fig"><svg class="at-svg" viewBox="${VB}" role="group" aria-label="Abdome em vista frontal"></svg>
      <p class="at-side"><span>direita do paciente</span><span>esquerda do paciente</span></p></div>
    <div class="at-panel">
      <div class="at-row"><span class="at-l">Divisão</span><div class="at-div" role="radiogroup" aria-label="Divisão"></div></div>
      <div class="at-row at-conv-row"><span class="at-l">Linhas verticais</span><div class="at-conv" role="radiogroup" aria-label="Convenção"></div></div>
      <div class="at-row"><span class="at-l">Camadas</span><div class="at-lay"></div></div>
      <div class="at-row"><span class="at-l">Respiração</span><div class="at-resp"></div></div>
      <div class="at-card" aria-live="polite"><p class="at-hint">Toque numa região, num órgão ou num ponto.</p></div>
    </div>`;
  const svg = node.querySelector('.at-svg');
  const card = node.querySelector('.at-card');
  const st = { div: 'nove', conv: 'hemi', sup: true, prof: false, pts: true, insp: 0 };
  const seg = (host, opts, key) => opts.map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: st[key] === k });
    b.addEventListener('click', () => { st[key] = k; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    host.appendChild(b); return b;
  });
  seg(node.querySelector('.at-div'), [['nove', 'Nove regiões'], ['quad', 'Quatro quadrantes']], 'div');
  seg(node.querySelector('.at-conv'), [['hemi', 'Hemiclaviculares'], ['obl', 'Oblíquas (ABD)']], 'conv');
  const lay = node.querySelector('.at-lay');
  [['sup', 'Órgãos superficiais'], ['prof', 'Profundos e retroperitoneais'], ['pts', 'Pontos de referência']].forEach(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'chip', pressed: st[k] });
    b.addEventListener('click', () => { st[k] = !st[k]; b.setAttribute('aria-pressed', String(st[k])); draw(); });
    lay.appendChild(b);
  });
  const bInsp = button({ label: 'Inspiração profunda', text: 'Inspirar fundo', cls: 'ghost' });
  node.querySelector('.at-resp').appendChild(bInsp);
  let anim = 0;
  bInsp.addEventListener('click', () => {
    const alvo = st.insp > 0.5 ? 0 : 1;
    bInsp.querySelector('span').textContent = alvo ? 'Expirar' : 'Inspirar fundo';
    cancelAnimationFrame(anim);
    if (prefersReducedMotion()) { st.insp = alvo; draw(); return; }
    const ini = st.insp, t0 = performance.now();
    const step = (now) => { const u = Math.min(1, (now - t0) / 1400); st.insp = ini + (alvo - ini) * (1 - Math.cos(Math.PI * u)) / 2; draw(); if (u < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
    if (alvo) card.innerHTML = '<h4>Inspiração profunda</h4><p>O diafragma desce e empurra fígado, vesícula, baço e rins para baixo. É por isso que se palpam esses órgãos durante a inspiração: a borda vem ao encontro dos dedos.</p>';
  });
  let selReg = null, selOrg = null;
  function draw() {
    node.querySelector('.at-conv-row').hidden = st.div !== 'nove';
    const sup = ['colon', 'delgado', 'ceco', 'estomago', 'figado', 'bexiga'];
    const prof = ['rins', 'aorta', 'pancreas', 'duodeno', 'baco', 'vesicula'];
    let orgs = '';
    if (st.prof) orgs += prof.map((k) => orgao(k, { insp: st.insp, cls: selOrg === k ? 'sel' : '' })).join('');
    if (st.sup) orgs += sup.filter((k) => k !== 'bexiga').map((k) => orgao(k, { insp: st.insp, cls: selOrg === k ? 'sel' : '' })).join('');
    if (st.sup && !st.prof) orgs += orgao('vesicula', { insp: st.insp, cls: (selOrg === 'vesicula' ? 'sel' : '') + ' peek' }) + orgao('baco', { insp: st.insp, cls: (selOrg === 'baco' ? 'sel' : '') + ' peek' });
    const regs = st.div === 'nove' ? regioes(st.conv) + NOMES9.map(([k]) => `<text class="at-rt${selReg === k ? ' sel' : ''}" x="${ROT9[k][0]}" y="${ROT9[k][1]}">${k.toUpperCase()}</text>`).join('') : quadrantes() + ['qsd', 'qse', 'qid', 'qie'].map((k) => `<text class="at-rt${selReg === k ? ' sel' : ''}" x="${k.endsWith('d') ? 160 : 340}" y="${k[1] === 's' ? 230 : 470}">${k.toUpperCase()}</text>`).join('');
    const pts = st.pts ? PONTOS.map((p, i) => `<g class="at-pt" data-p="${i}" tabindex="0" role="button" aria-label="${p.n}"><circle cx="${p.x}" cy="${p.y}" r="11"/><circle class="c" cx="${p.x}" cy="${p.y}" r="4"/></g>`).join('') + `<path class="at-traube" d="${TRAUBE}"/>` : '';
    svg.innerHTML = `<rect class="at-hit" x="0" y="0" width="500" height="640"/>${base({ retos: st.pts })}<g class="at-orgs">${orgs}</g>${regs}${pts}`;
    svg.querySelectorAll('.org').forEach((g) => {
      g.addEventListener('click', (e) => { e.stopPropagation(); showOrg(g.dataset.org); });
    });
    svg.querySelectorAll('.at-pt').forEach((g) => {
      const p = PONTOS[g.dataset.p];
      g.addEventListener('click', (e) => { e.stopPropagation(); selOrg = null; selReg = null; draw(); card.innerHTML = `<h4>${p.n}</h4><p>${p.t}</p>`; });
    });
    svg.querySelector('.at-traube')?.addEventListener('click', (e) => { e.stopPropagation(); card.innerHTML = '<h4>Espaço de Traube</h4><p>Área de timpanismo do fundo gástrico sob o gradeado costal esquerdo (entre a 6ª costela, a linha axilar anterior esquerda e o rebordo). Vira macicez na esplenomegalia, mas também logo depois de comer.</p>'; });
  }
  function showOrg(k) {
    selOrg = k; selReg = null; draw();
    const nomes = ORG_TXT[k].map((r) => NOMES9.find((x) => x[0] === r)[1].toLowerCase()).join(', ');
    card.innerHTML = `<h4>${ORGAOS[k].nome}</h4><p class="at-tag">Projeta-se em: ${nomes}</p><p>${ORG_NOTA[k]}</p>`;
  }
  svg.addEventListener('click', (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (p.y < 20 || p.y > 600) return;
    selOrg = null;
    if (st.div === 'nove') {
      const r = regiaoEm(p.x, p.y, st.conv); selReg = r; draw();
      card.innerHTML = `<h4>${NOMES9.find((x) => x[0] === r)[1]}</h4><p>${REG_TXT[r]}</p>`;
    } else {
      const q = quadranteEm(p.x, p.y); selReg = q; draw();
      const lista = { qsd: 'fígado, vesícula, duodeno, cabeça do pâncreas, rim direito, ângulo hepático do cólon', qse: 'estômago, baço, corpo e cauda do pâncreas, rim esquerdo, ângulo esplênico do cólon', qid: 'ceco, apêndice, íleo terminal, ureter direito; na mulher, anexo direito', qie: 'cólon sigmoide e descendente, ureter esquerdo; na mulher, anexo esquerdo' }[q];
      card.innerHTML = `<h4>${NOMES4[q]}</h4><p>${lista}. A localização limita os órgãos a considerar, mas não define qual está doente.</p>`;
    }
  });
  captureKeys(node, (e) => { const g = e.target.closest?.('.at-pt'); if (g && (e.key === 'Enter' || e.key === ' ')) { g.dispatchEvent(new Event('click', { bubbles: false })); return true; } return false; });
  draw();
  return { deactivate() { cancelAnimationFrame(anim); } };
}
