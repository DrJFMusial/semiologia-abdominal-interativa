/**
 * Paciente virtual: quatro casos percorridos em oito etapas, da queixa ao
 * registro. O componente organiza o raciocínio (achado → síndrome →
 * hipóteses com dados a favor, contra e o exame que testaria cada uma).
 * NÃO é um sistema de diagnóstico: não calcula probabilidade nem emite
 * diagnóstico; as hipóteses são apresentadas como hipóteses a testar.
 */
import { VB, base, regioes, regiaoEm, NOMES9, ROT9 } from '../core/abdomen.js';
import { button, captureKeys } from '../core/ui.js';

const NOME = Object.fromEntries(NOMES9);
const ETAPAS = ['Queixa', 'Localização', 'Ordem do exame', 'Achados', 'Normal ou alterado', 'Síndrome', 'Hipóteses', 'Registro'];
const TEC = [['insp', 'Inspeção'], ['ausc', 'Ausculta'], ['perc', 'Percussão'], ['palp', 'Palpação']];

const CASOS = {
  carlos: {
    n: 'Sr. Carlos, 48 anos', q: '“Doutor, desde ontem à noite estou com uma dor forte aqui do lado direito, embaixo das costelas.”',
    vit: 'FC 108 bpm · PA 128/80 mmHg · T 38,3 °C · FR 20 irpm',
    perg: [
      ['Quando começou e como?', 'Há cerca de 12 horas, uma a duas horas depois de um jantar com feijoada. Começou no "estômago" e foi para o lado direito.'],
      ['Já teve dor parecida?', 'Duas vezes no último ano, mas passava sozinha em poucas horas.'],
      ['Irradia?', 'Para as costas, embaixo da escápula direita.'],
      ['Piora com algo?', 'Quando respiro fundo e com o balanço do carro.'],
      ['Sintomas associados?', 'Náuseas, dois vômitos, calafrios. Não reparou olhos amarelos, urina escura ou fezes claras.'],
      ['Tosse, falta de ar, dor no peito?', 'Não.'],
    ],
    reg: ['hd'], regFb: 'Hipocôndrio direito, com início epigástrico: a dor visceral da vesícula começa mal localizada e se fixa no hipocôndrio quando o peritônio parietal é atingido.',
    ordem: 'Comece a palpação pelo quadrante inferior esquerdo, longe do hipocôndrio direito.',
    ach: {
      insp: ['Fácies de dor; evita respirar fundo', 'Abdome plano, simétrico, sem cicatrizes ou circulação colateral', 'Escleras anictéricas'],
      ausc: ['Ruídos hidroaéreos presentes'],
      perc: ['Timpanismo habitual; hepatimetria de 10 cm na linha hemiclavicular direita', 'Percussão dolorosa no hipocôndrio direito'],
      palp: ['Dor à palpação do hipocôndrio direito, com rigidez localizada (não cede com relaxamento)', 'Sinal de Murphy: inspiração interrompida por dor', 'Fígado e baço não palpáveis; sem massas', 'Sem dor à descompressão fora do hipocôndrio direito', 'Punho-percussão lombar indolor'],
    },
    cls: [['Ruídos hidroaéreos presentes', 0], ['Hepatimetria de 10 cm', 0], ['Percussão dolorosa no hipocôndrio direito', 1], ['Rigidez localizada no hipocôndrio direito', 1], ['Sinal de Murphy positivo', 1], ['Escleras anictéricas', 0], ['Punho-percussão lombar indolor', 0], ['T 38,3 °C e FC 108 bpm', 1]],
    sin: [
      ['Dor abdominal aguda inflamatória, com irritação peritoneal localizada no hipocôndrio direito e resposta sistêmica', 1, 'Sim: febre, taquicardia, dor que piora com a respiração, rigidez e percussão dolorosa no mesmo lugar.'],
      ['Síndrome ictérica', 0, 'Não há icterícia, colúria ou acolia. Manter em mente se aparecerem.'],
      ['Abdome agudo perfurativo com peritonite generalizada', 0, 'A irritação está localizada, a macicez hepática está preservada e não há rigidez difusa.'],
      ['Colecistite aguda', 0, 'Isso é uma hipótese etiológica, não uma síndrome. Volte uma estação na cadeia.'],
    ],
    hip: [
      { h: 'Colecistite aguda', f: 'Dor no hipocôndrio direito há mais de 6 horas após refeição, febre, Murphy positivo, episódios prévios autolimitados (cólica biliar)', c: 'Nada no exame contraria; Murphy isolado não confirma', e: 'Ultrassonografia de abdome; hemograma e proteína C reativa' },
      { h: 'Coledocolitíase ou colangite', f: 'Litíase biliar provável, febre', c: 'Sem icterícia, colúria ou acolia', e: 'Bilirrubinas, fosfatase alcalina, gama-GT; via biliar na ultrassonografia' },
      { h: 'Pancreatite aguda', f: 'Dor epigástrica inicial, vômitos, provável litíase', c: 'Dor fixou-se no hipocôndrio direito, não em faixa', e: 'Lipase' },
      { h: 'Pneumonia de base direita', f: 'Febre e dor que piora na inspiração', c: 'Sem tosse ou dispneia; falta o exame do tórax', e: 'Exame do tórax; radiografia se alterado' },
      { h: 'Síndrome coronariana aguda de parede inferior', f: 'Homem de 48 anos com dor alta e náuseas', c: 'Dor que piora com a respiração e a palpação, febre', e: 'Eletrocardiograma: barato e rápido para não esquecer' },
    ],
    rg: 'Abdome plano, simétrico, sem cicatrizes ou circulação colateral. RHA presentes. Timpânico, hepatimetria de 10 cm na LHC direita; percussão dolorosa no hipocôndrio direito. Dor à palpação do hipocôndrio direito com rigidez localizada; sinal de Murphy positivo. Fígado e baço não palpáveis. Sem massas. Descompressão indolor fora do hipocôndrio direito. Punho-percussão lombar indolor bilateralmente.',
  },
  jose: {
    n: 'Sr. José, 55 anos', q: '“Minha barriga foi crescendo de uns dois meses para cá, e as pernas incham no fim do dia.”',
    vit: 'FC 88 bpm · PA 110/70 mmHg · T 36,6 °C · FR 18 irpm',
    perg: [
      ['De onde é?', 'Nasceu no interior de Minas Gerais; na infância nadava no rio e na lagoa perto de casa.'],
      ['Bebe álcool?', 'Cerveja aos fins de semana há 30 anos, "umas seis latas por dia de jogo".'],
      ['Teve sangramento?', 'Há um ano vomitou sangue uma vez; não procurou atendimento.'],
      ['Dor na barriga?', 'Só um peso. Sem febre.'],
      ['Confusão, sonolência?', 'A esposa acha que ele anda mais esquecido.'],
      ['Transfusões, tatuagens, outros?', 'Nega transfusões. Uma tatuagem feita em casa há 25 anos.'],
    ],
    reg: ['meso', 'fd', 'fe', 'hipo'], regFb: 'A queixa é de aumento de volume difuso, não de dor localizada. Nessa etapa, o mais útil é reconhecer que se trata de distensão global e investigar os "F" da distensão (líquido, gás, gordura, fezes, feto, massa).',
    ordem: 'Inspeção em pé e deitado; antes de percutir, observe a forma do abdome em decúbito e a direção do fluxo nas veias.',
    ach: {
      insp: ['Abdome globoso, flancos abaulados ("abdome de batráquio") e cicatriz umbilical plana', 'Circulação colateral periumbilical: acima do umbigo o fluxo sobe, abaixo desce', 'Aranhas vasculares no tórax, eritema palmar, ginecomastia'],
      ausc: ['Ruídos hidroaéreos presentes'],
      perc: ['Timpanismo central e macicez nos flancos, com concavidade superior', 'Macicez móvel: os flancos clareiam ao mudar de decúbito', 'Espaço de Traube maciço'],
      palp: ['Baço palpável a 6 cm do rebordo costal esquerdo, firme, indolor', 'Lobo esquerdo do fígado palpável no epigástrio, endurecido, borda romba; lobo direito não palpável', 'Sem dor ou rigidez'],
    },
    cls: [['Flancos abaulados', 1], ['Fluxo venoso que sobe acima do umbigo e desce abaixo dele', 1], ['Ruídos hidroaéreos presentes', 0], ['Macicez móvel', 1], ['Traube maciço', 1], ['Baço palpável a 6 cm', 1], ['Ausência de dor e de rigidez', 0]],
    sin: [
      ['Síndrome de hipertensão portal com ascite', 1, 'Sim: ascite, circulação colateral de tipo porta e esplenomegalia, com hematêmese prévia.'],
      ['Síndrome de insuficiência hepatocelular', 1, 'Provável e concomitante: aranhas vasculares, eritema palmar, ginecomastia e alteração cognitiva (encefalopatia?). Os exames vão quantificar.'],
      ['Obstrução da veia cava inferior', 0, 'Na obstrução da cava o fluxo nas veias da parede abdominal SOBE também abaixo do umbigo.'],
      ['Cirrose alcoólica', 0, 'É hipótese etiológica. Antes, nomeie a síndrome.'],
    ],
    hip: [
      { h: 'Cirrose (álcool, vírus da hepatite C ou ambos)', f: 'Consumo de álcool prolongado, tatuagem caseira, estigmas de insuficiência hepática, ascite', c: 'Não há contradição no exame', e: 'Função hepática (albumina, tempo de protrombina, bilirrubinas), sorologias para hepatites B e C, ultrassonografia com Doppler' },
      { h: 'Esquistossomose hepatoesplênica', f: 'Procedência de área endêmica, banhos de rio, esplenomegalia volumosa, lobo esquerdo aumentado, hematêmese', c: 'Ascite e estigmas de insuficiência hepática são incomuns na forma pura, em que a função hepática costuma estar preservada', e: 'Exame parasitológico de fezes (Kato-Katz); ultrassonografia (fibrose periportal)' },
      { h: 'Trombose da veia porta', f: 'Esplenomegalia e varizes', c: 'Estigmas de doença hepática crônica; ascite é menos comum na trombose crônica isolada', e: 'Ultrassonografia com Doppler' },
      { h: 'Doença hematológica com esplenomegalia (mielofibrose, leucemia mieloide crônica)', f: 'Baço grande', c: 'Ascite, circulação colateral e estigmas hepáticos apontam para hipertensão portal', e: 'Hemograma com esfregaço' },
    ],
    rg: 'Abdome globoso, flancos abaulados, cicatriz umbilical plana. Circulação colateral periumbilical, com fluxo ascendente acima e descendente abaixo da cicatriz umbilical (tipo porta). RHA presentes. Timpanismo central e macicez de flancos, com macicez móvel. Espaço de Traube maciço. Indolor à palpação, sem rigidez. Baço palpável a 6 cm do RCE, firme. Lobo hepático esquerdo palpável no epigástrio, endurecido, de borda romba.',
  },
  fernanda: {
    n: 'Sra. Fernanda, 40 anos', q: '“Uma dor horrível nas costas, do lado direito; não acho posição.”',
    vit: 'FC 104 bpm · PA 146/88 mmHg · T 36,8 °C · FR 22 irpm',
    perg: [
      ['Como começou?', 'De repente, há 1 hora, em ondas que vêm e vão.'],
      ['Irradia?', 'Para a frente, para o "pé da barriga" e a virilha direita.'],
      ['Urina?', 'Vontade de urinar toda hora, arde um pouco. Não viu sangue.'],
      ['Febre, calafrios?', 'Não.'],
      ['Última menstruação?', 'Há 3 semanas, normal. Usa preservativo.'],
      ['Já teve algo parecido?', 'Nunca.'],
    ],
    reg: ['fd'], regFb: 'Na vista frontal, o flanco direito, com irradiação para a fossa ilíaca e a região inguinal. A origem é retroperitoneal (rim e ureter), e a dor da cólica é visceral e irradiada.',
    ordem: 'Inclua a punho-percussão lombar com a paciente sentada; examine o abdome com ela deitada, se tolerar.',
    ach: {
      insp: ['Inquieta, muda de posição a todo momento', 'Abdome plano, sem abaulamentos'],
      ausc: ['Ruídos hidroaéreos presentes'],
      perc: ['Timpanismo habitual; percussão indolor no abdome'],
      palp: ['Dor leve à palpação profunda do flanco e da fossa ilíaca direita, sem rigidez', 'Descompressão indolor; McBurney e Rovsing negativos', 'Punho-percussão lombar dolorosa à direita'],
    },
    cls: [['Inquietação, sem posição de alívio', 1], ['Ruídos hidroaéreos presentes', 0], ['Percussão abdominal indolor', 0], ['Descompressão indolor', 0], ['Punho-percussão lombar dolorosa à direita', 1], ['Temperatura 36,8 °C', 0]],
    sin: [
      ['Dor lombar aguda em cólica com irradiação e sintomas urinários (padrão de cólica nefrética), sem irritação peritoneal', 1, 'Sim: inquietação, dor em ondas irradiada para a virilha, disúria, punho-percussão dolorosa, sem sinais peritoneais.'],
      ['Irritação peritoneal localizada na fossa ilíaca direita', 0, 'Não há descompressão dolorosa, percussão dolorosa ou rigidez. E o paciente com peritonite fica imóvel, não inquieto.'],
      ['Síndrome infecciosa sistêmica de foco urinário', 0, 'Sem febre nem calafrios. Se aparecerem, a hipótese de infecção sobre obstrução passa a ser urgente.'],
    ],
    hip: [
      { h: 'Ureterolitíase à direita', f: 'Início súbito, cólica em ondas, irradiação para a virilha, inquietação, disúria, punho-percussão dolorosa', c: 'Nada no exame contraria', e: 'Urina tipo 1 (hematúria); ultrassonografia ou tomografia sem contraste' },
      { h: 'Pielonefrite aguda', f: 'Sintomas urinários e punho-percussão dolorosa', c: 'Afebril, início súbito em cólica', e: 'Urina tipo 1 e urocultura' },
      { h: 'Apendicite aguda (apêndice retrocecal)', f: 'Dor no flanco e na fossa ilíaca direita', c: 'Sem migração, sem sinais peritoneais, inquietação', e: 'Reavaliar o exame em algumas horas; imagem se persistir' },
      { h: 'Causa ginecológica (gravidez ectópica, torção ou cisto ovariano)', f: 'Mulher em idade fértil com dor em fossa ilíaca', c: 'Menstruação recente e regular (não exclui)', e: 'Beta-hCG sempre; exame ginecológico; ultrassonografia pélvica se indicada' },
    ],
    rg: 'Inquieta, sem posição antálgica. Abdome plano, simétrico. RHA presentes. Timpânico, percussão indolor. Dor leve à palpação profunda do flanco e da FID, sem rigidez; descompressão indolor; McBurney e Rovsing negativos. Fígado e baço não palpáveis. Punho-percussão lombar dolorosa à direita, indolor à esquerda.',
  },
  valeria: {
    n: 'Sra. Valéria, 30 anos', q: '“A dor começou em volta do umbigo ontem e agora está aqui embaixo, à direita.”',
    vit: 'FC 98 bpm · PA 118/76 mmHg · T 37,8 °C · FR 18 irpm',
    perg: [
      ['Como começou?', 'Há cerca de 18 horas, um incômodo em volta do umbigo, difuso. De madrugada desceu para a direita e ficou forte.'],
      ['Fome? Vômitos?', 'Sem fome desde ontem. Vomitou uma vez, já com a dor.'],
      ['Piora com algo?', 'Com o solavanco do ônibus e ao tossir; anda curvada.'],
      ['Última menstruação? Corrimento?', 'Há 2 semanas, normal. Sem corrimento. Vida sexual ativa, usa anticoncepcional oral.'],
      ['Urina e intestino?', 'Urina normal. Evacuou ontem, sem diarreia.'],
    ],
    reg: ['fid'], regFb: 'Fossa ilíaca direita agora; periumbilical no início. A migração da dor visceral para parietal é um dos dados de história mais úteis.',
    ordem: 'Comece pelo quadrante superior esquerdo e deixe a fossa ilíaca direita para o fim. Se tosse ou percussão já doem na FID, dispense a descompressão.',
    ach: {
      insp: ['Fácies de dor; levanta-se da cadeira com cuidado e anda curvada', 'Abdome plano, imóvel com a respiração'],
      ausc: ['Ruídos hidroaéreos diminuídos'],
      perc: ['Percussão dolorosa na fossa ilíaca direita'],
      palp: ['Dor no ponto de McBurney com rigidez localizada', 'Descompressão dolorosa na fossa ilíaca direita', 'Rovsing positivo; psoas e obturador negativos', 'Sem massas; punho-percussão lombar indolor'],
    },
    cls: [['Ruídos hidroaéreos diminuídos', 1], ['Percussão dolorosa na FID', 1], ['Dor no ponto de McBurney', 1], ['Descompressão dolorosa na FID', 1], ['Rovsing positivo', 1], ['Psoas negativo', 0], ['Punho-percussão indolor', 0]],
    sin: [
      ['Dor abdominal aguda inflamatória com irritação peritoneal localizada na fossa ilíaca direita', 1, 'Sim: percussão e descompressão dolorosas, rigidez local, dor ao tossir e ao andar, febre baixa.'],
      ['Peritonite generalizada', 0, 'A irritação está localizada. Rigidez difusa ou distensão mudariam o quadro e a urgência.'],
      ['Obstrução intestinal', 0, 'Não há distensão, vômitos repetidos ou parada de eliminação de gases e fezes.'],
    ],
    hip: [
      { h: 'Apendicite aguda', f: 'Migração periumbilical → FID, anorexia, vômito depois da dor, febre baixa, McBurney, descompressão e Rovsing positivos', c: 'Psoas e obturador negativos (pouco sensíveis; não afastam)', e: 'Hemograma e proteína C reativa; ultrassonografia ou tomografia conforme o serviço. Escores clínicos combinam esses dados, mas não substituem a avaliação cirúrgica' },
      { h: 'Gravidez ectópica', f: 'Mulher em idade fértil, dor em fossa ilíaca', c: 'Menstruação recente e anticoncepção (não exclui)', e: 'Beta-hCG antes de qualquer imagem com radiação' },
      { h: 'Doença inflamatória pélvica, torção ou cisto ovariano roto', f: 'Dor em fossa ilíaca com irritação peritoneal', c: 'Sem corrimento; migração da dor é típica de apendicite', e: 'Exame ginecológico; ultrassonografia pélvica' },
      { h: 'Ureterolitíase direita', f: 'Dor em fossa ilíaca direita', c: 'Imóvel, não inquieta; punho-percussão indolor; urina normal', e: 'Urina tipo 1' },
      { h: 'Adenite mesentérica ou ileíte', f: 'Dor em fossa ilíaca direita com febre', c: 'Sinais peritoneais francos', e: 'Ultrassonografia' },
    ],
    rg: 'Fácies de dor, deambula fletida. Abdome plano, pouco móvel com a respiração. RHA diminuídos. Percussão dolorosa na FID. Dor à palpação no ponto de McBurney, com rigidez localizada; descompressão brusca dolorosa na FID; Rovsing positivo; psoas e obturador negativos. Sem massas, fígado e baço não palpáveis. Punho-percussão lombar indolor.',
  },
};

export function paciente(node) {
  node.classList.add('pv');
  node.innerHTML = `
    <div class="pv-top"><div class="pv-casos" role="radiogroup" aria-label="Caso"></div>
      <ol class="pv-steps">${ETAPAS.map((e, i) => `<li><button type="button" class="pv-st" data-i="${i}" aria-label="Etapa ${i + 1}: ${e}"><span>${i + 1}</span>${e}</button></li>`).join('')}</ol></div>
    <div class="pv-body" aria-live="polite"></div>
    <div class="pv-nav"></div>
    <p class="pv-aviso">Exercício de raciocínio clínico. O componente não estima probabilidade nem emite diagnóstico: as hipóteses são para testar com a evolução e os exames.</p>`;
  const body = node.querySelector('.pv-body');
  let caso = 'carlos', et = 0;
  let st = {};
  const reset = () => { st = { asked: new Set(), reg: null, ordem: [], ex: new Set(), cls: {}, sin: null, hip: new Set() }; };
  reset();
  const steps = [...node.querySelectorAll('.pv-st')];
  const C = () => CASOS[caso];

  function render() {
    steps.forEach((b, i) => { b.classList.toggle('cur', i === et); b.setAttribute('aria-current', i === et ? 'step' : 'false'); });
    const c = C();
    const head = `<div class="pv-id"><h4>${c.n}</h4><p class="pv-q">${c.q}</p><p class="pv-vit mono">${c.vit}</p></div>`;
    let h = '';
    if (et === 0) {
      h = `<p class="pv-ins">Escolha as perguntas. Cada uma revela a resposta do paciente.</p><div class="pv-pg">${c.perg.map(([q, a], i) => `<div class="pv-qa ${st.asked.has(i) ? 'on' : ''}"><button type="button" class="btn chip" data-q="${i}" aria-pressed="${st.asked.has(i)}"><span>${q}</span></button><p>${st.asked.has(i) ? a : ''}</p></div>`).join('')}</div>`;
    } else if (et === 1) {
      h = `<p class="pv-ins">Toque na região onde a queixa se localiza agora.</p><div class="pv-reg"><svg class="pv-svg" viewBox="${VB}" role="img" aria-label="Abdome com as nove regiões; toque para escolher">${base({ marcos: false })}${regioes('hemi')}${st.reg ? `<text class="pv-sel" x="${ROT9[st.reg][0]}" y="${ROT9[st.reg][1]}">●</text>` : ''}</svg>
        <div class="pv-fb">${st.reg ? `<p class="${c.reg.includes(st.reg) ? 'ok' : 'no'}"><b>${NOME[st.reg]}.</b> ${c.reg.includes(st.reg) ? '' : 'Não é a melhor escolha. '}${c.regFb}</p>` : ''}</div></div>`;
    } else if (et === 2) {
      const certo = ['insp', 'ausc', 'perc', 'palp'];
      const fim = st.ordem.length === 4, ok = fim && st.ordem.every((k, i) => k === certo[i]);
      h = `<p class="pv-ins">Toque nas técnicas na ordem em que vai executá-las.</p><div class="pv-ord">${TEC.map(([k, l]) => `<button type="button" class="btn chip" data-o="${k}" aria-pressed="${st.ordem.includes(k)}"><span>${st.ordem.includes(k) ? `${st.ordem.indexOf(k) + 1}. ` : ''}${l}</span></button>`).join('')}<button type="button" class="btn ghost" data-o="reset"><span>Limpar</span></button></div>
        ${fim ? `<p class="${ok ? 'ok' : 'no'}">${ok ? '<b>Certo:</b> inspeção, ausculta, percussão e palpação.' : '<b>Ordem habitual:</b> inspeção, ausculta, percussão e palpação.'} A justificativa clássica é não alterar a motilidade antes de auscultar; o ABD observa que esse efeito não foi comprovado, mas a sequência continua sendo a recomendada. ${c.ordem}</p>` : ''}`;
    } else if (et === 3) {
      h = `<p class="pv-ins">Execute cada técnica para ver os achados.</p><div class="pv-ach">${TEC.map(([k, l]) => `<div class="pv-t ${st.ex.has(k) ? 'on' : ''}"><button type="button" class="btn ${st.ex.has(k) ? 'ghost' : 'primary'}" data-t="${k}"><span>${l}</span></button>${st.ex.has(k) ? `<ul>${c.ach[k].map((a) => `<li>${a}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div>`;
    } else if (et === 4) {
      h = `<p class="pv-ins">Classifique cada dado: está dentro do esperado ou alterado?</p><div class="pv-cls">${c.cls.map(([a, alt], i) => { const v = st.cls[i]; const done = v !== undefined; return `<div class="pv-c ${done ? (v === alt ? 'ok' : 'no') : ''}"><p>${a}</p><div><button type="button" class="btn chip" data-c="${i}" data-v="0" aria-pressed="${v === 0}"><span>Normal</span></button><button type="button" class="btn chip" data-c="${i}" data-v="1" aria-pressed="${v === 1}"><span>Alterado</span></button></div>${done && v !== alt ? `<span class="pv-x">${alt ? 'alterado' : 'normal'}</span>` : ''}</div>`; }).join('')}</div>
        <p class="pv-ins small">Achado normal também entra no raciocínio: ele é, muitas vezes, o dado "contra" de uma hipótese.</p>`;
    } else if (et === 5) {
      h = `<p class="pv-ins">Qual integração sindrômica descreve melhor os achados? (pode haver mais de uma adequada)</p><div class="pv-sin">${c.sin.map(([t, ok, fb], i) => `<div class="pv-s ${st.sin === i ? (ok ? 'ok' : 'no') : ''}"><button type="button" class="btn chip" data-s="${i}" aria-pressed="${st.sin === i}"><span>${t}</span></button>${st.sin === i ? `<p>${fb}</p>` : ''}</div>`).join('')}</div>`;
    } else if (et === 6) {
      h = `<p class="pv-ins">Hipóteses a testar. Antes de abrir, pense: o que fala a favor, o que fala contra e que exame testaria cada uma?</p><div class="pv-hip">${c.hip.map((x, i) => `<div class="pv-h ${st.hip.has(i) ? 'on' : ''}"><button type="button" class="pv-hh" data-h="${i}" aria-expanded="${st.hip.has(i)}">${x.h}</button>${st.hip.has(i) ? `<dl><div><dt>A favor</dt><dd>${x.f}</dd></div><div><dt>Contra</dt><dd>${x.c}</dd></div><div><dt>Para testar</dt><dd>${x.e}</dd></div></dl>` : ''}</div>`).join('')}</div>
        <p class="pv-ins small">A ordem acima não é ranking calculado: é uma lista para discutir. O que faria você mudar a ordem?</p>`;
    } else {
      h = `<p class="pv-ins">Escreva o seu registro e depois compare com o modelo.</p><div class="pv-rg"><textarea rows="7" aria-label="Seu registro do exame do abdome" placeholder="Inspeção... Ausculta... Percussão... Palpação..."></textarea><details><summary>Ver registro modelo</summary><p class="mono">${c.rg}</p></details></div>`;
    }
    body.innerHTML = head + `<div class="pv-step"><h5>${et + 1}. ${ETAPAS[et]}</h5>${h}</div>`;
    bP.disabled = et === 0; bN.disabled = et === ETAPAS.length - 1;
  }
  body.addEventListener('click', (e) => {
    const t = e.target.closest('button, svg.pv-svg');
    if (!t) return;
    const d = t.dataset;
    if (d.q !== undefined) st.asked.add(Number(d.q));
    else if (d.o) { if (d.o === 'reset') st.ordem = []; else if (!st.ordem.includes(d.o)) st.ordem.push(d.o); }
    else if (d.t) st.ex.add(d.t);
    else if (d.c !== undefined) st.cls[Number(d.c)] = Number(d.v);
    else if (d.s !== undefined) st.sin = Number(d.s);
    else if (d.h !== undefined) { const i = Number(d.h); st.hip.has(i) ? st.hip.delete(i) : st.hip.add(i); }
    else if (t.matches('svg.pv-svg')) {
      const p = t.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(t.getScreenCTM().inverse());
      if (q.y < 96 || q.y > 600) return;
      st.reg = regiaoEm(q.x, q.y, 'hemi');
    } else return;
    render();
  });
  const nav = node.querySelector('.pv-nav');
  const bP = button({ icon: 'prev', label: 'Etapa anterior', text: 'Anterior', cls: 'ghost' });
  const bN = button({ icon: 'next', label: 'Próxima etapa', text: 'Próxima', cls: 'primary' });
  const bR = button({ icon: 'restart', label: 'Recomeçar o caso', text: 'Recomeçar', cls: 'ghost' });
  bP.addEventListener('click', () => { et = Math.max(0, et - 1); render(); });
  bN.addEventListener('click', () => { et = Math.min(ETAPAS.length - 1, et + 1); render(); });
  bR.addEventListener('click', () => { reset(); et = 0; render(); });
  nav.append(bP, bN, bR);
  steps.forEach((b) => b.addEventListener('click', () => { et = Number(b.dataset.i); render(); }));
  const host = node.querySelector('.pv-casos');
  Object.entries(CASOS).forEach(([k, c]) => {
    const b = button({ label: c.n, text: c.n, cls: 'chip', pressed: k === caso });
    b.addEventListener('click', () => { caso = k; reset(); et = 0; host.querySelectorAll('.btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render(); });
    host.appendChild(b);
  });
  captureKeys(node, (e) => e.target.matches?.('textarea') && e.key.length === 1);
  render();
  return {};
}
