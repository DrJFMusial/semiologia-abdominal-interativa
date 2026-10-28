/**
 * Laboratório da dor: visceral, parietal e referida, e a mudança no tempo.
 * A dor visceral fica mal localizada na linha média, no nível embriológico
 * do órgão (epigástrio, região periumbilical, hipogástrio; Bates, Fig. 11-7);
 * a parietal é localizada e piora com movimento; a referida aparece longe.
 * Modelo didático: as áreas são as clássicas, a variação individual existe.
 */
import { button, captureKeys } from '../core/ui.js';

const FX = 165, BX = 470; // centro da figura frontal e da dorsal
const body = (cx) => `<g class="dr-body"><circle cx="${cx}" cy="52" r="34"/>
  <path d="M${cx - 30} 84 L${cx - 30} 100 C${cx - 70} 104 ${cx - 110} 112 ${cx - 118} 140 L${cx - 112} 300 C${cx - 104} 360 ${cx - 100} 420 ${cx - 96} 520 L${cx + 96} 520 C${cx + 100} 420 ${cx + 104} 360 ${cx + 112} 300 L${cx + 118} 140 C${cx + 110} 112 ${cx + 70} 104 ${cx + 30} 100 L${cx + 30} 84 Z"/></g>`;
const frontMarks = `<path class="dr-mk" d="M${FX} 205 C${FX - 30} 230 ${FX - 70} 262 ${FX - 100} 285 M${FX} 205 C${FX + 30} 230 ${FX + 70} 262 ${FX + 100} 285"/><circle class="dr-umb" cx="${FX}" cy="330" r="5"/><path class="dr-mk" d="M${FX - 90} 440 C${FX - 60} 470 ${FX - 30} 495 ${FX - 10} 515 M${FX + 90} 440 C${FX + 60} 470 ${FX + 30} 495 ${FX + 10} 515"/>`;
const backMarks = `<path class="dr-mk" d="M${BX} 96 V500"/><path class="dr-mk" d="M${BX - 50} 140 C${BX - 80} 170 ${BX - 84} 210 ${BX - 60} 240 M${BX + 50} 140 C${BX + 80} 170 ${BX + 84} 210 ${BX + 60} 240"/>`;

// zonas: [tipo, x, y, rx, ry]
const Z = {
  visEpi: ['vis', FX, 245, 46, 26], visUmb: ['vis', FX, 330, 46, 26], visHipo: ['vis', FX, 425, 46, 24],
  parHD: ['par', FX - 58, 282, 26, 22], parFID: ['par', FX - 52, 420, 22, 20], parQIE: ['par', FX + 52, 420, 24, 22], parDifusa: ['par', FX, 360, 92, 120],
  refEscD: ['ref', BX + 58, 200, 28, 30], refOmbroD: ['ref', FX - 96, 126, 22, 16], refOmbroE: ['ref', FX + 96, 126, 22, 16],
  refDorso: ['ref', BX, 290, 70, 22], lombD: ['par', BX + 56, 320, 26, 34], flancoD: ['ref', FX - 92, 360, 20, 34], inguD: ['ref', FX - 50, 480, 20, 22],
};
const ORG = {
  gastro: { nome: 'Estômago e duodeno', z: () => ['visEpi'], tipo: 'Visceral (intestino anterior)', loc: 'Epigástrio, mal delimitada', car: 'Queimação, desconforto; relação com alimentação', irr: 'Geralmente não irradia; na úlcera perfurada vira dor súbita e difusa (parietal generalizada)', piora: 'Varia com o jejum e a refeição' },
  biliar: { nome: 'Vesícula e vias biliares', tempo: true, z: (t) => (t < 6 ? ['visEpi'] : ['parHD', 'refEscD']), fases: [[0, 'Cólica biliar: distensão da vesícula; dor visceral epigástrica ou no hipocôndrio direito'], [6, 'Colecistite: a inflamação atinge o peritônio parietal; dor localizada no hipocôndrio direito, piora com a inspiração; referida na escápula direita']], tipo: 'Visceral e, com inflamação, parietal', loc: 'Epigástrio e hipocôndrio direito', car: 'Constante, intensa, muitas vezes após refeição gordurosa', irr: 'Escápula direita; ombro direito se o diafragma for irritado', piora: 'Inspiração profunda (base do sinal de Murphy)' },
  pancreas: { nome: 'Pâncreas', z: () => ['visEpi', 'refDorso'], tipo: 'Visceral e retroperitoneal', loc: 'Epigástrio', car: 'Intensa, contínua', irr: 'Em faixa para o dorso', piora: 'Deitado de costas; alívio ao inclinar o tronco para frente' },
  delgado: { nome: 'Intestino delgado', z: () => ['visUmb'], tipo: 'Visceral (intestino médio)', loc: 'Periumbilical, difusa', car: 'Cólica, em ondas (distensão e contração da alça)', irr: 'Não irradia', piora: 'Na obstrução vem com vômitos e distensão' },
  apendice: { nome: 'Apêndice', tempo: true, z: (t) => (t < 8 ? ['visUmb'] : t < 13 ? ['visUmb', 'parFID'] : ['parFID']), fases: [[0, 'Início: distensão do apêndice; dor visceral periumbilical, mal localizada, com náusea'], [8, 'Transição: a inflamação começa a atingir o peritônio parietal'], [13, 'Dor parietal localizada na fossa ilíaca direita (ponto de McBurney), piora com tosse e movimento']], tipo: 'Visceral que passa a parietal (migração)', loc: 'Periumbilical → fossa ilíaca direita', car: 'Contínua e progressiva', irr: 'Apêndice retrocecal: flanco ou lombar direita; pélvico: suprapúbica', piora: 'Tosse, andar, solavanco; idosos têm a migração com menos frequência (Bates)' },
  colon: { nome: 'Cólon (sigmoide)', z: () => ['visHipo', 'parQIE'], tipo: 'Visceral (intestino posterior); parietal se inflamar', loc: 'Hipogástrio; quadrante inferior esquerdo na diverticulite', car: 'Cólica ou contínua', irr: 'Pouco', piora: 'Alivia ou piora com a evacuação' },
  rim: { nome: 'Rim e ureter', z: () => ['lombD', 'flancoD', 'inguD'], tipo: 'Visceral (cápsula renal e ureter), com irradiação', loc: 'Ângulo costovertebral e flanco', car: 'Cólica intensa (ureter) ou dor surda contínua (rim)', irr: 'Do flanco para a fossa ilíaca e a região inguinal, testículo ou grande lábio (Bates, Fig. 11-8)', piora: 'O paciente não acha posição (cólica), ao contrário da peritonite, em que fica imóvel' },
  diafragma: { nome: 'Irritação do diafragma', z: () => ['refOmbroD', 'refOmbroE'], tipo: 'Referida', loc: 'Ombro, longe da causa', car: 'Contínua', irr: 'Ombro do mesmo lado (inervação frênica, C3 a C5)', piora: 'Respiração profunda. Ex.: sangue, pus ou ar sob o diafragma' },
};

export function dor(node) {
  node.classList.add('dr');
  node.innerHTML = `
    <div class="dr-orgs" role="radiogroup" aria-label="Órgão de origem"></div>
    <div class="dr-fig"><svg viewBox="0 0 640 540" class="dr-svg" role="img" aria-label="Mapa de dor: vista frontal e dorsal">
      ${body(FX)}${frontMarks}${body(BX)}${backMarks}
      <text class="dr-vt" x="${FX}" y="536">frente</text><text class="dr-vt" x="${BX}" y="536">costas</text>
      <text class="dr-sd" x="${FX - 112}" y="95">D</text><text class="dr-sd" x="${FX + 112}" y="95">E</text>
      <text class="dr-sd" x="${BX - 112}" y="95">E</text><text class="dr-sd" x="${BX + 112}" y="95">D</text>
      <g class="dr-zones"></g></svg>
      <div class="dr-legend"><span class="vis"><i></i>Visceral: linha média, mal localizada</span><span class="par"><i></i>Parietal: localizada, piora com movimento</span><span class="ref"><i></i>Referida: longe do órgão</span></div>
    </div>
    <div class="dr-panel">
      <div class="dr-time" hidden><label>Tempo desde o início: <b class="dr-h">0 h</b><input type="range" min="0" max="24" step="1" value="0" aria-label="Horas desde o início da dor"></label><p class="dr-fase"></p></div>
      <dl class="dr-card"></dl>
      <p class="dr-note">Níveis da dor visceral: intestino anterior (estômago, duodeno, vias biliares, pâncreas) no epigástrio; intestino médio (delgado, apêndice, cólon proximal) na região periumbilical; intestino posterior (cólon distal) no hipogástrio. É um modelo embriológico útil, não um mapa exato.</p>
    </div>`;
  const zones = node.querySelector('.dr-zones');
  const card = node.querySelector('.dr-card');
  const time = node.querySelector('.dr-time');
  const range = time.querySelector('input');
  let org = 'apendice';
  const draw = () => {
    const o = ORG[org], t = Number(range.value);
    time.hidden = !o.tempo;
    zones.innerHTML = o.z(t).map((k) => { const [tp, x, y, rx, ry] = Z[k]; return `<ellipse class="dz ${tp}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`; }).join('');
    if (o.tempo) {
      node.querySelector('.dr-h').textContent = `${t} h`;
      const f = [...o.fases].reverse().find(([h]) => t >= h);
      node.querySelector('.dr-fase').textContent = f[1];
    }
    card.innerHTML = [['Tipo', o.tipo], ['Onde', o.loc], ['Caráter', o.car], ['Irradiação', o.irr], ['Piora ou alívio', o.piora]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  };
  const host = node.querySelector('.dr-orgs');
  Object.entries(ORG).forEach(([k, o]) => {
    const b = button({ label: o.nome, text: o.nome, cls: 'chip', pressed: k === org });
    b.addEventListener('click', () => { org = k; range.value = 0; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    host.appendChild(b);
  });
  range.addEventListener('input', draw);
  captureKeys(node, () => false);
  draw();
  return {};
}
