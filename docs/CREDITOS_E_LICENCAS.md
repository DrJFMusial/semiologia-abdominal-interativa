# Créditos e licenças

## Conteúdo

Texto, roteiro, simuladores e esquemas vetoriais: Prof. João Frederico Musial, com desenvolvimento assistido por inteligência artificial e revisão do autor.

Referências consultadas (nenhum trecho ou figura reproduzido):

1. Bickley LS, Szilagyi PG. *Bates' guide to physical examination and history taking*. 12. ed. Wolters Kluwer, 2017. Cap. 11, The Abdomen.
2. Swartz MH. *Textbook of physical diagnosis: history and examination*. 8. ed. Elsevier, 2021. Cap. 17, The Abdomen. ISBN 978-0-323-67292-4 (metadados do arquivo e página da editora).
3. Troncon LEA, Oliveira RB, Teixeira AC, Souza FF, Meneghelli UG, Martinelli ALC. Exame do abdome. In: Baddini-Martinez J, Dantas M, Voltarelli JC (org.). *Semiologia geral e especializada*. 2. ed. [S. l.]: Editora dos Autores, 2024. Cap. 12, p. 199-226 (citado como ABD). Dados editoriais conferidos em bibliografia institucional da USP, não em ficha catalográfica.

## Ilustrações

Vinte e quatro ilustrações fotorrealistas (pasta `src/assets/images`), geradas com ferramenta de IA a partir de prompts escritos para esta aula. As figuras dos livros serviram apenas como referência de composição e **não** fazem parte da aplicação nem do repositório.

Onze vêm da versão 1.0.0 (AB01, AB02, AB03, AB05, AB06, AB08, AB09a, AB09b, AB13a, AB19, REF_C). Treze foram produzidas na rodada de complementos (Codex) e integradas na 1.1.0: AB07, AB10, AB11, AB12, AB13b, AB14a, AB14b, AB15, AB16a, AB16b, AB18, AB22, AB23. A seleção foi visual; a aprovação clínica final de cada figura cabe ao autor.

Figuras de escopo limitado, com a ressalva na própria legenda: AB08 (só posição do examinador; as mãos não estão em garra), AB11 (posicionamento, paciente vestido), AB14a e AB14b (só posições), AB15 (montagem do piparote, sem a onda), AB16b (sem a reação facial), AB18 (detalhe do apoio dos membros), AB22 (posição das mãos, sem medida), AB23 (início abaixo do rebordo, sem altura universal nem borda de fígado aumentado).

Antes de publicar, confirmar nos termos das ferramentas de geração usadas que as imagens podem ser redistribuídas em material educacional público.

## Sons

Sons esquemáticos (ruídos hidroaéreos, sopros, percussão) sintetizados no navegador por código desta aplicação e identificados na tela como "som sintetizado esquemático".

Gravações abdominais (versão 1.2.0): nove trechos do acervo do projeto *Auscultation Simulator Application* (Kumar-laxmi, https://github.com/Kumar-laxmi/Auscultation-Simulator-Application), a partir da cópia local organizada pelo Codex (pasta SIMULADOR_AUSCULTA_WINDOWS). O projeto licencia seu código sob GPL-3.0, mas **não informa a origem das gravações**; a procedência e os direitos sobre os áudios não foram verificados. Uso decidido pelo professor para a aula local. Na tela, cada trecho aparece como "gravação de acervo de terceiros, origem não verificada", com o rótulo original.

| Arquivo na aula | Rótulo original | SHA-256 do original |
|---|---|---|
| acervo-normal.wav | normal_bowel | 0948b6bd…d5f032 |
| acervo-hiperativo.wav | hyperactive_sounds | e7b99831…030a37 |
| acervo-hipoativo.wav | hypoactive_sounds | ba166260…104212 |
| acervo-borborigmo.wav | borborygmus | bbbaa477…c00376 |
| acervo-ileo_paralitico.wav | paralytic_ileus | 1f28aada…efa2e8 |
| acervo-atrito_peritoneal.wav | peritoneal_friction_rub | 6bd2c572…7fa838 |
| acervo-sopro_renal.wav | bruits_due_to_renal_arteries_stenosis | 90364c02…b55473 |
| acervo-normal_com_sopro.wav | normal_bowel_sound_with_bruits | 8914605d…a50006 |
| acervo-patinhacao.wav | capotement | ff08cfb6…6c020b |

Hashes completos em `src/core/acervo.js`. Modificações: reamostragem de 44 100 para 11 025 Hz (soxr), rampas de 20 ms no início e no fim, sem alteração de ganho. Descartados por rótulo sem correspondência semiológica: constipation, crohns_disease, diarrhea, irritable_bowel_syndrome, ulcerative_colitis. Os sons cardíacos e pulmonares do mesmo acervo não foram usados.

## Bibliotecas e fontes

- reveal.js 5.2.1 (MIT)
- Vite 5.4.11 e vite-plugin-singlefile 2.0.3 (MIT), apenas no build
- Inter e IBM Plex Mono (SIL Open Font License 1.1; licenças em `src/assets/fonts`)
