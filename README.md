# A Jornada do Bit

Base navegavel de um jogo educativo 2D sobre a evolucao dos dispositivos de
armazenamento, desenvolvido com HTML, CSS, JavaScript e Phaser 3.

## Como executar

Como o projeto usa modulos JavaScript, abra-o por meio de um servidor local.

### Com Python

```powershell
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

### Com Node.js

```powershell
npx serve .
```

Abra o endereco informado no terminal.

## Estrutura

```text
.
|-- index.html
|-- style.css
`-- src
    |-- main.js
    `-- scenes
        |-- BootScene.js
        |-- MenuScene.js
        |-- IntroScene.js
        |-- TimelineScene.js
        `-- Phase1Scene.js
```

O Phaser e carregado via CDN, portanto a primeira abertura requer conexao com
a internet.
