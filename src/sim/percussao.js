/**
 * Percussão abdominal (sons ESQUEMÁTICOS).
 * percAbd:      mapa do abdome; o som depende do que há sob o ponto (gás,
 *               sólido, líquido). Macicez diz "não há gás", não diz o quê.
 * hepatimetria: medida da macicez hepática na linha hemiclavicular direita
 *               e os erros que a deslocam; espaço de Traube e sinal de Castell.
 */
import { VB, base, orgao, TRAUBE } from '../core/abdomen.js';
import { PERCUSSAO, renderPercussao } from '../core/synth.js';
import { toBuffer, playOneShot } from '../core/audio.js';
import { button, captureKeys } from '../core/ui.js';

const bufs = {};
const buf = (k) => { if (!bufs[k]) { const r = renderPercussao(k); bufs[k] = toBuffer(r.data, r.sr); } return bufs[k]; };
const tocar = (k) => playOneShot(buf(k));

function tecnica() {
  const dedo = (d, cls = '') => `<path class="pc-f-out ${cls}" d="${d}"/><path class="pc-f-in ${cls}" d="${d}"/>`;
  return `<svg class="pc-tec" viewBox="0 0 400 250" role="img" aria-label="Técnica dígito-digital: só o dedo médio de uma mão encosta na pele; o dedo médio da outra mão, fletido, golpeia a base da falange distal">
    <defs><marker id="pa-ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect class="pc-tissue" x="0" y="196" width="400" height="54"/><path class="pc-skin" d="M0 196H400"/>
    ${dedo('M40 120 C70 112 100 100 128 96', 'lift')}${dedo('M40 132 C76 128 106 122 138 120', 'lift')}
    <path class="pc-hand" d="M0 110 C20 104 44 108 56 118 C64 128 60 146 46 152 C30 158 10 156 0 152 Z"/>
    ${dedo('M44 146 L120 168 L184 184 L262 185')}
    <path class="pc-joint" d="M184 176V194M120 160V176"/>
    <path class="pc-hand" d="M318 30 C346 24 376 34 386 54 C392 70 380 90 360 94 C340 98 318 92 306 82 C296 70 300 40 318 30 Z"/>
    ${dedo('M312 74 C282 80 240 96 218 124 C202 144 194 158 190 170')}
    <circle class="pc-hit" cx="186" cy="180" r="11"/>
    <path class="pc-arrow" d="M392 104 C404 84 402 50 380 28" marker-end="url(#pa-ah)"/>
    <text class="pc-l" x="164" y="244">golpe na base da falange distal</text>
    <text class="pc-l" x="10" y="226">só o dedo médio encosta</text>
    <text class="pc-l" x="296" y="122">movimento</text><text class="pc-l" x="296" y="138">do punho</text>
  </svg>`;
}

/* ---------------- mapa ---------------- */
const borda = (x) => 160 + (338 - x) * (126 / 216); // borda inferior do fígado (esquema)
const noFigado = (x, y, extra = 0) => x < 338 && y > 118 && y < borda(x) + extra;
const COND = {
  normal: { n: 'Normal', t: 'Timpanismo na maior parte do abdome (gás nas alças); macicez sobre o fígado no hipocôndrio direito e no epigástrio alto; o hipogástrio é timpânico com a bexiga vazia.' },
  bexiga: { n: 'Bexiga cheia', t: 'Macicez suprapúbica de convexidade superior. Só aparece a partir de 400 a 600 mL (Bates).' },
  gas: { n: 'Distensão gasosa', t: 'Hipertimpanismo difuso; a macicez hepática pode encolher porque alças com gás se interpõem.' },
  arlivre: { n: 'Ar livre (pneumoperitônio)', t: 'Desaparecimento da macicez hepática em paciente com dor aguda intensa pode indicar perfuração de víscera oca (ABD). A imagem confirma.' },
  ascite: { n: 'Ascite em decúbito dorsal', t: 'Macicez nos flancos e no hipogástrio, timpanismo central (alças com gás flutuam). Mudar o decúbito testa se a macicez se move: veja o laboratório da ascite.' },
  hepatomeg: { n: 'Hepatomegalia', t: 'A macicez hepática desce além do rebordo. Confirme o limite inferior pela palpação e meça na linha hemiclavicular.' },
  massa: { n: 'Fezes ou massa na fossa ilíaca esquerda', t: 'Macicez localizada. A percussão diz que ali não há gás; a palpação e a história dizem o que é.' },
  peritonite: { n: 'Irritação peritoneal na fossa ilíaca direita', t: 'Som normal, mas a percussão dói no local: percussão dolorosa é sinal de irritação peritoneal e dói menos que a descompressão (Bates).' },
};
function somEm(cond, x, y) {
  const dol = cond === 'peritonite' && Math.hypot(x - 175, y - 410) < 70;
  let s;
  if (cond === 'arlivre') s = 'timpanico';
  else if (noFigado(x, y, cond === 'hepatomeg' ? 90 : 0)) s = cond === 'gas' ? 'submacico' : 'macico';
  else if (cond === 'bexiga' && ((x - 250) ** 2) / 70 ** 2 + ((y - 560) ** 2) / 50 ** 2 < 1) s = 'macico';
  else if (cond === 'ascite' && (x < 165 || x > 335 || y > 480)) s = (x < 140 || x > 360 || y > 520) ? 'macico' : 'submacico';
  else if (cond === 'massa' && Math.hypot(x - 340, y - 490) < 50) s = 'macico';
  else s = cond === 'gas' ? 'hiper' : 'timpanico';
  return { s, dol };
}
const PTS = [];
[[180, [132, 190, 250, 310, 368]], [250, [128, 190, 250, 310, 372]], [320, [124, 190, 250, 310, 376]], [400, [124, 190, 250, 310, 376]], [470, [140, 200, 250, 300, 360]], [545, [190, 250, 310]]].forEach(([y, xs]) => xs.forEach((x) => PTS.push([x, y])));

export function percAbd(node) {
  node.classList.add('pa');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="pa-left">${tecnica()}
      <ol class="steps pc-steps"><li>Só o dedo médio da mão não dominante <b>firme na pele</b>; os outros levantados.</li><li>O dedo médio da outra mão golpeia a <b>base da falange distal</b>, com movimento do punho.</li><li>Percorra linhas longitudinais ou "raios" a partir do umbigo (ABD), comparando os lados.</li></ol>
    </div>
    <div class="pa-map"><svg class="pa-svg" viewBox="${VB}" role="group" aria-label="Mapa de percussão do abdome"></svg></div>
    <div class="pa-panel">
      <div class="pa-cond" role="radiogroup" aria-label="Condição"></div>
      <div class="pa-res" aria-live="polite"></div>
      <div class="pa-card"></div>
      <div class="pc-legend">${Object.entries(PERCUSSAO).filter(([k]) => k !== 'claro').map(([k, p]) => `<span class="pc-lg ${k}"><i></i>${p.nome}</span>`).join('')}</div>
      <div class="pa-tools"></div>
      <span class="tag esq">Sons sintetizados esquemáticos</span>
    </div>`;
  const svg = node.querySelector('.pa-svg'), res = node.querySelector('.pa-res'), card = node.querySelector('.pa-card');
  let cond = 'normal', mostrar = false;
  const done = new Map();
  const draw = () => {
    const orgs = cond === 'hepatomeg' ? '<path class="org-fig-big" d="M96 168 C120 128 200 118 262 122 C300 124 330 140 338 170 C330 220 300 250 268 270 C220 300 160 330 122 370 C104 330 98 240 96 168 Z"/>' : orgao('figado');
    const extra = cond === 'bexiga' ? orgao('bexiga') : cond === 'ascite' ? '<path class="pa-liq" d="M96 300 C96 420 110 520 170 580 C210 606 290 606 330 580 C390 520 404 420 404 300 C380 330 360 360 350 400 C330 470 290 500 250 500 C210 500 170 470 150 400 C140 360 120 330 96 300 Z"/>' : cond === 'massa' ? '<ellipse class="pa-massa" cx="340" cy="490" rx="40" ry="30"/>' : '';
    svg.innerHTML = `${base()}<g class="pa-orgs ${mostrar ? '' : 'hide'}">${orgs}${extra}</g>` + PTS.map(([x, y], i) => {
      const k = `${x},${y}`, r = done.get(k);
      return `<g class="pc-pt ${r ? `sel ${r.s}` : ''}" data-i="${i}" tabindex="0" role="button" aria-label="Percutir este ponto"><circle class="halo" cx="${x}" cy="${y}" r="17"/><circle class="dot" cx="${x}" cy="${y}" r="8"/></g>`;
    }).join('');
    svg.querySelectorAll('.pc-pt').forEach((g) => g.addEventListener('click', () => hit(PTS[g.dataset.i])));
    card.innerHTML = `<h4>${COND[cond].n}</h4><p>${COND[cond].t}</p>`;
  };
  const hit = ([x, y]) => {
    const r = somEm(cond, x, y);
    tocar(r.s); done.set(`${x},${y}`, r);
    const s = PERCUSSAO[r.s];
    res.innerHTML = `<p class="pc-name ${r.s}">${s.nome}</p><p>${s.desc}</p>${r.dol ? '<p class="pa-dor">O paciente refere dor à percussão neste ponto.</p>' : ''}`;
    draw();
  };
  const host = node.querySelector('.pa-cond');
  Object.entries(COND).forEach(([k, c]) => {
    const b = button({ label: c.n, text: c.n, cls: 'chip', pressed: k === cond });
    b.addEventListener('click', () => { cond = k; done.clear(); res.innerHTML = '<p class="pc-hint">Toque nos pontos para percutir.</p>'; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    host.appendChild(b);
  });
  const bAll = button({ label: 'Percutir todos os pontos', text: 'Mapear tudo', cls: 'ghost' });
  const bOrg = button({ label: 'Mostrar o que está embaixo', text: 'Mostrar o que está embaixo', cls: 'ghost', pressed: false });
  bAll.addEventListener('click', () => { PTS.forEach(([x, y]) => done.set(`${x},${y}`, somEm(cond, x, y))); draw(); res.innerHTML = '<p>Mapa completo. Compare as cores com a legenda.</p>'; });
  bOrg.addEventListener('click', () => { mostrar = !mostrar; bOrg.setAttribute('aria-pressed', String(mostrar)); draw(); });
  node.querySelector('.pa-tools').append(bAll, bOrg);
  res.innerHTML = '<p class="pc-hint">Toque nos pontos para percutir.</p>';
  captureKeys(node, (e) => { const g = e.target.closest?.('.pc-pt'); if (g && (e.key === 'Enter' || e.key === ' ')) { g.dispatchEvent(new Event('click')); return true; } return false; });
  draw();
  return {};
}

/* ---------------- hepatimetria, Traube, Castell ---------------- */
// linha hemiclavicular direita; escala 10 px = 1 cm; y=0 no 2º espaço intercostal
const EIC = [[0, '2º EIC'], [34, '3º'], [68, '4º'], [102, '5º'], [136, '6º'], [170, '7º']];
const HC = {
  normal: { n: 'Normal', sup: 102, inf: 202, t: 'Som claro pulmonar até o 5º espaço; macicez hepática; timpanismo do cólon abaixo da borda. Hepatimetria de 10 cm.' },
  hepatomeg: { n: 'Hepatomegalia', sup: 102, inf: 272, t: 'O limite inferior desce: 17 cm. Confirme pela palpação e descreva a borda.' },
  colon: { n: 'Cólon distendido no hipocôndrio direito', sup: 102, inf: 170, t: 'Gás no cólon encobre a macicez da parte baixa do fígado: hepatimetria falsamente menor, 6 cm (Bates, Swartz).' },
  dpoc: { n: 'DPOC (hiperinsuflação)', sup: 146, inf: 246, t: 'O diafragma baixo empurra o fígado para baixo: os dois limites descem, mas a extensão continua 10 cm (Bates). Borda palpável não é hepatomegalia.' },
  derrame: { n: 'Derrame pleural direito', sup: 52, inf: 202, t: 'A macicez do líquido se soma à do fígado: o limite superior parece subir e a hepatimetria fica falsamente maior, 15 cm (Bates).' },
  arlivre: { n: 'Ar livre sob o diafragma', sup: 150, inf: 172, t: 'Ar entre o fígado e a parede reduz ou abole a macicez hepática (Bates, ABD).' },
};
const MCL_X = 230, Y0 = 70;
export function hepatimetria(node) {
  node.classList.add('hp');
  node.tabIndex = 0;
  node.innerHTML = `<div class="hp-tabs" role="tablist"></div><div class="hp-body"></div>`;
  const body = node.querySelector('.hp-body');
  const tabs = node.querySelector('.hp-tabs');
  const T = [['hep', 'Hepatimetria', hep], ['tr', 'Espaço de Traube e sinal de Castell', traube]];
  T.forEach(([k, l, f], i) => { const b = button({ label: l, text: l, cls: 'seg', pressed: i === 0 }); b.setAttribute('role', 'tab'); b.addEventListener('click', () => { tabs.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); f(); }); tabs.appendChild(b); });

  function hep() {
    let cond = 'normal';
    const marks = new Map();
    body.innerHTML = `<div class="hp-wrap">
      <svg class="hp-svg" viewBox="0 0 460 520" role="group" aria-label="Linha hemiclavicular direita">
        <path class="hp-trunk" d="M90 0 C80 160 70 300 76 440 C100 500 300 520 420 500 L420 0 Z"/>
        <g class="hp-layers"></g>
        <g class="hp-eic">${EIC.map(([y, l]) => `<path d="M150 ${Y0 + y} H310"/><text x="96" y="${Y0 + y + 4}">${l}</text>`).join('')}</g>
        <path class="hp-margin" d="M140 ${Y0 + 196} C200 ${Y0 + 206} 300 ${Y0 + 212} 400 ${Y0 + 190}"/><text class="hp-mt" x="320" y="${Y0 + 186}">rebordo costal</text>
        <path class="hp-mcl" d="M${MCL_X} 10 V505"/><text class="hp-mt" x="${MCL_X + 8}" y="22">linha hemiclavicular direita</text>
        <g class="hp-pts"></g><g class="hp-ruler"></g>
      </svg>
      <div class="hp-panel">
        <div class="hp-cond" role="radiogroup" aria-label="Condição"></div>
        <div class="hp-tools"></div>
        <div class="hp-res" aria-live="polite"></div>
        <div class="hp-ref"><p><b>Referências</b> (linha hemiclavicular direita): Bates 6 a 12 cm; ABD até 12 cm (até 5 cm na paraesternal); Swartz até 10 cm.</p><p class="tag div">Fontes divergem</p><p>A extensão percutida tem correlação de 60% a 70% com a real (Bates). O limite inferior é mais bem definido pela palpação (ABD).</p></div>
      </div></div>`;
    const pts = body.querySelector('.hp-pts'), lay = body.querySelector('.hp-layers'), ruler = body.querySelector('.hp-ruler'), res = body.querySelector('.hp-res');
    const som = (y) => { const c = HC[cond]; if (cond === 'arlivre') return y < c.sup ? 'claro' : y < c.inf ? 'submacico' : 'timpanico'; return y < c.sup ? (cond === 'derrame' && y >= c.sup - 1 ? 'macico' : 'claro') : y < c.inf ? 'macico' : 'timpanico'; };
    const draw = () => {
      const c = HC[cond];
      lay.innerHTML = `<rect class="hp-lung" x="80" y="0" width="340" height="${Y0 + Math.min(c.sup, 102)}"/>
        ${cond === 'derrame' ? `<rect class="hp-liq" x="80" y="${Y0 + c.sup}" width="340" height="${102 - c.sup + 14}"/>` : ''}
        <path class="hp-liver" d="M80 ${Y0 + (cond === 'derrame' ? 102 : c.sup) + (cond === 'arlivre' ? -40 : 0)} C200 ${Y0 + (cond === 'dpoc' ? 136 : 92)} 330 ${Y0 + (cond === 'dpoc' ? 140 : 96)} 420 ${Y0 + (cond === 'dpoc' ? 150 : 110)} L420 ${Y0 + (cond === 'hepatomeg' ? 220 : 170)} C330 ${Y0 + (cond === 'hepatomeg' ? 260 : 190)} 240 ${Y0 + (cond === 'colon' ? 202 : c.inf)} 80 ${Y0 + (cond === 'colon' ? 202 : c.inf) + 30} Z"/>
        ${cond === 'arlivre' ? `<path class="hp-air" d="M80 ${Y0 + 104} C200 ${Y0 + 96} 330 ${Y0 + 100} 420 ${Y0 + 112} L420 ${Y0 + 146} C330 ${Y0 + 150} 200 ${Y0 + 150} 80 ${Y0 + 152} Z"/>` : ''}
        ${cond === 'colon' ? `<ellipse class="hp-gas" cx="${MCL_X}" cy="${Y0 + 185}" rx="70" ry="26"/>` : ''}`;
      pts.innerHTML = Array.from({ length: 38 }, (_, i) => i * 10).map((y) => {
        const m = marks.get(y);
        return `<g class="hp-pt ${m || ''}" data-y="${y}" tabindex="0" role="button" aria-label="Percutir a ${y / 10} cm abaixo do 2º espaço"><circle cx="${MCL_X}" cy="${Y0 + y}" r="6.5"/></g>`;
      }).join('');
      pts.querySelectorAll('.hp-pt').forEach((g) => g.addEventListener('click', () => { const y = Number(g.dataset.y); const s = som(y); tocar(s); marks.set(y, s); draw(); res.innerHTML = `<p class="pc-name ${s}">${PERCUSSAO[s].nome}</p><p>${y / 10} cm abaixo do 2º espaço intercostal.</p>`; }));
    };
    const walk = () => {
      marks.clear(); ruler.innerHTML = '';
      const c = HC[cond];
      const ys = Array.from({ length: 38 }, (_, i) => i * 10);
      const up = ys.find((y) => som(y) !== 'claro'), low = [...ys].reverse().find((y) => som(y) !== 'timpanico');
      let i = 0;
      const seq = [...ys.filter((y) => y <= (up ?? 0)), ...[...ys].reverse().filter((y) => y >= (low ?? 999))];
      const go = () => {
        if (i >= seq.length) {
          if (up == null || low == null || low < up) { res.innerHTML = '<p><b>Sem macicez hepática definida.</b> Pense em ar livre ou interposição de alças.</p>'; return; }
          const cm = (low - up) / 10 + 1;
          ruler.innerHTML = `<path class="hp-rl" d="M${MCL_X + 40} ${Y0 + up} V${Y0 + low}"/><path class="hp-rl t" d="M${MCL_X + 32} ${Y0 + up} h16 M${MCL_X + 32} ${Y0 + low} h16"/><text class="hp-rt" x="${MCL_X + 54}" y="${Y0 + (up + low) / 2 + 6}">${cm} cm</text>`;
          res.innerHTML = `<p class="hp-big">${cm} cm</p><p>${c.t}</p>`;
          return;
        }
        const y = seq[i++]; const s = som(y); marks.set(y, s); tocar(s); draw();
        setTimeout(go, 230);
      };
      go();
    };
    const host = body.querySelector('.hp-cond');
    Object.entries(HC).forEach(([k, c]) => {
      const b = button({ label: c.n, text: c.n, cls: 'chip', pressed: k === cond });
      b.addEventListener('click', () => { cond = k; marks.clear(); ruler.innerHTML = ''; res.innerHTML = `<p>${c.t}</p>`; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
      host.appendChild(b);
    });
    const bWalk = button({ icon: 'play', label: 'Percutir de cima para baixo e de baixo para cima', text: 'Percutir a linha e medir', cls: 'primary' });
    bWalk.addEventListener('click', walk);
    body.querySelector('.hp-tools').appendChild(bWalk);
    res.innerHTML = `<p>Percuta de cima para baixo a partir do 2º espaço até a macicez, e de baixo para cima a partir do quadrante inferior até a macicez (Bates). Meça a distância entre os dois limites.</p>`;
    draw();
  }

  function traube() {
    let cond = 'normal', insp = false;
    const TC = {
      normal: { n: 'Normal', baco: [388, 214, 21, 44, 22], t: 'Timpanismo no espaço de Traube (bolha de ar do estômago). O baço normal fica atrás das costelas, posterolateral.' },
      espleno: { n: 'Esplenomegalia', baco: [352, 262, 46, 92, 30], t: 'O baço cresce para baixo, para a frente e em direção ao umbigo, substituindo o timpanismo do Traube por macicez.' },
      refeicao: { n: 'Logo depois de comer', baco: [388, 214, 21, 44, 22], t: 'Estômago cheio de alimento ou cólon com fezes também tornam o Traube maciço (Bates): falso positivo. Percuta antes da refeição ou repita depois.' },
    };
    const PT = [[290, 150], [330, 140], [370, 150], [320, 190], [360, 200], [395, 230]];
    const CAST = [398, 252];
    body.innerHTML = `<div class="hp-wrap">
      <svg class="tr-svg" viewBox="150 40 300 300" role="group" aria-label="Espaço de Traube">${base({ marcos: false })}<path class="tr-area" d="${TRAUBE}"/><g class="tr-org"></g><path class="tr-aal" d="M398 40 V340"/><text class="hp-mt" x="402" y="56">linha axilar anterior</text><g class="tr-pts"></g></svg>
      <div class="hp-panel"><div class="hp-cond" role="radiogroup"></div><div class="tr-cast"></div><div class="hp-res" aria-live="polite"></div>
        <div class="hp-ref"><p><b>Evidência.</b> Percussão para esplenomegalia: sensibilidade 60% a 80%, especificidade 72% a 94% (Bates). Macicez no Traube: sensibilidade 11% a 76%, especificidade 63% a 95% (ABD, Tabela 12.5). Baço palpável é mais convincente que a percussão (ABD).</p><p class="tag div">Faixas amplas: o achado sugere, não confirma</p></div></div></div>`;
    const svg = body.querySelector('.tr-svg'), res = body.querySelector('.hp-res');
    const draw = () => {
      const c = TC[cond], [cx, cy, rx, ry, rot] = c.baco, dy = insp ? 22 : 0;
      svg.querySelector('.tr-org').innerHTML = `<ellipse class="tr-baco" cx="${cx}" cy="${cy + dy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy + dy})"/>${cond === 'refeicao' ? '<path class="tr-food" d="M290 160 C320 150 360 160 370 190 C360 220 320 226 296 210 Z"/>' : ''}`;
      svg.querySelector('.tr-pts').innerHTML = [...PT, CAST].map(([x, y], i) => `<g class="pc-pt ${i === PT.length ? 'cast' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${i === PT.length ? 'Ponto do sinal de Castell' : 'Percutir o espaço de Traube'}"><circle class="halo" cx="${x}" cy="${y}" r="11"/><circle class="dot" cx="${x}" cy="${y}" r="5"/></g>`).join('');
      svg.querySelectorAll('.pc-pt').forEach((g) => g.addEventListener('click', () => {
        const i = Number(g.dataset.i);
        let s;
        if (i === PT.length) s = cond === 'espleno' && insp ? 'macico' : cond === 'refeicao' ? 'submacico' : 'timpanico';
        else s = cond === 'refeicao' ? 'macico' : cond === 'espleno' && i >= 3 ? 'macico' : 'timpanico';
        tocar(s); g.classList.add('sel', s);
        res.innerHTML = `<p class="pc-name ${s}">${PERCUSSAO[s].nome}</p><p>${i === PT.length ? `Sinal de Castell, ${insp ? 'na inspiração profunda' : 'na expiração'}: espaço intercostal mais baixo na linha axilar anterior esquerda. ${cond === 'espleno' ? (insp ? 'Ficou maciço na inspiração: sinal positivo (o baço aumentado desceu até o ponto).' : 'Ainda timpânico: agora peça inspiração profunda.') : 'Continua timpânico: sinal negativo.'}` : c.t}</p>`;
      }));
    };
    const host = body.querySelector('.hp-cond');
    Object.entries(TC).forEach(([k, c]) => { const b = button({ label: c.n, text: c.n, cls: 'chip', pressed: k === cond }); b.addEventListener('click', () => { cond = k; insp = false; bI.setAttribute('aria-pressed', 'false'); host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); res.innerHTML = `<p>${c.t}</p>`; draw(); }); host.appendChild(b); });
    const bI = button({ label: 'Inspiração profunda (sinal de Castell)', text: 'Inspiração profunda', cls: 'ghost', pressed: false });
    bI.addEventListener('click', () => { insp = !insp; bI.setAttribute('aria-pressed', String(insp)); draw(); res.innerHTML = '<p>Percuta de novo o ponto do sinal de Castell (círculo na linha axilar anterior).</p>'; });
    body.querySelector('.tr-cast').appendChild(bI);
    res.innerHTML = `<p>${TC.normal.t}</p>`;
    draw();
  }
  captureKeys(node, (e) => { const g = e.target.closest?.('.pc-pt, .hp-pt'); if (g && (e.key === 'Enter' || e.key === ' ')) { g.dispatchEvent(new Event('click')); return true; } return false; });
  hep();
  return {};
}
