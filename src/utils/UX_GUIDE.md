# Guia de UX das Fases

Este guia define a base visual para reformar as fases de "A Jornada do Bit" aos poucos, sem mudar mecânicas, pontuação, progresso ou desbloqueio.

## Estrutura de Cada Fase

1. Introdução da fase
   - Título grande no topo.
   - Explicação curta, idealmente até 3 linhas.
   - Uma frase clara sobre o desafio.
   - Um botão principal: "Começar desafio".

2. Desafio
   - Objetivo curto no topo, sempre visível.
   - Área principal do minigame no centro.
   - Pontuação no canto superior direito.
   - Feedback em uma posição fixa na parte inferior.
   - Dica educativa curta em uma caixa pequena.
   - No máximo 3 ou 4 botões principais visíveis.

3. Conclusão
   - Título "Fase concluída!".
   - Texto curto sobre o que foi aprendido.
   - Pontuação final da fase.
   - Botões "Voltar à linha do tempo" e "Jogar novamente".

## Helpers Recomendados

Use `src/utils/visualHelpers.js` nas próximas reformas:

- `createPhaseIntroPanel()` para introduções.
- `createChallengeHud()` para título, objetivo, pontuação e feedback.
- `createObjectiveText()` quando a fase precisar apenas do objetivo.
- `createScoreBox()` para pontuação padronizada.
- `createFeedbackBox()` para substituir mensagens antigas por uma nova.
- `createEducationalTip()` para dicas curtas.
- `createConclusionPanel()` para telas finais.
- `createButton()` ou `createStandardButton()` para botões.
- `createPanel()` ou `createRoundedPanel()` para painéis.

## Posições Padrão

As posições ficam centralizadas no sistema lógico `960x540` e são escaladas pelo Phaser:

- Título da fase: `x: 480`, `y: 52`.
- Título do desafio: `x: 480`, `y: 31`.
- Objetivo: `x: 350`, `y: 76`, `640x56`.
- Pontuação: canto superior direito, `x: 858`, `y: 31`.
- Feedback: centro inferior, `x: 480`, `y: 505`, `840x42`.
- Dica educativa: lateral direita, `x: 800`, `y: 260`.
- Conclusão: painel central `770x220`, botões em `y: 462`.

## Regras de Texto

- Durante o desafio, mantenha apenas um objetivo, uma dica e uma mensagem de feedback por vez.
- Evite blocos longos no meio do minigame.
- Use `wordWrap` em textos dentro de painéis.
- Prefira frases de ação: "Selecione os arquivos importantes" em vez de explicações extensas.
- Explicações maiores devem ficar na introdução ou conclusão.

## Feedback

- Acerto: mensagem curta, verde, com pulso/brilho.
- Erro: mensagem curta, cor de alerta, com tremor ou destaque.
- Neutro: orientação curta, cor discreta.
- Nunca acumule mensagens antigas na tela.
- Sempre substitua a mensagem anterior.

## Espaçamento e Legibilidade

- Painéis precisam de respiro interno; não cole texto nas bordas.
- Botões devem ter altura mínima confortável e espaço entre si.
- Dicas educativas devem ser objetivas e menores que o painel principal.
- O contraste deve funcionar em projetor e tela Full HD.
- Evite excesso de elementos, botões agrupados demais e textos pequenos.

## Limites Desta Etapa

- Não randomizar desafios.
- Não mudar regras de pontuação.
- Não alterar progresso ou desbloqueio.
- Não reescrever fases inteiras.
- Aplicar este padrão gradualmente nas próximas reformas fase por fase.
