export const UI_BASE = {
  artboard: { width: 1080, height: 2400, aspectRatio: '20:9' },
  safeArea: { top: 140, bottom: 160, side: 36 },
  screenPadding: 36,
};

export const UI_SPACING = {
  space1: 8,
  space2: 16,
  space3: 24,
  space4: 32,
  space5: 40,
  space6: 48,
  space8: 64,
};

export const UI_ASSETS = {
  card: {
    ratio: '2:3',
    master: { width: 768, height: 1152 },
    thumb: { width: 256, height: 384 },
    mini: { width: 128, height: 192 },
    uiWidthClamp: 'clamp(220px, 24vw, 288px)',
  },
  icon: {
    normal: 64,
    large: 128,
  },
};

export const UI_TYPOGRAPHY = {
  title: { min: 32, max: 36 },
  subtitle: 24,
  text: { min: 18, max: 20 },
  micro: { min: 14, max: 16 },
  scaleRatio: 1.25,
};

export const UI_LAYOUT = {
  zones: {
    topBar: '10% da altura útil',
    content: '75–80% da altura útil',
    bottomBar: '15–20% da altura útil',
  },
  rules: [
    'Conteúdo nunca em cima da arte da carta (usar placas/bandas na moldura).',
    'Brilho/filigrana só na borda (centro limpo).',
    'Mesma linguagem de raridade em moldura, badge, brilho e drop.',
  ],
};
