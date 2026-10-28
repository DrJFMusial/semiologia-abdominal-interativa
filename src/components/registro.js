/**
 * Construtor de registro do exame do abdome: cada linha do prontuário tem
 * opções; o texto segue a ordem do exame e o que difere do normal fica
 * destacado. Avisos apontam combinações incoerentes entre técnicas.
 * Atalhos: "Exame normal" e os casos da aula.
 */
import { button } from '../core/ui.js';

const LINHAS = [
  { id: 'insp', rot: 'Inspeção', ops: [
    ['Abdome plano, simétrico, sem cicatrizes, abaulamentos, circulação colateral ou peristaltismo visível. Cicatriz umbilical intrusa.', 'normal'],
    ['Abdome globoso, flancos abaulados, cicatriz umbilical plana; circulação colateral periumbilical com fluxo centrífugo (tipo porta).', 'ascite e colateral porta'],
    ['Abdome distendido, simétrico, com peristaltismo visível.', 'distensão e peristaltismo'],
    ['Abdome plano, pouco móvel com a respiração; paciente imóvel.', 'imóvel'],
  ] },
  { id: 'ausc', rot: 'Ausculta', ops: [
    ['RHA presentes.', 'presentes'],
    ['RHA diminuídos.', 'diminuídos'],
    ['RHA aumentados, com timbre metálico.', 'aumentados, metálicos'],
    ['RHA ausentes após 2 minutos de ausculta.', 'ausentes (2 min)'],
  ] },
  { id: 'perc', rot: 'Percussão', ops: [
    ['Timpânico, sem macicez anormal.', 'timpânico'],
    ['Timpanismo central e macicez de flancos, com macicez móvel.', 'macicez móvel'],
    ['Hipertimpânico difusamente.', 'hipertimpânico'],
    ['Timpânico; percussão dolorosa na FID.', 'dolorosa na FID'],
    ['Timpânico; percussão dolorosa no hipocôndrio direito.', 'dolorosa no HD'],
  ] },
  { id: 'hep', rot: 'Hepatimetria', ops: [
    ['Hepatimetria de 10 cm na LHC direita.', '10 cm'],
    ['Hepatimetria de 16 cm na LHC direita.', '16 cm'],
    ['Macicez hepática ausente.', 'macicez ausente'],
  ] },
  { id: 'traube', rot: 'Espaço de Traube', ops: [
    ['Espaço de Traube livre.', 'livre'],
    ['Espaço de Traube maciço.', 'maciço'],
  ] },
  { id: 'palp', rot: 'Palpação', ops: [
    ['Flácido, indolor à palpação superficial e profunda, sem massas.', 'normal'],
    ['Dor à palpação do hipocôndrio direito, com rigidez localizada.', 'dor e rigidez no HD'],
    ['Dor no ponto de McBurney, com rigidez localizada.', 'dor e rigidez na FID'],
    ['Rigidez generalizada ("em tábua").', 'rigidez generalizada'],
    ['Defesa voluntária difusa, que cede com relaxamento; indolor.', 'defesa voluntária'],
  ] },
  { id: 'desc', rot: 'Descompressão', ops: [
    ['Descompressão brusca indolor.', 'indolor'],
    ['Descompressão brusca dolorosa na FID.', 'dolorosa na FID'],
    ['Descompressão dolorosa difusa.', 'dolorosa difusa'],
  ] },
  { id: 'murphy', rot: 'Sinal de Murphy', ops: [
    ['Sinal de Murphy negativo.', 'negativo'],
    ['Sinal de Murphy positivo.', 'positivo'],
  ] },
  { id: 'fig', rot: 'Fígado', ops: [
    ['Fígado não palpável.', 'não palpável'],
    ['Fígado palpável a 6 cm do RCD na LHC, borda romba, superfície lisa, consistência firme, indolor.', 'a 6 cm do RCD'],
    ['Fígado palpável a 2 cm do RCD na inspiração, borda fina, lisa, indolor.', 'borda a 2 cm'],
  ] },
  { id: 'baco', rot: 'Baço', ops: [
    ['Baço não palpável.', 'não palpável'],
    ['Baço palpável a 6 cm do RCE, firme, indolor.', 'a 6 cm do RCE'],
  ] },
  { id: 'punho', rot: 'Punho-percussão lombar', ops: [
    ['Punho-percussão lombar indolor bilateralmente.', 'indolor'],
    ['Punho-percussão lombar dolorosa à direita.', 'dolorosa à direita'],
  ] },
];
const P = (o) => ({ insp: 0, ausc: 0, perc: 0, hep: 0, traube: 0, palp: 0, desc: 0, murphy: 0, fig: 0, baco: 0, punho: 0, ...o });
const PRESETS = {
  normal: ['Exame normal', P({})],
  carlos: ['Sr. Carlos', P({ perc: 4, palp: 1, murphy: 1 })],
  jose: ['Sr. José', P({ insp: 1, perc: 1, traube: 1, baco: 1 })],
  valeria: ['Sra. Valéria', P({ insp: 3, ausc: 1, perc: 3, palp: 2, desc: 1 })],
};

export function registro(node) {
  node.classList.add('registro');
  node.innerHTML = `
    <div class="rg-left"><div class="rg-presets"></div><div class="rg-rows"></div></div>
    <div class="rg-right">
      <div class="rg-sheet mono" aria-live="polite"></div>
      <div class="rg-check" aria-live="polite"></div>
      <details class="rg-siglas"><summary>Siglas</summary>
        <dl><div><dt>RHA</dt><dd>ruídos hidroaéreos</dd></div><div><dt>LHC</dt><dd>linha hemiclavicular</dd></div>
          <div><dt>RCD</dt><dd>rebordo costal direito</dd></div><div><dt>RCE</dt><dd>rebordo costal esquerdo</dd></div>
          <div><dt>HD</dt><dd>hipocôndrio direito</dd></div><div><dt>FID</dt><dd>fossa ilíaca direita</dd></div></dl></details>
    </div>`;
  const st = { ...PRESETS.normal[1] };
  const rows = node.querySelector('.rg-rows');
  const sheet = node.querySelector('.rg-sheet');
  const check = node.querySelector('.rg-check');
  const btns = {};
  for (const l of LINHAS) {
    const r = document.createElement('div'); r.className = 'rg-row';
    r.innerHTML = `<p class="rg-l">${l.rot}</p><div class="rg-ops" role="radiogroup" aria-label="${l.rot}"></div>`;
    btns[l.id] = l.ops.map(([, lab], i) => {
      const b = button({ label: `${l.rot}: ${lab}`, text: lab, cls: 'chip' });
      b.setAttribute('role', 'radio');
      b.addEventListener('click', () => { st[l.id] = i; render(); });
      r.querySelector('.rg-ops').appendChild(b); return b;
    });
    rows.appendChild(r);
  }
  function coerencia() {
    const m = [];
    if (st.perc === 1 && st.insp === 0) m.push('Macicez móvel com abdome plano é improvável: a ascite detectável ao exame costuma abaular os flancos.');
    if (st.traube === 1 && st.baco === 0 && st.perc !== 1) m.push('Traube maciço sem baço palpável é possível (esplenomegalia discreta, estômago cheio, derrame pleural), mas pede explicação no registro.');
    if (st.hep === 2 && st.desc === 0 && st.palp === 0) m.push('Macicez hepática ausente sugere ar livre ou interposição de alças; em paciente com dor aguda, descreva a dor e procure sinais peritoneais.');
    if (st.desc !== 0 && st.palp === 0) m.push('Descompressão dolorosa com abdome flácido e indolor é combinação incomum: revise a palpação no mesmo local.');
    if (st.desc === 2 && st.palp !== 3) m.push('Descompressão dolorosa difusa costuma vir com rigidez generalizada.');
    if (st.palp === 3 && st.ausc === 2) m.push('Rigidez generalizada com RHA aumentados e metálicos é incomum; na peritonite difusa os ruídos costumam diminuir.');
    if (st.murphy === 1 && st.palp !== 1) m.push('Murphy positivo sem dor no hipocôndrio direito é incoerente: o sinal é a dor que interrompe a inspiração naquele ponto.');
    if (st.fig === 1 && st.hep === 0) m.push('Fígado palpável a 6 cm com hepatimetria de 10 cm: o órgão está rebaixado, não aumentado? Registre as duas medidas e a sua interpretação.');
    if (st.hep === 1 && st.fig === 0) m.push('Hepatimetria aumentada com fígado não palpável: confira a percussão (derrame pleural direito ou consolidação elevam o limite superior).');
    return m;
  }
  function render() {
    for (const l of LINHAS) btns[l.id].forEach((b, i) => { b.setAttribute('aria-pressed', String(st[l.id] === i)); b.setAttribute('aria-checked', String(st[l.id] === i)); });
    sheet.innerHTML = `<p class="rg-h">Abdome</p>${LINHAS.map((l) => `<p class="${st[l.id] ? 'alt' : ''}">${l.ops[st[l.id]][0]}</p>`).join('')}`;
    const c = coerencia();
    check.innerHTML = c.length ? `<div class="fb no">${c.map((x) => `<p>${x}</p>`).join('')}</div>` : '';
  }
  const pr = node.querySelector('.rg-presets');
  Object.values(PRESETS).forEach(([l, v]) => {
    const b = button({ label: `Preencher: ${l}`, text: l, cls: 'ghost' });
    b.addEventListener('click', () => { Object.assign(st, v); render(); });
    pr.appendChild(b);
  });
  render();
  return {};
}
