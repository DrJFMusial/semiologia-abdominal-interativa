# Semiologia Abdominal Interativa

E2M08 · Introdução à Propedêutica Médica · Semestre 2026/2
Prof. João Frederico Musial · Medicina · Centro Universitário Campo Real

Aplicação educacional estática (HTML5, CSS, JavaScript) para a aula de semiologia abdominal. Um único código serve a dois usos:

- **Modo apresentação**: tela 16:9 (1600 × 900) escalada sem corte para qualquer projetor, navegação por setas, notas do apresentador (tecla S).
- **Modo estudo**: documento rolável e responsivo para computador, tablet e celular, com os mesmos simuladores e três telas extras (distensão, massas por região, toque retal).

Versão **1.2.0**: 33 telas na apresentação (36 no estudo), cerca de 60 minutos (cerca de 55 se a hérnia e o paciente virtual ficarem para o estudo). Sem back-end, login ou coleta de dados. Arquitetura herdada das aulas *Semiologia Cardiovascular Interativa* e *Semiologia Respiratória Interativa*.

## Requisitos

- Node.js 18 ou superior e npm.
- Navegador atual: Chrome, Edge, Firefox ou Safari.

## Instalar e executar

```bash
npm install
npm run dev          # http://localhost:5173
```

Modos por endereço: `?modo=apresentacao` ou `?modo=estudo`. Em telas estreitas o modo estudo é o padrão.

## Gerar os pacotes

```bash
npm run build          # dist/          site estático para o GitHub Pages
npm run build:offline  # dist-offline/  um único index.html autocontido (abre com duplo clique, sem internet)
npm run build:all      # os dois
```

## Estrutura

```
src/
  main.js              monta os slides, escolhe o modo, registra os componentes
  slides/*.html        uma tela por arquivo, em ordem alfabética
  core/                abdome paramétrico (abdomen.js), síntese de sons (synth.js),
                       áudio, registro de componentes, barra de controle, utilitários
  components/          capa, revelar/hotspots/checklist, construtor de registro
  sim/                 simuladores: linguagem e cadeia, atlas, dor, inspeção,
                       ausculta, percussão e hepatimetria, ascite, palpação,
                       órgãos (fígado, baço, rins e aorta, Murphy, apendicite),
                       paciente virtual
  assets/images/       ilustrações do autor em WebP (1280 px)
  styles/              tokens, base, slides, componentes; abd.css é o desta aula
docs/                  créditos, relatório técnico-pedagógico, QA, publicação
sandbox/               scripts de verificação com Playwright (não entram no build)
```

## Regras de conteúdo mantidas no código

- Nenhum som toca sozinho. Os sons sintetizados são identificados na tela como esquemáticos; as nove gravações abdominais de acervo de terceiros, como "origem não verificada".
- Nenhuma figura de livro é incluída; as fotografias foram geradas a partir de descrições do autor.
- O paciente virtual não emite diagnóstico: organiza hipóteses com dados a favor, contra e o exame que testaria cada uma.
- Divergências entre as referências aparecem marcadas como "Fontes divergem".

## Publicação

Não publicado. Ver `docs/PUBLICACAO_GITHUB_PAGES.md`; só publicar com a aprovação do professor. **A partir da 1.2.0 a aula contém gravações de procedência não verificada (`src/assets/audio/acervo-*.wav`): retire-as ou esclareça a origem antes de qualquer publicação.**

## Autoria e aulas relacionadas

© 2026 João Frederico Musial. Todos os direitos reservados sobre os elementos originais, ressalvadas as utilizações legalmente permitidas e as licenças de terceiros. Consulte COPYRIGHT.md.

https://drjfmusial.github.io/semiologia-abdominal-interativa/
https://drjfmusial.github.io/semiologia-cardiovascular-interativa/
https://drjfmusial.github.io/semiologia-respiratoria-interativa/

Distribuição web: v1.2.1. Correções de histórico da contagem e linguagem de RV+, aviso autoral e navegação entre aulas. Gravações preservadas com ressalva explícita de procedência não verificada.

## Publicação das gravações — v1.2.2

As nove gravações do acervo Kumar-laxmi foram autorizadas expressamente pelo professor para publicação com a ressalva de procedência e permissão de redistribuição não verificadas. A autorização do professor não comprova direitos de terceiros. A interface mantém o rótulo original de cada trecho e separa as gravações do exercício com sons esquemáticos.

