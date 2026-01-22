# 🎴 Card Game (MVP)

Um jogo de cartas por turnos feito em **TypeScript**, com arquitetura separando bem o **motor do jogo (game engine)** da **interface (frontend)**.

Este projeto está sendo desenvolvido com foco em um **MVP jogável**, com combate 1x1, sistema de turnos e modo **Tower (andar/floor)**.

---

## ✅ Objetivo do MVP

Entregar uma versão mínima jogável com:

- Combate por turnos (Player vs Enemy)
- Ações básicas (ataque)
- Vida / dano
- Progressão por andares (Tower Mode)
- IA simples para o inimigo
- Interface em React para jogar no navegador

---

## 📘 Documento do jogo (visão completa)

### ✅ Visão geral
Jogo de cartas por turnos feito em **TypeScript**, com foco em **combate 1x1**,
**IA simples**, **progressão por torre** e **UI em React** no navegador.

### 🎯 Objetivo do MVP
- Combate por turnos (Player vs Enemy)
- Ações básicas (ataque)
- Vida / dano
- Progressão por andares (Tower Mode)
- IA simples para o inimigo
- Interface web em React

---

## ⚔️ Batalha (turnos e resolução de ataques)

### Fluxo de turno
- O estado do jogo guarda turno, jogador atual e status da partida.
- A cada ataque resolvido, o turno alterna para o outro jogador.
- A UI dispara ataques via `BattleResolver.resolveAttack` tanto para Player quanto
  para a IA.

### Campo, compra e derrota
- Cada jogador tem **campo máximo de 3 cartas**.
- Quando uma carta morre, o jogador compra outra do deck (se houver).
- O deck tem **exatamente 6 cartas** e **não pode ter duplicatas**.
- O jogador perde quando fica sem cartas no campo (`field.length === 0`).

### Vida, poder e efeitos globais
- Cada carta nasce com **HP = poder calculado**.
- O dano usa o **poder efetivo** (poder com buffs percentuais).

---

## 🃏 Mecânica das cartas

### Estrutura da carta
Uma carta possui:
- classe
- raridade
- poder base
- nível de despertar
- HP
- buffs
- escudo
- debuffs (freeze / DOT)

### Classes disponíveis
- attack
- defense
- support
- control
- continuous
- evade
- chain
- strategy

### Raridades disponíveis
- common
- uncommon
- rare
- epic
- legendary
- mythic
- diamond

### Configuração de raridade
Cada raridade define:
- intervalo de poder base (min/max)
- limite máximo de despertar
- classe padrão de referência

Exemplos:
- **common**: poder 10–20, despertar até 3, classe base attack
- **rare**: poder 41–60, despertar até 5, classe base support
- **diamond**: poder 151–200, despertar até 10, classe base strategy

---

## ✅ Efeitos por classe (resumo técnico)

### attack
- **Ao entrar no campo:** +25% de poder.
- **Após atacar (proc):** 5% de chance de buffar +25% poder em aliados.

### defense
- **Ao entrar no campo:** escudo REFLECT_50 em até 2 aliados.
- **Proc:** 5% para trocar por TOTAL_REFLECT_100 nesses aliados.
- **Após atacar (proc):** 5% para dar TOTAL_REFLECT_100 para todos.

### support
- **Ao entrar no campo:** cura aliados (15% do poder base).
- **Proc:** 5% para cura maior (35%).

### control
- **Ao acertar ataque:** congela o defensor por 4 rodadas.
- **Proc:** 5% para congelar outro alvo extra.

### continuous
- **Após o ataque:** aplica DOT por 4 rodadas (5% do poder efetivo).
- **Proc:** 5% para atacar mais 1 alvo extra.

### evade
- **Ao acertar ataque (proc):** 5% de chance de ganhar escudo total.
- **Ao receber dano refletido:** ignora refletido.

### chain
- **Após o ataque:** acerta 1 alvo extra com o mesmo dano.
- **Proc:** 5% para acertar todos os inimigos.

### strategy
- **Ao entrar no campo:** +20% de poder para todo o time.
- **Início da rodada:** ataca 2 inimigos (25% do poder base).
- **Proc:** 10% para dar escudo total em todos os aliados.

### Observação sobre procs
Procs só são elegíveis para raridades **EPIC ou superiores**:
EPIC, LEGENDARY, MYTHIC, DIAMOND.

---

## 🧠 IA na batalha
- A IA avalia todos os pares atacante/defensor e escolhe com base em score.
- Dificuldade ajusta chance de errar ou escolher entre os melhores.

---

## 🏰 Torre (andars, inimigos e progresso)
- Torre vai até o **andar 30**.
- Progresso do andar é salvo no **localStorage**.
- O deck inimigo é gerado por raridade permitida por andar:
  - Até 5: comuns + incomuns
  - >5: adiciona raras
  - >12: épicas
  - >20: lendárias
  - >25: míticas + diamante
- Dificuldade por andar:
  - Easy até 10
  - Normal até 20
  - Hard depois disso
- Ao vencer, o jogador pode continuar ou sair.
- Cada vitória pode gerar um baú local ("Primeira conquista" ou "Repetição").
- Sistema de recompensa por andar:
  - Ouro fixo
  - Baú em 5/10/20/30
  - Diamantes bônus em 10/20/30

---

## 🔮 Combinação (fusão de repetidas)
- Usa **4 cartas repetidas** da mesma raridade.
- Gera carta da mesma raridade ou **upgrade**.
- Chance de upgrade: **2%**.
- Garantia por incenso:
  - 15 tentativas para raridades altas
  - 100 tentativas para diamante
- Consome duplicatas, sorteia carta e registra contador de incenso.

---

## ✨ Despertar (awakening)
- Consome duplicatas da mesma carta.
- Aumenta o poder em **+10% por nível**.
- Custo cresce conforme nível atual (`max(1, awakening)`).
- Limite máximo depende da raridade.

---

## 🎁 Baús
- Abrir baús gasta ouro, dá ouro de volta e **4 cartas**.
- Cada baú tem preço, faixa de ouro, raridades e pesos próprios.
- Cartas obtidas entram no inventário, marcadas como novas quando aplicável.

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
│   └── simulate.ts        # Simulação via terminal
│
├── package.json
├── tsconfig.json
├── vite.config.js
└── .gitignore
