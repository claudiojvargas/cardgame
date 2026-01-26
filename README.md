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
Contém toda a lógica do jogo, independente de interface. A fonte de verdade das cartas
fica em `game/data/cardDefinitions.ts`, e a camada runtime cria instâncias via
`createCardFromDefinition` em `game/data/cardFactory.ts`.

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
As definições de cartas são centralizadas em `CARD_DEFINITIONS` e qualquer criação
de carta deve passar pela factory para manter defaults consistentes.

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
```

---

## 🎨 Padrão global de UI (design system)

Use este padrão como referência para todas as telas do jogo.

### 1) Resolução base + safe area
- Artboard: **1080 × 2400 (20:9)**
- Safe area: **Top 140 / Bottom 160 / Side 36**
- Screen padding: **36** (lado) dentro do safe

### 2) Grid e espaçamentos (tokens)
- Use múltiplos de **8px**
  - `space-1 = 8`
  - `space-2 = 16`
  - `space-3 = 24`
  - `space-4 = 32`
  - `space-5 = 40`
  - `space-6 = 48`
  - `space-8 = 64`

### 3) Proporções oficiais de assets
- Carta (sempre **2:3**)
  - Master card art + frame/overlay: **768 × 1152**
  - Thumb (inventário/codex): **256 × 384**
  - Mini (HUD/loot): **128 × 192**
- Ícones
  - **64 × 64** (normal)
  - **128 × 128** (grande / destaque)

### 4) Tamanho padrão da carta na UI (render)
- `width: clamp(220px, 24vw, 288px)`
- `height: auto` via `aspect-ratio: 2/3`

### 5) Zonas padrão de layout (todas as telas)
- **Top Bar (10%)**: voltar, título, moedas/config
- **Content (75–80%)**: listas, campos, cartas etc.
- **Bottom Bar (15–20%)**: CTA principal (Atacar, Abrir, Fundir, Despertar)

### 6) Tipografia (escala simples)
- Título: **32–36**
- Subtítulo: **24**
- Texto: **18–20**
- Micro: **14–16**
- Escala: **1.25x**

### 7) Regras visuais (consistência)
- Conteúdo **nunca** em cima da arte da carta (use placas/bandas da moldura).
- Brilho/filigrana só na borda (centro limpo).
- Mesma linguagem de raridade (cores/efeitos) em moldura, badge, brilho e drop.

### ✅ Checklist de padrões
- UI base: **1080×2400**
- Safe: **Top 140 / Bottom 160 / Side 36**
- Grid: **8px**
- Carta master: **768×1152 (2:3)**
- Thumb: **256×384**
- Card UI size: `clamp(220px, 24vw, 288px)` + `aspect-ratio: 2/3`
- Layout de telas: **TopBar + Content + BottomCTA**
