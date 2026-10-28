# Publicação no GitHub Pages

**Este projeto não foi publicado.** Os passos abaixo só devem ser executados com a aprovação do professor.

## Antes de publicar

- **Gravações abdominais de acervo (1.2.0):** a origem não foi verificada. Remover `src/assets/audio/acervo-*.wav` e o modo "Gravações" do laboratório de ruídos, ou documentar a licença das gravações, antes de publicar.

- Confirmar a licença de uso das ilustrações geradas por IA (ver `CREDITOS_E_LICENCAS.md`).
- Não incluir no repositório figuras dos livros nem a pasta de referências visuais.

## Opção A: GitHub Actions (recomendada)

1. Criar um repositório (por exemplo, `semiologia-abdominal`).
2. Enviar o código-fonte (o `.gitignore` já exclui `node_modules`, `dist` e `dist-offline`):
   ```bash
   git init
   git add .
   git commit -m "Semiologia Abdominal Interativa 1.0.0"
   git branch -M main
   git remote add origin https://github.com/USUARIO/semiologia-abdominal.git
   git push -u origin main
   ```
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. O fluxo `.github/workflows/deploy.yml` gera o `dist/` e publica a cada envio para `main`. Endereço: `https://USUARIO.github.io/semiologia-abdominal/`.

## Opção B: manual

1. `npm run build`.
2. Enviar o conteúdo de `dist/` para a raiz de uma branch `gh-pages`.
3. Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / `root`.

## Endereços úteis

- Apresentação: `…/?modo=apresentacao`
- Estudo: `…/?modo=estudo`
- Slide específico: `…/#/6`

## Sala de aula sem internet

Use `dist-offline/index.html`: um único arquivo, com imagens, fontes e código embutidos. Abre com duplo clique no Chrome, Edge ou Firefox, sem servidor e sem conexão.
