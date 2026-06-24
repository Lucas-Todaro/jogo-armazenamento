# A Jornada do Bit

**A Jornada do Bit** é um jogo educativo digital sobre a evolução dos dispositivos de armazenamento. O jogador acompanha uma jornada histórica que mostra como os dados foram armazenados ao longo do tempo, desde meios físicos simples, como cartões perfurados, até tecnologias modernas, como SSDs e armazenamento em nuvem.

O projeto transforma conceitos de computação em pequenas experiências interativas. Em vez de apenas apresentar textos explicativos, cada fase propõe uma mecânica jogável relacionada a uma tecnologia de armazenamento.

## Objetivo do projeto

O objetivo do jogo é ensinar, de forma interativa, conceitos básicos ligados ao armazenamento de dados, como:

- representação física de informações;
- lógica binária;
- acesso sequencial;
- limite de capacidade;
- leitura óptica;
- partes mecânicas;
- memória flash;
- armazenamento local e remoto.

Cada fase representa um período ou tecnologia importante da história do armazenamento. A proposta é que o jogador aprenda o conceito principal por meio da ação: perfurar, procurar, selecionar, limpar, recuperar, transferir ou classificar arquivos.

## Como o jogo foi construído

O projeto foi desenvolvido com:

- **HTML5**, para a estrutura da página;
- **CSS3**, para o visual base, fontes, cores de fundo e centralização do jogo;
- **JavaScript**, para a lógica das cenas, interações e regras;
- **Phaser.js**, como framework principal para criar o jogo, desenhar elementos visuais, controlar cenas, animações, botões e transições.

O jogo é organizado em cenas. Essa divisão separa as telas principais e as fases, facilitando a manutenção do código. A estrutura atual inclui:

- cena de carregamento;
- menu inicial;
- introdução narrativa;
- linha do tempo;
- sete fases jogáveis;
- conclusão final da jornada, exibida ao terminar a Fase 7.

Cada fase fica em um arquivo próprio dentro de `src/scenes/`, o que ajuda a manter as mecânicas isoladas e evita que uma fase dependa diretamente da implementação interna das outras.

## Organização do código

A estrutura principal do projeto é:

```txt
index.html
style.css
README.md
src/
  main.js
  scenes/
    BootScene.js
    MenuScene.js
    IntroScene.js
    TimelineScene.js
    Phase1Scene.js
    Phase2Scene.js
    Phase3Scene.js
    Phase4Scene.js
    Phase5Scene.js
    Phase6Scene.js
    Phase7Scene.js
  utils/
    progressManager.js
    visualHelpers.js
    UX_GUIDE.md
```

Função dos arquivos principais:

- `index.html`: carrega a página, o Phaser via CDN e o arquivo principal do jogo.
- `style.css`: define o visual geral da página e centraliza o canvas do Phaser.
- `src/main.js`: configura o Phaser, define o tamanho do jogo e registra todas as cenas.
- `src/scenes/`: contém as telas e fases do jogo.
- `src/utils/progressManager.js`: gerencia progresso, fases concluídas, desbloqueios e pontuações usando `localStorage`.
- `src/utils/visualHelpers.js`: concentra funções visuais reutilizadas pelas cenas, como painéis, botões e fundo.
- `src/utils/UX_GUIDE.md`: registra orientações de interface usadas no projeto.

## Sistema de progresso

O jogo possui progressão por fases:

- a Fase 1 começa desbloqueada;
- cada fase concluída libera a próxima;
- a linha do tempo mostra fases bloqueadas, desbloqueadas e concluídas;
- o jogador pode voltar para a linha do tempo durante a jornada.

O progresso é salvo localmente no navegador com `localStorage`, pela chave `jornadaDoBitProgress`. Isso significa que o progresso não é global: outro navegador, outro dispositivo ou uma limpeza dos dados locais pode fazer o jogo começar do zero.

## Pontuação

Cada fase possui pontuação própria. Em geral, a fase começa com 100 pontos e o jogador perde pontos ao cometer erros, fazer tentativas incorretas ou executar ações inadequadas.

As pontuações são salvas por fase e podem ser somadas para formar a pontuação total da jornada. Ao concluir a última fase, a tela final mostra a pontuação da Fase 7 e o total acumulado.

## Fases do jogo

### Fase 1 — Cartões Perfurados

A primeira fase apresenta os cartões perfurados, uma das formas antigas de representar informações em máquinas. A presença ou ausência de furos é relacionada à lógica binária, mostrando como dados podem ser codificados fisicamente.

**Mecânica:** o jogador monta uma sequência binária no cartão, clicando nas posições para alternar entre furo e ausência de furo.

### Fase 2 — Fita Magnética

A segunda fase ensina o conceito de acesso sequencial. Em fitas magnéticas, para encontrar um arquivo, era necessário avançar ou rebobinar até chegar à posição desejada.

**Mecânica:** o jogador controla uma cabeça de leitura, avançando e rebobinando na fita até encontrar o arquivo procurado.

### Fase 3 — Disquete

A terceira fase mostra o disquete como uma mídia portátil, mas com capacidade bastante limitada. O foco educativo está em escolher o que realmente cabe no espaço disponível.

**Mecânica:** o jogador escolhe arquivos importantes e tenta salvá-los sem ultrapassar o limite de armazenamento do disquete.

### Fase 4 — CD/DVD

A quarta fase aborda CDs e DVDs como mídias ópticas lidas por laser. Elas oferecem mais capacidade que disquetes, mas podem ter a leitura prejudicada por sujeira e arranhões.

**Mecânica:** o jogador limpa sujeiras do disco para permitir que o laser leia os dados corretamente.

### Fase 5 — HD / Disco Rígido

A quinta fase apresenta o HD como um dispositivo com pratos magnéticos girando e cabeça de leitura mecânica. Ele oferece grande capacidade, mas possui partes sensíveis a impacto e vibração.

**Mecânica:** o jogador move a cabeça de leitura entre setores para recuperar arquivos, tomando cuidado com vibrações.

### Fase 6 — Pen drive / Memória Flash

A sexta fase mostra o pen drive como um dispositivo baseado em memória flash, capaz de transportar arquivos sem partes móveis.

**Mecânica:** o jogador passa por etapas guiadas: selecionar arquivos importantes, copiar para o pen drive, transferir para outro computador e ejetar com segurança.

### Fase 7 — SSD e Nuvem

A sétima fase compara duas formas modernas de armazenamento. O SSD usa memória flash para acesso rápido e local, enquanto a nuvem armazena dados em servidores acessados pela internet.

**Mecânica:** o jogador classifica um arquivo por vez, decidindo se ele deve ser salvo no SSD ou enviado para a Nuvem. A decisão considera velocidade, uso local, backup, acesso remoto e estado da conexão.

## Tela final

Ao concluir a Fase 7, o jogo mostra a conclusão da jornada. A tela final parabeniza o jogador por acompanhar a evolução dos dispositivos de armazenamento, dos cartões perfurados até os SSDs e a Nuvem.

Essa tela também apresenta a pontuação da fase e a pontuação total acumulada, quando disponível pelo sistema de progresso.

## Como executar o projeto

Como o projeto usa módulos JavaScript com `import` e `export`, o ideal é executá-lo por meio de um servidor local. Abrir o `index.html` diretamente no navegador pode causar bloqueios de carregamento de módulos, dependendo do navegador.

### Opção 1 — Usando VS Code Live Server

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

### Opção 2 — Usando Python

Na pasta do projeto, execute:

```bash
python -m http.server 8000
```

Depois acesse:

```txt
http://localhost:8000
```

### Opção 3 — Usando Node.js

Na pasta do projeto, execute uma das opções:

```bash
npx serve .
```

ou:

```bash
npx http-server
```

Depois abra no navegador o endereço informado no terminal.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Phaser.js
- LocalStorage

## Observações finais

O projeto foi pensado como uma forma interativa de aprender a evolução do armazenamento de dados. Cada tecnologia resolve limitações da anterior e apresenta novos desafios: capacidade, velocidade, portabilidade, confiabilidade, partes mecânicas, memória flash e acesso remoto.

Assim, **A Jornada do Bit** usa a linguagem dos jogos para tornar conceitos técnicos mais visuais, práticos e fáceis de entender.
