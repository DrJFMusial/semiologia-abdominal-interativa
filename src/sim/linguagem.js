/**
 * A linguagem da semiologia (componente reutilizável).
 * linguagem: classificar termos concretos nas oito categorias, com retorno
 *            que explica a distinção, não só o rótulo.
 * cadeia:    queixa → exame → achado → integração sindrômica → hipótese,
 *            percorrida pelo caso condutor, com o "salto indevido" animado.
 * Os dados ficam neste arquivo; para outra aula basta trocar CATS e CARDS.
 */
import { button, captureKeys } from '../core/ui.js';

const estudo = () => document.body.classList.contains('modo-estudo');

export const CATS = [
  { id: 'sintoma', nome: 'Sintoma', quem: 'o paciente relata', ic: 'M8 14c2 2 6 2 8 0M7 9h.01M17 9h.01' },
  { id: 'ponto', nome: 'Ponto', quem: 'referência na superfície', ic: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0' },
  { id: 'manobra', nome: 'Manobra', quem: 'técnica do examinador', ic: 'M6 14V8a2 2 0 0 1 4 0v4M10 11V6a2 2 0 0 1 4 0v6M14 11V8a2 2 0 0 1 4 0v6a6 6 0 0 1-12 0' },
  { id: 'sinal', nome: 'Sinal', quem: 'fenômeno que o examinador observa', ic: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0' },
  { id: 'achado', nome: 'Achado', quem: 'sinal descrito com local e qualidade', ic: 'M5 19l3-1 10-10-2-2L6 16l-1 3zM14 6l2 2' },
  { id: 'sindrome', nome: 'Síndrome', quem: 'conjunto de sinais e sintomas que andam juntos', ic: 'M7 8m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M17 8m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0' },
  { id: 'hipotese', nome: 'Hipótese diagnóstica', quem: 'causa provável, ainda a testar', ic: 'M9 9a3 3 0 1 1 4 2.8c-.8.4-1 1-1 2.2M12 17h.01' },
  { id: 'diagnostico', nome: 'Diagnóstico etiológico', quem: 'causa confirmada por dados além do exame', ic: 'M5 12.5l4.5 4.5L19 7.5' },
];

export const CARDS = [
  { t: 'Dor no hipocôndrio direito depois de comer', c: 'sintoma', por: 'É o que o paciente conta. Sintoma não é sinal: dor relatada não é achado de exame, ainda que aponte onde examinar.' },
  { t: 'Náuseas e vômitos', c: 'sintoma', por: 'Relato do paciente (o vômito pode ser presenciado, mas a náusea é só relatada).' },
  { t: 'Ponto de McBurney', c: 'ponto', por: 'Ponto é onde se examina: um lugar na superfície (terço lateral da linha entre a espinha ilíaca anterossuperior e o umbigo). O que o exame encontra ali é que pode ser sinal.' },
  { t: 'Ponto cístico', c: 'ponto', por: 'Referência anatômica: encontro da borda lateral do músculo reto com o rebordo costal direito. Ponto não é manobra.' },
  { t: 'Compressão do ponto cístico com inspiração profunda', c: 'manobra', por: 'É a técnica que o examinador executa (pesquisa do sinal de Murphy). A manobra é o que se faz; o sinal é o que aparece.' },
  { t: 'Descompressão brusca', c: 'manobra', por: 'Técnica: comprimir lentamente e retirar a mão de uma vez. A dor que surge na retirada é o sinal.' },
  { t: 'Interrupção da inspiração por dor', c: 'sinal', por: 'É o fenômeno observado durante a manobra: o sinal de Murphy propriamente dito. O epônimo nomeia ao mesmo tempo a manobra e o sinal; "pesquisar" e "positivo" separam os dois.' },
  { t: 'Macicez', c: 'sinal', por: 'Fenômeno percebido pelo examinador na percussão, sem epônimo. Sozinho, sem local, ainda não é um registro útil.' },
  { t: 'Dor à descompressão brusca na fossa ilíaca direita', c: 'achado', por: 'É o sinal descrito com local e qualidade, pronto para o prontuário. Achado é o que se registra.' },
  { t: 'Macicez móvel presente nos flancos', c: 'achado', por: 'Sinal de percussão com local e comportamento descritos. Ainda não diz a causa.' },
  { t: 'Irritação peritoneal', c: 'sindrome', por: 'Conjunto: defesa involuntária, dor à descompressão, dor à tosse e à percussão. Um sinal isolado não é síndrome.' },
  { t: 'Hipertensão portal', c: 'sindrome', por: 'Conjunto: circulação colateral tipo porta, esplenomegalia, ascite. Síndrome não é etiologia: cirrose e esquistossomose podem produzi-la.' },
  { t: 'Colecistite aguda, provável', c: 'hipotese', por: 'Causa provável sugerida pelo conjunto; ainda precisa ser testada.' },
  { t: 'Colecistite aguda calculosa confirmada por ultrassonografia', c: 'diagnostico', por: 'Etiologia confirmada por dado além do exame físico.' },
];

const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function linguagem(node) {
  node.classList.add('lg');
  node.innerHTML = `
    <div class="lg-pool" role="listbox" aria-label="Termos para classificar"></div>
    <ol class="lg-ladder" aria-label="Categorias, do relato do paciente ao diagnóstico">${CATS.map((c, i) => `
      <li class="lg-step" data-c="${c.id}" style="--i:${i}">
        <button type="button" class="lg-cat">${icon(c.ic)}<span><b>${c.nome}</b><em>${c.quem}</em></span></button>
        <div class="lg-slot"></div>
      </li>`).reverse().join('')}</ol>
    <div class="lg-fb" aria-live="polite"><p class="lg-hint">Escolha um termo à esquerda e depois o degrau em que ele se encaixa.</p></div>
    <div class="lg-tools"></div>`;
  const pool = node.querySelector('.lg-pool');
  const fb = node.querySelector('.lg-fb');
  let sel = null;
  const placed = new Set();
  const render = () => {
    pool.innerHTML = '';
    CARDS.forEach((c, i) => {
      if (placed.has(i)) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'lg-card' + (sel === i ? ' sel' : '');
      b.textContent = c.t; b.setAttribute('aria-pressed', String(sel === i));
      b.addEventListener('click', () => { sel = sel === i ? null : i; render(); });
      pool.appendChild(b);
    });
    if (placed.size === CARDS.length) pool.innerHTML = '<p class="lg-done">Todos os termos classificados. Repare na escada: cada degrau exige um ato diferente (relatar, localizar, executar, observar, registrar, agrupar, supor, confirmar).</p>';
  };
  const put = (i, catId) => {
    const slot = node.querySelector(`.lg-step[data-c="${catId}"] .lg-slot`);
    const chip = document.createElement('span');
    chip.className = 'lg-chip'; chip.textContent = CARDS[i].t;
    slot.appendChild(chip);
    placed.add(i);
  };
  node.querySelectorAll('.lg-cat').forEach((b) => b.addEventListener('click', () => {
    const catId = b.closest('.lg-step').dataset.c;
    if (sel === null) { const c = CATS.find((x) => x.id === catId); fb.innerHTML = `<p><b>${c.nome}</b>: ${c.quem}.</p>`; return; }
    const card = CARDS[sel];
    const step = b.closest('.lg-step');
    if (card.c === catId) {
      put(sel, catId);
      fb.innerHTML = `<p class="ok"><b>Certo.</b> ${card.por}</p>`;
      sel = null;
    } else {
      const errado = CATS.find((x) => x.id === catId).nome, certo = CATS.find((x) => x.id === card.c).nome;
      fb.innerHTML = `<p class="no"><b>Não é ${errado.toLowerCase()}.</b> ${card.por} <span class="lg-cert">Categoria: ${certo}.</span></p>`;
      step.classList.remove('shake'); void step.offsetWidth; step.classList.add('shake');
    }
    render();
  }));
  const bAll = button({ label: 'Mostrar todas as respostas', text: 'Mostrar respostas', cls: 'ghost' });
  const bReset = button({ icon: 'restart', label: 'Recomeçar', text: 'Recomeçar', cls: 'ghost' });
  bAll.addEventListener('click', () => { CARDS.forEach((c, i) => { if (!placed.has(i)) put(i, c.c); }); sel = null; render(); fb.innerHTML = '<p>Respostas mostradas. Toque num degrau para rever a definição.</p>'; });
  bReset.addEventListener('click', () => { placed.clear(); sel = null; node.querySelectorAll('.lg-slot').forEach((s) => { s.innerHTML = ''; }); fb.innerHTML = '<p class="lg-hint">Escolha um termo e depois o degrau.</p>'; render(); });
  node.querySelector('.lg-tools').append(bAll, bReset);
  render();
  return {};
}

/* ------------------------------------------------------------------------ */
const ESTACOES = [
  { k: 'queixa', n: 'Queixa', c: 'Dor intensa no hipocôndrio direito há 12 horas, após refeição, com febre, náuseas e vômitos.' },
  { k: 'exame', n: 'Exame', c: 'Inspeção, ausculta, percussão e palpação; no hipocôndrio direito, compressão do ponto cístico durante inspiração profunda.' },
  { k: 'achado', n: 'Achado', c: 'Dor à palpação do hipocôndrio direito; sinal de Murphy positivo (a inspiração para por dor); taquicardia; olhos fundos.' },
  { k: 'sindrome', n: 'Integração sindrômica', c: 'Dor abdominal aguda inflamatória localizada no hipocôndrio direito, com repercussão sistêmica (febre, taquicardia, desidratação).' },
  { k: 'hipotese', n: 'Hipótese etiológica', c: 'Colecistite aguda como principal hipótese; diferenciais: cólica biliar, hepatite aguda, pneumonia de base direita. Ultrassonografia para testar.' },
];
const FERNANDA = [
  { n: 'Queixa', ops: ['Dor em cólica na região lombar direita há 1 hora, irradiando para o abdome, com disúria e polaciúria', 'Ureterolitíase', 'Sinal de Giordano'], ok: 0 },
  { n: 'Exame', ops: ['Tomografia sem contraste', 'Punho-percussão lombar e palpação do abdome e dos flancos', 'Escala de dor de 0 a 10'], ok: 1 },
  { n: 'Achado', ops: ['Cólica nefrética', 'Punho-percussão lombar dolorosa à direita; dor à palpação do flanco e da fossa ilíaca direita, sem descompressão dolorosa', 'Pielonefrite'], ok: 1 },
  { n: 'Integração sindrômica', ops: ['Dor lombar aguda em cólica com sintomas urinários (padrão de cólica nefrética)', 'Apendicite aguda', 'Punho-percussão positiva'], ok: 0 },
  { n: 'Hipótese etiológica', ops: ['Ureterolitíase à direita, a confirmar por imagem; diferenciais: pielonefrite, apendicite, causa ginecológica', 'Diagnóstico confirmado de cálculo', 'Síndrome de irritação peritoneal'], ok: 0 },
];

export function cadeia(node) {
  node.classList.add('cd');
  node.innerHTML = `
    <svg class="cd-jump" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><path d="M500 110 C560 6 820 6 900 110"/></svg>
    <ol class="cd-track">${ESTACOES.map((e, i) => `<li class="cd-st" data-i="${i}">
      <button type="button" class="cd-h" aria-expanded="false"><span class="cd-n">${i + 1}</span><span>${e.n}</span></button>
      <p class="cd-c">${e.c}</p></li>`).join('')}</ol>
    <div class="cd-bar"></div>
    <p class="cd-msg" aria-live="polite"></p>
    <div class="cd-ex estudo-only">
      <h4>Exercício: monte a cadeia da Sra. Fernanda, 40 anos</h4>
      <div class="cd-ex-rows"></div>
    </div>`;
  const sts = [...node.querySelectorAll('.cd-st')];
  const msg = node.querySelector('.cd-msg');
  const open = (s, on) => { s.classList.toggle('open', on); s.querySelector('.cd-h').setAttribute('aria-expanded', String(on)); };
  sts.forEach((s) => s.querySelector('.cd-h').addEventListener('click', () => open(s, !s.classList.contains('open'))));
  const bNext = button({ icon: 'next', label: 'Próxima estação', text: 'Próxima estação', cls: 'primary' });
  const bJump = button({ label: 'Mostrar o salto indevido', text: 'O salto indevido', cls: 'ghost' });
  const bReset = button({ icon: 'restart', label: 'Recomeçar' });
  node.querySelector('.cd-bar').append(bNext, bJump, bReset);
  bNext.addEventListener('click', () => { const s = sts.find((x) => !x.classList.contains('open')); if (s) open(s, true); });
  bReset.addEventListener('click', () => { sts.forEach((s) => open(s, false)); node.classList.remove('jump'); msg.textContent = ''; });
  bJump.addEventListener('click', () => {
    node.classList.remove('jump'); void node.offsetWidth; node.classList.add('jump');
    open(sts[2], true);
    msg.innerHTML = '<b>"Murphy positivo, logo colecistite."</b> O salto do achado direto para a etiologia pula a integração: Murphy tem sensibilidade de 65% e especificidade de 87% (ABD), e outras causas de dor no hipocôndrio direito precisam ser consideradas antes de afirmar a causa.';
  });
  // exercício (modo estudo)
  const rows = node.querySelector('.cd-ex-rows');
  FERNANDA.forEach((r, i) => {
    const d = document.createElement('div');
    d.className = 'cd-ex-row';
    d.innerHTML = `<p class="cd-ex-n">${i + 1}. ${r.n}</p><div class="cd-ex-ops"></div><p class="cd-ex-fb"></p>`;
    r.ops.forEach((o, j) => {
      const b = button({ label: o, text: o, cls: 'chip' });
      b.addEventListener('click', () => {
        d.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        d.querySelector('.cd-ex-fb').textContent = j === r.ok ? 'Certo.' : `Não: "${o}" pertence a outra estação da cadeia.`;
        d.querySelector('.cd-ex-fb').className = `cd-ex-fb ${j === r.ok ? 'ok' : 'no'}`;
      });
      d.querySelector('.cd-ex-ops').appendChild(b);
    });
    rows.appendChild(d);
  });
  captureKeys(node, () => false);
  const sync = () => { if (estudo()) sts.forEach((s) => open(s, true)); };
  sync();
  return { activate: sync };
}
