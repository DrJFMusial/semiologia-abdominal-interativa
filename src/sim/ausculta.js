/**
 * Ausculta.
 * auscConv: onde e quanto tempo auscultar segundo cada referência (as
 *           recomendações divergem; ABD diz que não são consensuais) e os
 *           pontos de pesquisa de sopros (Bates, fig. 19.11).
 * sons:     gravações curtas de acervo de terceiros (procedência não
 *           verificada) para conhecer o timbre, e ruídos ESQUEMÁTICOS para a
 *           contagem em janelas diferentes e o efeito do tempo de escuta.
 */
import { VB, base, quadrantes } from '../core/abdomen.js';
import { RHA, renderRHA, renderSopro } from '../core/synth.js';
import { toBuffer, playBuffer, stopCurrent } from '../core/audio.js';
import { button, captureKeys, setIcon } from '../core/ui.js';
import { ACERVO, loadAcervo } from '../core/acervo.js';

const CONV = {
  bates: { n: 'Bates', pts: [[175, 405]], txt: 'Diafragma sobre a pele; ouvir em um ponto, como o quadrante inferior direito, costuma ser suficiente, porque os ruídos se propagam por todo o abdome. Frequência estimada de 5 a 34 por minuto. Para afirmar ausência, ouvir por 2 minutos ou mais.' },
  swartz: { n: 'Swartz', pts: [[250, 360]], txt: 'Diafragma no mesoabdome. Ruídos normais a cada 5 a 10 segundos. Se nada for ouvido em 2 minutos, registrar "ruídos ausentes".' },
  abd: { n: 'ABD', pts: [[172, 250], [328, 250], [172, 420], [328, 420], [250, 292], [250, 380]], txt: 'Centro de cada quadrante por 10 a 15 segundos e, depois, pelo menos dois pontos acima e abaixo do umbigo. O próprio capítulo afirma que tempo mínimo e número de pontos não são consensuais e que o efeito estimulante da palpação não foi comprovado.' },
  sopros: { n: 'Pesquisa de sopros', pts: [[256, 228], [206, 282], [306, 282], [216, 420], [296, 420], [196, 590], [304, 590]], nomes: ['aorta', 'renal direita', 'renal esquerda', 'ilíaca direita', 'ilíaca esquerda', 'femoral direita', 'femoral esquerda'], txt: 'Aorta no epigástrio, artérias renais nos quadrantes superiores, ilíacas e femorais (Bates, fig. 19.11). Sopros aparecem em 4% a 20% das pessoas saudáveis (Bates; ABD cita 7% a 31%). Sopro epigástrico com componentes sistólico e diastólico em hipertenso sugere estenose de artéria renal, mas a ausência não a afasta.' },
};

export function auscConv(node) {
  node.classList.add('ac');
  node.innerHTML = `<div class="ac-tabs" role="radiogroup" aria-label="Convenção"></div>
    <svg class="ac-svg" viewBox="${VB}" role="img" aria-label="Pontos de ausculta">${base()}${quadrantes()}<g class="ac-pts"></g></svg>
    <div class="ac-card" aria-live="polite"></div>`;
  const pts = node.querySelector('.ac-pts'), card = node.querySelector('.ac-card');
  const show = (k) => {
    const c = CONV[k];
    pts.innerHTML = c.pts.map(([x, y], i) => `<g class="ac-pt ${k === 'sopros' ? 'v' : ''}" style="--d:${i * 0.12}s"><circle cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y + 5}">${i + 1}</text></g>`).join('');
    card.innerHTML = `<h4>${c.n}</h4><p>${c.txt}</p>${c.nomes ? `<p class="ac-l">${c.nomes.map((n, i) => `${i + 1} ${n}`).join(' · ')}</p>` : ''}${k !== 'sopros' ? '<p class="tag div">Fontes divergem</p>' : ''}`;
  };
  const host = node.querySelector('.ac-tabs');
  Object.entries(CONV).forEach(([k, c], i) => {
    const b = button({ label: c.n, text: c.n, cls: 'seg', pressed: i === 0 });
    b.addEventListener('click', () => { host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); show(k); });
    host.appendChild(b);
  });
  show('bates');
  return {};
}

/* ------------------------------------------------------------------------ */
const SOPROS = {
  sistolico: { nome: 'Sopro sistólico (aorta, epigástrio)', desc: 'Sopro que acompanha a sístole, ouvido sobre a aorta. Pode ser inocente em jovem assintomático (curto, suave, mesossistólico; ABD).' },
  continuo: { nome: 'Sopro sistólico e diastólico (renal)', desc: 'Componente que se estende à diástole: em hipertenso, sugere estenose de artéria renal (Bates, ABD).' },
};

export function sons(node) {
  node.classList.add('sn');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="sn-side">
      <div class="sn-fonte" role="radiogroup" aria-label="Tipo de som"></div>
      <div class="sn-ops" role="radiogroup" aria-label="Padrão"></div>
    </div>
    <div class="sn-main">
      <canvas class="sn-wave" aria-label="Traçado do som"></canvas>
      <div class="sn-bar"><span class="tag esq sn-tag"></span></div>
      <div class="sn-card" aria-live="polite"></div>
    </div>
    <div class="sn-ex">
      <h4>Exercício: quantos eventos por minuto?</h4>
      <p>Ouça a janela e conte os eventos (cliques e gorgolejos). Depois sorteie outra janela do mesmo padrão e compare.</p>
      <div class="sn-win" role="radiogroup" aria-label="Duração da janela"></div>
      <div class="sn-ans"><label>Eventos contados <input type="number" min="0" max="200" inputmode="numeric"></label></div>
      <div class="sn-tools"></div>
      <div class="sn-res" aria-live="polite"></div>
    </div>
    <div class="sn-rec">
      <h4>Gravações curtas: para que servem</h4>
      <p>Os trechos têm cerca de 5 segundos. Servem para conhecer o timbre de cada achado.</p>
      <p>Contar ruídos e afirmar ausência exige escuta longa (2 minutos ou mais para dizer "ausentes"): faça o exercício de contagem em <b>Sons esquemáticos</b>, com janelas de 15 a 60 segundos.</p>
      <p>Sons sintetizados pelo autor para fins didáticos. Os trechos ilustram timbres e não permitem, isoladamente, classificar a frequência dos ruídos, afirmar ausência ou diagnosticar íleo.</p>
    </div>`;
  const cv = node.querySelector('.sn-wave');
  const card = node.querySelector('.sn-card');
  const res = node.querySelector('.sn-res');
  const inp = node.querySelector('.sn-ans input');
  const tag = node.querySelector('.sn-tag');
  let fonte = 'rec', tipo = 'normal', win = 30, seed = 7, cur = null, play = null, raf = 0, shown = false, token = 0;
  const isRec = () => fonte === 'rec';
  const make = async () => {
    const my = ++token;
    shown = false; res.innerHTML = ''; inp.value = '';
    node.querySelector('.sn-ex').hidden = isRec() || !!SOPROS[tipo];
    node.querySelector('.sn-rec').hidden = !isRec();
    if (isRec()) {
      const f = ACERVO[tipo];
      card.innerHTML = `<h4>${f.nome}</h4><p>${f.desc}</p><p class="sn-orig">Identificador do som: <span class="mono">${f.original}</span>. O traçado é ajustado ao pico de cada trecho; ao ouvir, o volume é o original.</p>`;
      tag.textContent = 'Sons sintetizados pelo autor para fins didáticos.';
      tag.className = 'tag rec sn-tag';
      cur = null; paint(0); bPlay.disabled = true;
      try {
        const r = await loadAcervo(tipo);
        if (my !== token) return;
        cur = { ...r, events: [] };
      } catch (e) { if (my === token) card.insertAdjacentHTML('beforeend', `<p class="no">${e.message}</p>`); return; }
    } else {
      if (SOPROS[tipo]) { const r = renderSopro(tipo, 8); cur = { ...r, events: [] }; }
      else cur = renderRHA(tipo, win, seed);
      const p = RHA[tipo] || SOPROS[tipo];
      card.innerHTML = `<h4>${p.nome}</h4><p>${p.desc}</p>`;
      tag.textContent = 'Som sintetizado esquemático, não é gravação clínica';
      tag.className = 'tag esq sn-tag';
    }
    cur.buf = toBuffer(cur.data, cur.sr);
    bPlay.disabled = false;
    paint(0);
  };
  const paint = (pos) => {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const colors = getComputedStyle(document.documentElement);
    g.fillStyle = colors.getPropertyValue('--surface').trim() || '#fff'; g.fillRect(0, 0, w, h);
    if (!cur) return;
    const d = cur.data, n = d.length, mid = h / 2;
    const dur = n / cur.sr;
    g.fillStyle = colors.getPropertyValue('--ink-3').trim(); g.font = '11px Inter, sans-serif';
    for (let s = 0; s <= dur; s += dur > 20 ? 5 : 1) { const x = (s / dur) * w; g.fillRect(x, h - 14, 1, 6); g.fillText(`${s}s`, x + 2, h - 2); }
    if (shown) {
      g.fillStyle = 'rgba(201,138,18,.18)';
      cur.events.forEach((e) => g.fillRect((e.t / dur) * w, 6, Math.max(2, (e.len / dur) * w), h - 24));
    }
    // gravações: escala pelo pico do trecho, para que o traçado seja visível mesmo nos trechos baixos
    let pk = 1;
    if (isRec()) { pk = 0; for (let i = 0; i < n; i += 4) pk = Math.max(pk, Math.abs(d[i])); pk = Math.max(pk, 0.02); }
    g.strokeStyle = colors.getPropertyValue(isRec() ? '--ok' : '--petrol').trim(); g.lineWidth = 1; g.beginPath();
    const step = n / w;
    for (let x = 0; x < w; x++) {
      let m = 0; const a = Math.floor(x * step), b = Math.min(n, Math.floor((x + 1) * step));
      for (let i = a; i < b; i++) m = Math.max(m, Math.abs(d[i]));
      m = Math.min(1, m / pk);
      g.moveTo(x + 0.5, mid - m * (mid - 14)); g.lineTo(x + 0.5, mid + m * (mid - 14));
    }
    g.stroke();
    if (pos > 0) { g.fillStyle = '#c3323c'; g.fillRect(pos * w, 0, 2, h); }
  };
  const bPlay = button({ icon: 'play', label: 'Ouvir', text: 'Ouvir', cls: 'primary' });
  node.querySelector('.sn-bar').prepend(bPlay);
  const stop = () => { cancelAnimationFrame(raf); play?.stop(); play = null; setIcon(bPlay, 'play'); paint(0); };
  bPlay.addEventListener('click', () => {
    if (play) { stop(); return; }
    if (!cur?.buf) return;
    play = playBuffer(cur.buf, { loop: !isRec() && !!SOPROS[tipo], onEnd: () => { play = null; setIcon(bPlay, 'play'); cancelAnimationFrame(raf); paint(0); } });
    setIcon(bPlay, 'pause');
    const tick = () => { if (!play) return; const t = (play.ctx.currentTime - play.startedAt) % play.duration; paint(Math.max(0, t / play.duration)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  });
  const ops = node.querySelector('.sn-ops');
  const buildOps = () => {
    ops.replaceChildren();
    const lista = isRec() ? Object.entries(ACERVO).map(([k, f]) => [k, f.nome]) : [...Object.entries(RHA), ...Object.entries(SOPROS)].map(([k, p]) => [k, p.nome]);
    lista.forEach(([k, nome]) => {
      const b = button({ label: nome, text: nome, cls: 'chip', pressed: k === tipo });
      b.addEventListener('click', () => { stop(); hist.length = 0; tipo = k; ops.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); make(); });
      ops.appendChild(b);
    });
  };
  const fh = node.querySelector('.sn-fonte');
  [['rec', 'Sons do autor'], ['sint', 'Sons esquemáticos']].forEach(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: k === fonte });
    b.addEventListener('click', () => {
      if (fonte === k) return;
      stop(); hist.length = 0; fonte = k; tipo = isRec() ? 'normal' : 'posprandial';
      fh.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      buildOps(); make();
    });
    fh.appendChild(b);
  });
  const wh = node.querySelector('.sn-win');
  [15, 30, 60].forEach((s) => {
    const b = button({ label: `${s} segundos`, text: `${s} s`, cls: 'seg', pressed: s === win });
    b.addEventListener('click', () => { stop(); win = s; wh.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); make(); });
    wh.appendChild(b);
  });
  const bCheck = button({ label: 'Conferir a contagem', text: 'Conferir', cls: 'ghost' });
  const bNew = button({ icon: 'restart', label: 'Sortear outra janela do mesmo padrão', text: 'Outra janela', cls: 'ghost' });
  node.querySelector('.sn-tools').append(bCheck, bNew);
  const hist = [];
  bCheck.addEventListener('click', () => {
    if (!cur) return;
    const n = cur.events.length, perMin = Math.round((n * 60) / win);
    shown = true; paint(0);
    const dado = inp.value === '' ? null : Number(inp.value);
    hist.push(perMin);
    res.innerHTML = `<p><b>${n} eventos</b> nesta janela de ${win} s, cerca de <b>${perMin} por minuto</b>.${dado !== null ? ` Você contou ${dado}.` : ''} Eventos marcados no traçado.</p>
      ${hist.length > 1 ? `<p>Estimativas das janelas já conferidas: ${hist.join(', ')} por minuto. A mesma atividade dá contagens diferentes conforme o momento e a duração da escuta: por isso um número isolado não classifica o paciente.</p>` : ''}`;
  });
  bNew.addEventListener('click', () => { stop(); seed = (seed * 7 + 13) % 997; make(); });
  captureKeys(node, (e) => e.target === inp && e.key.length === 1);
  buildOps(); make();
  window.addEventListener('e2m08-theme-change', () => paint(0));
  const ro = new ResizeObserver(() => paint(0)); ro.observe(cv);
  return { deactivate: stop, pause: stop, activate() { paint(0); } };
}

export { stopCurrent };
