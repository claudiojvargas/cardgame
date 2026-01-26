# 🎴 Card Game (MVP)

Um jogo de cartas por turnos feito em **TypeScript**, com arquitetura separando bem o **motor do jogo (game engine)** da **interface (frontend)**.

Este projeto está sendo desenvolvido com foco em um **MVP jogável**, com combate por turnos, sistema de turnos e modo **Tower (andar/floor)**.

---

## ✅ Objetivo do MVP

Entregar uma versão mínima jogável com:

- Combate por turnos (Player vs Enemy) com até 3 cartas em campo por lado
- Ações básicas (ataque)
- Vida / dano por carta
- Progressão por andares (Tower Mode)
- IA simples para o inimigo
- Interface em React para jogar no navegador

✅ **Status atual**: os itens acima já estão implementados e jogáveis no modo Torre.

---

## 🧠 Arquitetura

O projeto é dividido em duas partes principais:

### `game/` (Core / Engine)
Contém toda a lógica do jogo, independente de interface.

- Entidades (Player, Enemy, Card, etc.)
- Estado do jogo (`GameState`)
- Regras de turno e combate
- IA
- Tower (dificuldade por andar, fábrica de inimigos)

### `frontend/`
Interface do usuário feita em React + Vite.

- Telas como `TowerScreen`
- Componentes de UI (`GameBoard`)
- Hook para controlar o jogo (`useGame`)
- Renderização e interação no browser

✅ A UI consome o motor e **não contém regra de jogo**, apenas exibe e envia comandos.

---

## 📁 Estrutura do Projeto

```bash
.
├── frontend/              # React + UI
│   ├── src/
│   │   ├── screens/       # Telas (ex: TowerScreen)
│   │   ├── components/    # Componentes UI (GameBoard)
│   │   ├── hooks/         # Hooks do jogo (useGame)
│   │   └── main.tsx
│   └── index.html
│
├── game/                  # Engine do jogo
│   ├── core/              # GameState / lógica base
│   ├── entities/          # Player, Card, etc
│   ├── tower/             # Tower mode, dificuldade, factories
│   ├── ai/                # IA do inimigo
│
├── package.json
├── tsconfig.json
├── vite.config.js
└── .gitignore
