/**
 * Abdome paramétrico em vista frontal (viewBox 0 0 500 640), usado pelo
 * atlas, pela percussão, pela hepatimetria, pelo laboratório da dor e pelos
 * exploradores de órgãos. Convenção anatômica: o lado DIREITO do paciente
 * fica à ESQUERDA de quem olha.
 * As formas são esquemáticas; as relações (órgão sob o rebordo, órgão que
 * atravessa regiões, deslocamento na inspiração) são as que importam.
 */
export const VB = '0 0 500 640';

export const L = {
  xifoide: [250, 122], umbigo: [250, 335], eiasD: [138, 445], eiasE: [362, 445], pube: [250, 592],
  costelaD: [120, 262], costelaE: [380, 262],
  mcburney: [175, 408], cistico: [202, 174], rovsing: [325, 408],
  lhcD: 172, lhcE: 328,
};

export const TORSO = 'M112 0 C104 90 92 170 92 250 C92 300 100 330 96 380 C92 430 100 480 128 540 C160 590 210 614 250 616 C290 614 340 590 372 540 C400 480 408 430 404 380 C400 330 408 300 408 250 C408 170 396 90 388 0 Z';
const MARGEM_D = 'M250 120 C226 150 170 205 120 262';
const MARGEM_E = 'M250 120 C274 150 330 205 380 262';
const RETO_D = 'M202 174 C192 250 190 380 222 578';
const RETO_E = 'M298 174 C308 250 310 380 278 578';
const INGU_D = 'M138 445 C170 500 200 545 230 584';
const INGU_E = 'M362 445 C330 500 300 545 270 584';
const CRISTA_D = 'M102 380 C110 410 124 432 138 445';
const CRISTA_E = 'M398 380 C390 410 376 432 362 445';

/** Corpo, rebordos, umbigo e referências ósseas. */
export function base({ marcos = true, retos = false } = {}) {
  return `<g class="ab-base">
    <path class="ab-skin" d="${TORSO}"/>
    <path class="ab-ribs" d="M118 40 C170 70 210 92 250 96 C290 92 330 70 382 40 M108 100 C160 130 210 150 250 152 M392 100 C340 130 290 150 250 152"/>
    <path class="ab-margin" d="${MARGEM_D}"/><path class="ab-margin" d="${MARGEM_E}"/>
    <path class="ab-xif" d="M244 112 L250 132 L256 112 Z"/>
    ${retos ? `<path class="ab-rectus" d="${RETO_D}"/><path class="ab-rectus" d="${RETO_E}"/>` : ''}
    <path class="ab-crest" d="${CRISTA_D}"/><path class="ab-crest" d="${CRISTA_E}"/>
    <path class="ab-ingu" d="${INGU_D}"/><path class="ab-ingu" d="${INGU_E}"/>
    <ellipse class="ab-umb" cx="250" cy="335" rx="6" ry="8"/>
    <circle class="ab-nip" cx="166" cy="34" r="5"/><circle class="ab-nip" cx="334" cy="34" r="5"/>
    ${marcos ? `<g class="ab-marcos"><circle cx="138" cy="445" r="5"/><circle cx="362" cy="445" r="5"/><circle cx="250" cy="592" r="5"/></g>` : ''}
  </g>`;
}

/* ---------- regiões ---------- */
const OBL = { d: [[152, 236], [214, 586]], e: [[348, 236], [286, 586]] };
const xAt = (seg, y) => { const [[x1, y1], [x2, y2]] = seg; return x1 + ((y - y1) / (y2 - y1)) * (x2 - x1); };
export function regioes(conv = 'hemi') {
  const v = conv === 'hemi'
    ? `<path d="M172 96 V588 M328 96 V588"/>`
    : `<path d="M${OBL.d[0]} L${OBL.d[1]} M${OBL.e[0]} L${OBL.e[1]}"/><path class="arq" d="M250 128 C230 150 190 196 152 236 M250 128 C270 150 310 196 348 236"/>`;
  return `<g class="ab-reg ${conv}">${v}<path d="M96 262 H404 M110 445 H390"/>${conv === 'hemi' ? '<path d="M150 122 H350"/>' : ''}</g>`;
}
export const NOMES9 = [
  ['hd', 'Hipocôndrio direito'], ['epi', 'Epigástrio'], ['he', 'Hipocôndrio esquerdo'],
  ['fd', 'Flanco direito'], ['meso', 'Mesogástrio'], ['fe', 'Flanco esquerdo'],
  ['fid', 'Fossa ilíaca direita'], ['hipo', 'Hipogástrio'], ['fie', 'Fossa ilíaca esquerda'],
];
export const NOMES4 = { qsd: 'Quadrante superior direito', qse: 'Quadrante superior esquerdo', qid: 'Quadrante inferior direito', qie: 'Quadrante inferior esquerdo' };
export const ROT9 = { hd: [135, 205], epi: [250, 205], he: [365, 205], fd: [120, 360], meso: [250, 395], fe: [380, 360], fid: [150, 505], hipo: [250, 520], fie: [350, 505] };

/** Região (das nove) que contém o ponto, para a convenção escolhida. */
export function regiaoEm(x, y, conv = 'hemi') {
  const linha = y < 262 ? 0 : y < 445 ? 1 : 2;
  let xd = 172, xe = 328;
  if (conv !== 'hemi') { const yy = Math.max(236, y); xd = xAt(OBL.d, yy); xe = xAt(OBL.e, yy); }
  const col = x < xd ? 0 : x < xe ? 1 : 2;
  return NOMES9[linha * 3 + col][0];
}
export function quadranteEm(x, y) { return (y < 335 ? 'qs' : 'qi') + (x < 250 ? 'd' : 'e'); }
export function quadrantes() { return '<g class="ab-quad"><path d="M250 20 V600 M96 335 H404"/></g>'; }

/* ---------- órgãos ---------- */
export const ORGAOS = {
  figado: { nome: 'Fígado', prof: 'sup', mov: 1, d: 'M96 168 C120 128 200 118 262 122 C300 124 330 140 338 160 C330 182 300 196 268 204 C220 222 160 248 122 286 C108 268 98 220 96 168 Z' },
  vesicula: { nome: 'Vesícula biliar', prof: 'prof', mov: 1, el: [200, 226, 11, 24, -18] },
  estomago: { nome: 'Estômago', prof: 'sup', mov: 0.4, d: 'M290 150 C330 140 372 160 378 200 C384 250 360 300 312 312 C286 318 262 306 256 290 C276 290 300 280 312 262 C324 240 318 200 290 180 Z' },
  baco: { nome: 'Baço', prof: 'prof', mov: 1, el: [388, 214, 21, 44, 22] },
  pancreas: { nome: 'Pâncreas', prof: 'retro', mov: 0.2, d: 'M214 282 C250 270 300 262 352 248 C358 256 352 264 340 268 C300 280 260 294 222 300 Z' },
  duodeno: { nome: 'Duodeno', prof: 'retro', mov: 0.2, line: 'M232 238 C210 252 204 300 226 314 C246 322 262 310 268 298' },
  delgado: { nome: 'Intestino delgado', prof: 'sup', mov: 0, d: 'M196 360 C230 342 270 344 304 360 C336 380 330 430 310 470 C290 510 230 516 200 494 C170 470 166 400 196 360 Z' },
  colon: { nome: 'Cólon', prof: 'sup', mov: 0, line: 'M150 492 C128 470 128 380 136 312 C150 292 180 300 210 330 C240 354 270 354 300 330 C330 300 356 292 370 302 C380 360 378 430 362 480 C352 520 322 540 292 550' },
  ceco: { nome: 'Ceco e apêndice', prof: 'sup', mov: 0, el: [152, 486, 18, 18, 0], extra: 'M160 502 C168 522 180 534 196 538' },
  rins: { nome: 'Rins', prof: 'retro', mov: 0.6, els: [[188, 318, 23, 46, -10], [314, 300, 23, 46, 10]] },
  bexiga: { nome: 'Bexiga (cheia)', prof: 'sup', mov: 0, el: [250, 560, 42, 26, 0] },
  aorta: { nome: 'Aorta e ilíacas', prof: 'retro', mov: 0, line: 'M256 150 V352 M256 352 L212 440 M256 352 L300 440' },
};
const elp = ([cx, cy, rx, ry, rot]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"/>`;
/** insp: 0 (expiração) a 1 (inspiração profunda); desloca fígado, vesícula, baço e rins. */
export function orgao(k, { insp = 0, cls = '' } = {}) {
  const o = ORGAOS[k];
  const dy = (o.mov || 0) * insp * 26;
  let s = '';
  if (o.d) s += `<path d="${o.d}"/>`;
  if (o.el) s += elp(o.el);
  if (o.els) s += o.els.map(elp).join('');
  if (o.line) s += `<path class="ln" d="${o.line}"/>`;
  if (o.extra) s += `<path class="ln thin" d="${o.extra}"/>`;
  return `<g class="org org-${k} ${o.prof} ${cls}" data-org="${k}" transform="translate(0 ${dy.toFixed(1)})">${s}</g>`;
}
export const TRAUBE = 'M262 72 L398 106 C402 160 404 210 404 250 C380 262 360 246 338 222 C310 190 284 158 262 130 Z';
