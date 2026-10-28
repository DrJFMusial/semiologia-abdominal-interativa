import './styles/theme.css';
import './styles/authorship.css';
import { buildAuthorship } from './core/authorship.js';
/**
 * Semiologia Abdominal Interativa | E2M08 2026/2
 * Ponto de entrada: monta os slides, inicializa o Reveal no modo escolhido
 * (apresentação ou estudo) e registra os componentes interativos.
 * Arquitetura herdada das aulas cardiovascular e respiratória.
 */
import Reveal from 'reveal.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';
import 'reveal.js/dist/reveal.css';

import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/slides.css';
import './styles/components.css';
import './styles/base-content.css';
import './styles/abd.css';

import { register, mountAll } from './core/registry.js';
import { buildShell } from './core/shell.js';
import { revelar, hotspots, checklist } from './components/generic.js';
import { capa } from './components/capa.js';
import { linguagem, cadeia } from './sim/linguagem.js';
import { atlas } from './sim/atlas.js';
import { dor } from './sim/dor.js';
import { formas, superficie, hernia } from './sim/inspecao.js';
import { auscConv, sons } from './sim/ausculta.js';
import { percAbd, hepatimetria } from './sim/percussao.js';
import { ascite } from './sim/ascite.js';
import { tonus, massaParede } from './sim/palpacao.js';
import { orgao, murphy, apendice } from './sim/orgaos.js';
import { paciente } from './sim/paciente.js';
import { registro } from './components/registro.js';

try { const saved = localStorage.getItem('e2m08-theme'); document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch { document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

// ---- conteúdo: um arquivo HTML por slide, em ordem alfabética ----------------
const files = import.meta.glob('./slides/*.html', { query: '?raw', import: 'default', eager: true });
// imagens: os slides citam "@img/nome.webp"; o Vite resolve o endereço final
// (arquivo com hash no site, data URI no pacote offline)
const imgs = import.meta.glob('./assets/images/*.webp', { query: '?url', import: 'default', eager: true });
export const imgUrl = Object.fromEntries(Object.entries(imgs).map(([k, v]) => [k.split('/').pop(), v]));
window.__img = imgUrl;
const html = Object.keys(files).sort().map((k) => files[k]).join('\n')
  .replace(/@img\/([\w.-]+)/g, (m, n) => imgUrl[n] || m);
document.querySelector('.reveal .slides').innerHTML = html;

// ---- modo ------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const estreito = window.matchMedia('(max-width: 820px), (max-height: 520px) and (max-width: 1000px)').matches;
const modo = params.get('modo') || (estreito ? 'estudo' : 'apresentacao');
document.body.classList.add(modo === 'estudo' ? 'modo-estudo' : 'modo-apresentacao');
try {
  if (localStorage.getItem('reduce-motion') === '1') document.documentElement.classList.add('reduce-motion');
} catch { /* armazenamento indisponível: segue sem preferência salva */ }

// ---- componentes ------------------------------------------------------------------
const C = {
  capa, revelar, hotspots, checklist, linguagem, cadeia, atlas, dor, formas, superficie, hernia,
  'ausc-conv': auscConv, sons, 'perc-abd': percAbd, hepatimetria, ascite, tonus, 'massa-parede': massaParede,
  orgao, murphy, apendice, paciente, registro,
};
Object.entries(C).forEach(([k, f]) => register(k, f));

/* Modo apresentação: Reveal com tela fixa de 1600 × 900 escalada sem corte.
   Modo estudo: documento rolável e responsivo (sem escala), para leitura no
   celular; a barra usa o mesmo contrato mínimo do Reveal (adaptador abaixo). */
let deck;
if (modo === 'estudo') {
  deck = studyDeck();
  mountAll(document);
  buildShell(deck, { modo });
} else {
  deck = new Reveal(document.querySelector('.reveal'), {
    width: 1600,
    height: 900,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.5,
    hash: true,
    history: false,
    controls: true,
    controlsLayout: 'bottom-right',
    progress: true,
    slideNumber: 'c/t',
    center: false,
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'none',
    plugins: [Notes],
  });
  deck.initialize().then(() => {
    mountAll(document);
    buildShell(deck, { modo });
  });
}

function studyDeck() {
  const slides = [...document.querySelectorAll('.reveal .slides > section')];
  slides.forEach((s, i) => { s.id = s.id || `s${i + 1}`; });
  const go = (i) => slides[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const m = /^#\/?(\d+)/.exec(location.hash);
  if (m) requestAnimationFrame(() => go(Number(m[1])));
  return {
    getSlides: () => slides,
    slide: go,
    getIndices: () => {
      let h = 0;
      slides.forEach((s, i) => { if (s.getBoundingClientRect().top < 140) h = i; });
      return { h, v: 0 };
    },
    getPlugin: () => null,
  };
}

window.__deck = deck;

buildAuthorship();
