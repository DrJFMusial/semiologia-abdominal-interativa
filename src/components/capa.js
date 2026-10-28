/**
 * Capa: abdome esquemático que respira (fígado e baço descem na inspiração),
 * com as nove regiões se desenhando por cima. Sem som.
 */
import { VB, base, regioes, orgao } from '../core/abdomen.js';
import { prefersReducedMotion } from '../core/ui.js';

export function capa(node) {
  node.innerHTML = `<svg class="cp-abd" viewBox="${VB}" aria-hidden="true">
    ${base({ marcos: false })}
    <g class="cp-orgs"></g>
    ${regioes('hemi')}
  </svg>`;
  const g = node.querySelector('.cp-orgs');
  const draw = (insp) => { g.innerHTML = ['colon', 'delgado', 'estomago', 'figado', 'vesicula', 'baco'].map((k) => orgao(k, { insp })).join(''); };
  draw(0);
  let raf = 0, active = false, t0 = 0;
  const frame = (now) => {
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    draw((1 - Math.cos((2 * Math.PI * t) / 4.5)) / 2);
    if (active) raf = requestAnimationFrame(frame);
  };
  return {
    activate() { if (active || prefersReducedMotion()) return; active = true; t0 = 0; raf = requestAnimationFrame(frame); },
    deactivate() { active = false; cancelAnimationFrame(raf); },
    pause() { active = false; cancelAnimationFrame(raf); },
  };
}
