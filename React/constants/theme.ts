/**
 * Tokens de design do app "Bomba Bet" — tema escuro + dourado.
 * Contraste verificado AAA (>= 7:1) sobre os fundos bg/surface.
 * Regra: textSecondary é o cinza mais escuro permitido em texto essencial.
 * NUNCA usar cores hardcoded nas telas — sempre importar daqui.
 *
 * "Tokens de design" são valores reutilizáveis (cores, espaçamentos, etc.)
 * centralizados num único lugar para manter o visual consistente no app inteiro.
 */
export const theme = {
  // Paleta de cores do app.
  colors: {
    bg: '#0B0B0C',          // cor de fundo principal (quase preto)
    surface: '#161618',     // fundo de cartões/superfícies elevadas
    surfaceAlt: '#1F1F23',  // variação de superfície (um tom mais claro)
    border: '#2E2E33',      // cor de bordas e divisórias
    textPrimary: '#FFFFFF', // texto principal (branco) — máximo contraste
    textSecondary: '#CED2D8', // texto secundário (cinza claro) — menor destaque
    accent: '#FFC107',      // cor de destaque (dourado) — botões/ações principais
    accentText: '#0B0B0C',  // texto que fica POR CIMA do dourado (escuro, p/ contraste)
    success: '#5EE6A0',     // verde de sucesso (ex.: acerto/positivo)
    danger: '#FF8A8A',      // vermelho de erro/alerta
    live: '#FF8A8A',        // cor para indicar partida "ao vivo"
    scheduled: '#CED2D8',   // cor para indicar partida "agendada"
  },
  // Escala de espaçamentos (margens/paddings) em pixels — do menor ao maior.
  spacing: {
    xs: 4,   // extra pequeno
    sm: 8,   // pequeno
    md: 12,  // médio
    lg: 16,  // grande
    xl: 24,  // extra grande
    xxl: 32, // duplo extra grande
  },
  // Escala de arredondamento de cantos (border radius) em pixels.
  radius: {
    sm: 8,    // cantos pouco arredondados
    md: 12,   // médio
    lg: 16,   // grande
    xl: 20,   // extra grande
    full: 999, // valor alto = círculo/pílula totalmente arredondada
  },
  // Estilos de tipografia (tamanho + peso da fonte) por tipo de texto.
  font: {
    h1: { fontSize: 24, fontWeight: '700' as const },    // título de nível 1 (negrito)
    h2: { fontSize: 20, fontWeight: '700' as const },    // título de nível 2 (negrito)
    title: { fontSize: 17, fontWeight: '600' as const }, // títulos menores (semi-negrito)
    body: { fontSize: 15, fontWeight: '400' as const },  // texto corrido (normal)
    label: { fontSize: 13, fontWeight: '500' as const }, // rótulos de campos (médio)
    caption: { fontSize: 12, fontWeight: '400' as const }, // legendas pequenas (normal)
  },
  // "as const" congela o objeto: o TypeScript trata cada valor como literal
  // imutável (ex.: o tipo de bg é exatamente '#0B0B0C', não apenas string).
} as const;

// Tipo derivado automaticamente do objeto theme acima.
// Permite usar "Theme" como tipo em funções que recebem o tema.
export type Theme = typeof theme;
