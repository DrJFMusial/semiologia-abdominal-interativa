/**
 * Inspeção.
 * formas:     o mesmo perfil pode vir de conteúdos diferentes; descrever a
 *             forma e deixar a causa para as outras técnicas (ABD).
 * superficie: circulação colateral com o teste do sentido do fluxo,
 *             equimoses, cicatrizes cirúrgicas e peristaltismo visível.
 * hernia:     contração da parede (elevar a cabeça) revela diástase e hérnias.
 */
import { VB, base } from '../core/abdomen.js';
import { button, captureKeys, prefersReducedMotion } from '../core/ui.js';

/* ---------------- perfis ---------------- */
const TIPOS = {
  normal: { n: 'Normal', forma: 'Plano', b: (u) => 6 * Math.sin(Math.PI * u) - 6 * Math.sin(2 * Math.PI * u) * 0.5, fl: 0, perc: 'Timpanismo na maior parte; macicez hepática no hipocôndrio direito.', txt: 'Perfil em "S" aberto: discreta convexidade acima do umbigo e concavidade abaixo (ABD). Comum no adulto com índice de massa corporal normal.' },
  magreza: { n: 'Emagrecimento acentuado', forma: 'Escavado (retraído)', b: (u) => -30 * Math.sin(Math.PI * u), fl: -18, perc: 'Timpanismo; rebordos, espinhas ilíacas e sínfise salientes.', txt: 'Côncavo, com relevos ósseos salientes. Caquexia e desidratação, mas também pessoas magras saudáveis.' },
  gas: { n: 'Gás (distensão de alças)', forma: 'Globoso', b: (u) => 62 * Math.sin(Math.PI * u), fl: 14, perc: 'Timpanismo difuso, às vezes hipertimpanismo; macicez hepática pode diminuir.', txt: 'Aumento uniforme, em segmento de esfera. A inspeção não separa gás de líquido: a percussão separa.' },
  ascite: { n: 'Líquido livre (ascite)', forma: 'Globoso, flancos abaulados ("em batráquio")', b: (u) => 42 * Math.sin(Math.PI * u), fl: 46, perc: 'Macicez nos flancos e timpanismo central em decúbito dorsal; a macicez muda com o decúbito.', txt: 'O líquido vai para as partes declives e empurra os flancos para fora; a face anterior fica mais plana. Pode haver protrusão do umbigo e hérnias.' },
  gordura: { n: 'Gordura', forma: 'Globoso; em avental nos grandes obesos', b: (u) => 52 * Math.sin(Math.PI * u) + (u > 0.65 ? 30 * Math.sin(Math.PI * (u - 0.65) / 0.35) : 0), fl: 28, perc: 'Timpanismo, abafado pela parede espessa; umbigo profundo.', txt: 'Aumento difuso do panículo; no obeso grave o abdome cai sobre as coxas em pé (avental).' },
  gravidez: { n: 'Útero gravídico', forma: 'Piriforme (gravídico)', b: (u) => 95 * Math.exp(-((u - 0.62) ** 2) / 0.045), fl: 6, perc: 'Macicez central do hipogástrio ao mesogástrio; timpanismo nos flancos.', txt: 'Abaulamento central predominando abaixo do umbigo, simétrico.' },
  massa: { n: 'Massa no epigástrio', forma: 'Abaulamento localizado e assimétrico', b: (u) => 6 * Math.sin(Math.PI * u) + 38 * Math.exp(-((u - 0.25) ** 2) / 0.006), fl: 0, perc: 'Macicez sobre a massa, se for sólida ou líquida.', txt: 'Retrações e abaulamentos localizados quebram a simetria: localize, meça e confirme na palpação.' },
};
function perfil(b) {
  // decúbito dorsal, cabeça à esquerda; costas em y=260
  let d = 'M40 260 L40 120 C60 100 120 96 170 112';
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, x = 170 + u * 430;
    const y = 128 + u * 22 - b(u);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ' C630 160 650 168 670 170 L670 260 Z';
}
function frontal(fl, tipo) {
  const hw = (v) => 108 + 10 * Math.sin(Math.PI * v) + fl * Math.max(0, Math.sin(Math.PI * Math.min(1, v * 1.15)) ** 1.5) * (v > 0.25 ? 1 : v * 4);
  let L = '', R = '';
  for (let i = 0; i <= 30; i++) { const v = i / 30, y = 30 + v * 330; L += `${i ? 'L' : 'M'}${(200 - hw(v)).toFixed(1)} ${y.toFixed(1)} `; R = `L${(200 + hw(v)).toFixed(1)} ${y.toFixed(1)} ` + R; }
  const umb = tipo === 'ascite' ? '<ellipse class="fm-umb out" cx="200" cy="200" rx="9" ry="9"/>' : '<ellipse class="fm-umb" cx="200" cy="200" rx="6" ry="8"/>';
  const extra = tipo === 'gravidez' ? '<ellipse class="fm-shade" cx="200" cy="245" rx="85" ry="105"/>' : tipo === 'massa' ? '<ellipse class="fm-shade" cx="215" cy="105" rx="40" ry="32"/>' : '';
  return `${L}${R}Z|${umb}${extra}`;
}

export function formas(node) {
  node.classList.add('fm');
  node.innerHTML = `
    <div class="fm-ops" role="radiogroup" aria-label="Conteúdo do abdome"></div>
    <div class="fm-views">
      <figure><svg class="fm-lat" viewBox="0 0 700 290" role="img" aria-label="Perfil do abdome em decúbito dorsal"><path class="fm-table" d="M20 262 H690"/><path class="fm-body"/><path class="fm-ref" d=""/><text class="fm-t" x="40" y="285">cabeça</text><text class="fm-t" x="640" y="285">pés</text></svg><figcaption>Perfil, com o olhar no nível da parede (inspeção tangencial)</figcaption></figure>
      <figure><svg class="fm-fr" viewBox="0 0 400 390" role="img" aria-label="Abdome visto de frente"><path class="fm-body"/><g class="fm-x"></g></svg><figcaption>De frente, aos pés da maca</figcaption></figure>
    </div>
    <div class="fm-card" aria-live="polite"></div>`;
  const lat = node.querySelector('.fm-lat .fm-body'), ref = node.querySelector('.fm-ref');
  const fr = node.querySelector('.fm-fr .fm-body'), fx = node.querySelector('.fm-x');
  const card = node.querySelector('.fm-card');
  ref.setAttribute('d', perfil(TIPOS.normal.b).replace(/ L670 260 Z$/, '').replace(/^M40 260 L40 120/, 'M40 120'));
  let tipo = 'normal';
  const draw = () => {
    const t = TIPOS[tipo];
    lat.setAttribute('d', perfil(t.b));
    const [d, x] = frontal(t.fl, tipo).split('|');
    fr.setAttribute('d', d); fx.innerHTML = x;
    ref.style.display = tipo === 'normal' ? 'none' : '';
    card.innerHTML = `<p class="fm-k">Descrição morfológica</p><h4>${t.forma}</h4><p>${t.txt}</p><p class="fm-k">O que a percussão mostraria</p><p>${t.perc}</p>`;
  };
  const host = node.querySelector('.fm-ops');
  Object.entries(TIPOS).forEach(([k, t]) => {
    const b = button({ label: t.n, text: t.n, cls: 'chip', pressed: k === tipo });
    b.addEventListener('click', () => { tipo = k; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    host.appendChild(b);
  });
  draw();
  return {};
}

/* ---------------- superfície ---------------- */
const CICATRIZES = [
  { n: 'Subcostal direita (Kocher)', d: 'M150 236 C175 250 205 258 238 252', t: 'Colecistectomia e cirurgia biliar abertas.' },
  { n: 'Mediana', d: 'M250 150 V325 M250 345 V560', t: 'Laparotomia exploradora, cirurgias de urgência e oncológicas.' },
  { n: 'Oblíqua na fossa ilíaca direita (McBurney)', d: 'M152 430 L196 384', t: 'Apendicectomia aberta.' },
  { n: 'Transversa suprapúbica (Pfannenstiel)', d: 'M196 556 C230 566 270 566 304 556', t: 'Cesárea e cirurgia ginecológica.' },
  { n: 'Inguinal esquerda', d: 'M300 520 L346 486', t: 'Herniorrafia inguinal.' },
  { n: 'Portais de videolaparoscopia', d: 'M244 342 h12 M318 220 h10 M182 264 h10 M300 300 h10', t: 'Pequenas incisões: umbilical e acessórias.' },
];
export function superficie(node) {
  node.classList.add('sf');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="sf-tabs" role="tablist"></div>
    <div class="sf-main">
      <svg class="sf-svg" viewBox="${VB}" role="img" aria-label="Abdome em vista frontal">${base({ marcos: false })}<g class="sf-layer"></g></svg>
      <div class="sf-panel"><div class="sf-ctrl"></div><div class="sf-card" aria-live="polite"></div></div>
    </div>`;
  const layer = node.querySelector('.sf-layer');
  const card = node.querySelector('.sf-card');
  const ctrl = node.querySelector('.sf-ctrl');
  let timers = [], raf = 0;
  const clear = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
  const later = (ms, f) => timers.push(setTimeout(f, prefersReducedMotion() ? 0 : ms));

  const VEIAS = {
    porta: { n: 'Tipo porta', d: 'M250 335 C230 300 222 260 210 210 M250 335 C270 300 282 262 292 212 M250 335 C214 330 180 320 146 300 M250 335 C286 330 320 320 356 300 M250 335 C232 372 220 410 206 452 M250 335 C268 372 282 410 296 452', dir: 'down', txt: 'Veias dilatadas em torno do umbigo (cabeça de medusa), por recanalização da veia umbilical no ligamento falciforme. O fluxo se afasta do umbigo: sobe acima dele e desce abaixo dele (ABD, Swartz).' },
    cava: { n: 'Tipo cava inferior', d: 'M122 520 C126 440 118 380 128 300 C134 250 132 200 140 150 M378 520 C374 440 382 380 372 300 C366 250 368 200 360 150', dir: 'up', txt: 'Veias nos flancos, às vezes nas fossas ilíacas, com fluxo sempre ascendente: o sangue dos membros inferiores contorna a cava obstruída.' },
  };
  function colateral() {
    let tipo = 'porta';
    ctrl.innerHTML = '';
    const segs = Object.entries(VEIAS).map(([k, v]) => { const b = button({ label: v.n, text: v.n, cls: 'seg', pressed: k === tipo }); b.addEventListener('click', () => { tipo = k; segs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); clear(); draw(); }); return b; });
    const g = document.createElement('div'); g.className = 'sf-seg'; g.append(...segs);
    const bTest = button({ icon: 'play', label: 'Testar o sentido do fluxo', text: 'Testar o sentido do fluxo', cls: 'primary' });
    ctrl.append(g, bTest);
    const segBaixo = { porta: [206, 452, 222, 392], cava: [122, 470, 126, 410] };
    const draw = (fase = 0) => {
      const v = VEIAS[tipo], [x1, y1, x2, y2] = segBaixo[tipo];
      const vazio = fase >= 1 && fase < 3;
      const enchido = fase >= 3;
      const desce = v.dir === 'down';
      const fingers = fase === 1 ? [[(x1 + x2) / 2, (y1 + y2) / 2], [(x1 + x2) / 2 + 4, (y1 + y2) / 2 - 8]]
        : fase === 2 ? [[x1, y1], [x2, y2]] : fase >= 3 ? [desce ? [x1, y1] : [x2, y2]] : [];
      const arrow = desce ? `M${x2} ${y2} L${x1 + (x2 - x1) * 0.25} ${y1 + (y2 - y1) * 0.25}` : `M${x1} ${y1} L${x2 + (x1 - x2) * 0.25} ${y2 + (y1 - y2) * 0.25}`;
      layer.innerHTML = `<path class="sf-vein" d="${v.d}"/>
        <path class="sf-vseg ${vazio ? 'vazio' : ''} ${enchido ? 'enche' : ''}" d="M${x1} ${y1} L${x2} ${y2}"/>
        ${fingers.map(([cx, cy]) => `<circle class="sf-finger" cx="${cx}" cy="${cy}" r="13"/>`).join('')}
        ${enchido ? `<path class="sf-arrow" d="${arrow}" marker-end="url(#sf-ah)"/>` : ''}
        <defs><marker id="sf-ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c3323c"/></marker></defs>`;
      if (fase === 0) card.innerHTML = `<h4>${v.n}</h4><p>${v.txt}</p>`;
    };
    bTest.addEventListener('click', () => {
      clear(); draw(1);
      card.innerHTML = '<p class="sf-step"><b>1.</b> Dois dedos juntos comprimem um segmento de veia orientado no sentido craniocaudal.</p>';
      later(1300, () => { draw(2); card.innerHTML += '<p class="sf-step"><b>2.</b> Mantendo a pressão, os dedos se afastam 7 a 10 cm: o segmento entre eles fica vazio.</p>'; });
      later(2900, () => {
        draw(3);
        const desce = VEIAS[tipo].dir === 'down';
        card.innerHTML += `<p class="sf-step"><b>3.</b> Soltar o dedo ${desce ? 'de cima' : 'de baixo'}: a veia se enche a partir ${desce ? 'de cima' : 'de baixo'}. Repetindo e soltando o outro dedo, ela continua vazia.</p>
          <p class="sf-res">Fluxo ${desce ? 'descendente abaixo do umbigo: padrão porta' : 'ascendente: padrão cava inferior'} (Swartz).</p>`;
      });
    });
    draw();
  }
  function equimoses() {
    ctrl.innerHTML = '';
    layer.innerHTML = `<ellipse class="sf-equi" cx="250" cy="338" rx="42" ry="34"/><path class="sf-equi" d="M378 300 C404 320 410 380 398 430 C380 440 362 410 360 370 C358 340 364 312 378 300 Z"/>
      <text class="sf-lbl" x="250" y="398">Cullen</text><text class="sf-lbl" x="380" y="458">Grey Turner</text>`;
    card.innerHTML = '<h4>Equimoses de parede</h4><p><b>Cullen</b>: periumbilical. <b>Grey Turner</b>: em um ou ambos os flancos. Surgem na pancreatite necro-hemorrágica (ABD) e em sangramentos intra ou retroperitoneais de outras causas (Swartz).</p><p>São achados tardios e pouco frequentes; quando presentes, indicam gravidade. Ausência não afasta a doença.</p>';
  }
  function cicatrizes() {
    ctrl.innerHTML = '<p class="sf-hint">Toque numa cicatriz.</p>';
    layer.innerHTML = CICATRIZES.map((c, i) => `<g class="sf-cic" data-i="${i}" tabindex="0" role="button" aria-label="${c.n}"><path class="hit" d="${c.d}"/><path class="cut" d="${c.d}"/></g>`).join('');
    layer.querySelectorAll('.sf-cic').forEach((g) => g.addEventListener('click', () => {
      const c = CICATRIZES[g.dataset.i];
      layer.querySelectorAll('.sf-cic').forEach((x) => x.classList.toggle('sel', x === g));
      card.innerHTML = `<h4>${c.n}</h4><p>${c.t}</p><p>Toda cicatriz importa: cirurgia com manipulação do peritônio pode deixar aderências, causa comum de obstrução intestinal, e o local da incisão pode desenvolver hérnia incisional (ABD).</p>`;
    }));
    card.innerHTML = '<h4>Cicatrizes</h4><p>Descreva localização, extensão e aspecto. Pergunte qual foi a cirurgia.</p>';
  }
  function peristaltismo() {
    ctrl.innerHTML = '';
    const bPlay = button({ icon: 'play', label: 'Mostrar as ondas', text: 'Mostrar as ondas', cls: 'primary' });
    ctrl.appendChild(bPlay);
    layer.innerHTML = '<path class="sf-path" d="M346 236 C310 228 270 236 236 250 C210 262 186 270 168 272"/><ellipse class="sf-wave" rx="26" ry="14" cx="-50" cy="-50"/>';
    const path = layer.querySelector('.sf-path'), wave = layer.querySelector('.sf-wave');
    card.innerHTML = '<h4>Peristaltismo visível</h4><p>Em pessoas muito magras pode ser visto normalmente, sobretudo após refeições. Com dor em cólica e vômitos, compõe o quadro de obstrução: observe origem, sentido e frequência das ondas (ABD).</p><p>Ondas da esquerda para a direita do paciente, acima do umbigo, a intervalos de cerca de 20 s, sugerem obstrução antropilórica; ondas em direção à fossa ilíaca direita, obstrução perto da válvula ileocecal.</p><p class="sf-hint">A animação encurta o intervalo real. Não use o nome "sinal de Kussmaul": o termo designa outro achado (veias jugulares) e não aparece nas referências para este fim.</p>';
    bPlay.addEventListener('click', () => {
      cancelAnimationFrame(raf);
      const len = path.getTotalLength(), t0 = performance.now();
      const step = (now) => {
        const u = ((now - t0) / 3200) % 1;
        const p = path.getPointAtLength(u * len);
        wave.setAttribute('cx', p.x); wave.setAttribute('cy', p.y);
        wave.style.opacity = Math.sin(Math.PI * u);
        if (now - t0 < 13000) raf = requestAnimationFrame(step); else wave.style.opacity = 0;
      };
      raf = requestAnimationFrame(step);
    });
  }
  const TABS = [['colateral', 'Circulação colateral', colateral], ['equi', 'Equimoses', equimoses], ['cic', 'Cicatrizes', cicatrizes], ['peri', 'Peristaltismo visível', peristaltismo]];
  const tabs = node.querySelector('.sf-tabs');
  TABS.forEach(([k, l, f], i) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: i === 0 });
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { clear(); tabs.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); f(); });
    tabs.appendChild(b);
  });
  captureKeys(node, (e) => { const g = e.target.closest?.('.sf-cic'); if (g && (e.key === 'Enter' || e.key === ' ')) { g.dispatchEvent(new Event('click')); return true; } return false; });
  colateral();
  return { deactivate: clear, pause: clear };
}

/* ---------------- hérnias e diástase ---------------- */
const HT = {
  normal: { n: 'Parede íntegra', txt: 'Ao elevar a cabeça e os ombros, os retos se contraem e a parede fica firme e lisa.' },
  diastase: { n: 'Diástase dos retos', txt: 'Separação dos músculos retos na linha média: com a contração aparece uma crista longitudinal entre o xifoide e o umbigo. Separação de 2 a 3 cm é benigna (Bates) e não é hérnia.' },
  umbilical: { n: 'Hérnia umbilical', txt: 'Abaulamento no umbigo que aumenta com o esforço (elevar a cabeça, tossir, Valsalva). A palpação avalia se é redutível. A inspeção em pé facilita o achado (ABD).' },
  incisional: { n: 'Hérnia incisional', txt: 'Abaulamento sobre uma cicatriz, que aparece ou cresce com a contração da parede. Comum após laparotomia mediana.' },
};
export function hernia(node) {
  node.classList.add('hn');
  node.innerHTML = `<div class="hn-ops"></div>
    <svg class="hn-svg" viewBox="0 0 700 290" role="img" aria-label="Perfil do abdome"><path class="fm-table" d="M20 262 H690"/><path class="hn-body"/><path class="hn-scar"/></svg>
    <div class="hn-bar"></div><div class="hn-card" aria-live="polite"></div>`;
  const body = node.querySelector('.hn-body'), scar = node.querySelector('.hn-scar');
  let tipo = 'diastase', up = 0, raf = 0;
  const b = (u) => {
    let v = 6 * Math.sin(Math.PI * u) - 3 * Math.sin(2 * Math.PI * u);
    if (tipo === 'diastase') v += up * 16 * Math.exp(-((u - 0.22) ** 2) / 0.02);
    if (tipo === 'umbilical') v += (6 + up * 16) * Math.exp(-((u - 0.43) ** 2) / 0.0015);
    if (tipo === 'incisional') v += up * 26 * Math.exp(-((u - 0.62) ** 2) / 0.004);
    return v;
  };
  const draw = () => {
    // cabeça e tronco sobem com a contração
    const head = `M40 260 L40 ${120 - up * 40} C60 ${100 - up * 40} 120 ${96 - up * 20} 170 112`;
    let d = head;
    for (let i = 0; i <= 50; i++) { const u = i / 50, x = 170 + u * 430, y = 128 + u * 22 - b(u); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; }
    body.setAttribute('d', d + ' C630 160 650 168 670 170 L670 260 Z');
    scar.setAttribute('d', tipo === 'incisional' ? 'M400 134 L470 141' : '');
    node.querySelector('.hn-card').innerHTML = `<h4>${HT[tipo].n}</h4><p>${HT[tipo].txt}</p>`;
  };
  const host = node.querySelector('.hn-ops');
  Object.entries(HT).forEach(([k, t]) => {
    const bt = button({ label: t.n, text: t.n, cls: 'chip', pressed: k === tipo });
    bt.addEventListener('click', () => { tipo = k; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === bt))); draw(); });
    host.appendChild(bt);
  });
  const bUp = button({ label: 'Elevar a cabeça e os ombros', text: 'Elevar a cabeça (contrair a parede)', cls: 'primary' });
  node.querySelector('.hn-bar').appendChild(bUp);
  bUp.addEventListener('click', () => {
    const alvo = up > 0.5 ? 0 : 1, ini = up, t0 = performance.now();
    bUp.querySelector('span').textContent = alvo ? 'Relaxar' : 'Elevar a cabeça (contrair a parede)';
    cancelAnimationFrame(raf);
    const step = (now) => { const u = prefersReducedMotion() ? 1 : Math.min(1, (now - t0) / 900); up = ini + (alvo - ini) * u; draw(); if (u < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  });
  draw();
  return {};
}
