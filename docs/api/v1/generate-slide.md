# Referência de API: Generating Slide 🚀

Este documento descreve detalhadamente o funcionamento do endpoint principal para geração de imagens.

## 1. POST /api/v1/generate-slide

Gera uma imagem PNG de alta resolução (1080x1350) com um layout otimizado para carrosséis.

### Cabeçalhos (Headers)
- `Content-Type: application/json`

### Estrutura do Payload (Request Body)

O Payload foi estendido para suportar formatações ricas, categorias de design e controle avançado.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `backgroundImageUrl` | string (url) | Sim | - | URL da imagem de fundo. |
| `slideCategory` | enum | Não | `"hook"` | Categoria visual do slide (`"hook"`, `"body"`, `"cta"`). |
| `content` | Object | Sim | - | Objeto contendo os textos do slide. |
| `content.headline` | string | Sim | - | Título ou texto principal. |
| `content.subHeadline` | string | Não | - | Subtítulo ou corpo complementar do slide. |
| `content.bullets` | Array\<string\> | Não | - | Lista de marcação em texto, máximo 4 itens. |
| `theme` | Object | Não | (Veja abaixo) | Configuração do estilo visual (fontes e propriedades). |
| `theme.textColor` | string (hex) | Não | `"#FFFFFF"` | Cor base do texto e bullets. |
| `theme.highlightColor`| string (hex) | Não | `"#E4AD75"` | Cor de destaque de texto/elementos. |
| `theme.highlightStyle`| enum | Não | `"color"` | Enum: `"color"` ou `"box"`. Define o modo do destaque. |
| `theme.imageFilter` | enum | Não | `"none"` | Filtro CSS para imagem: `"none"`, `"grayscale"`, `"sepia"`, `"vintage"`, `"dark-moody"`, `"duotone"`, `"ethereal"`, `"matte"`. |
| `theme.headlineFont` | enum | Não | `"Montserrat"` | Fontes: `"Inter"`, `"Montserrat"`, `"Bebas Neue"`, `"Poppins"`, `"Anton"`, `"Oswald"`, `"Playfair Display"`. |
| `theme.bodyFont` | enum | Não | `"Inter"` | Fontes corporais: `"Roboto"`, `"Inter"`, `"Open Sans"`, `"Lato"`. |
| `theme.textShadow` | boolean | Não | `false` | Se ativo, injeta um Drop Shadow fluído em oposição de contraste ao fundo. |
| `theme.textOutline` | boolean | Não | `false` | Se ativo, injeta um fechamento por linha Outline externa com CSS nativo do motor. |
| `layout` | Object | Não | - | Configurações de fluxo do texto na tela. |
| `layout.anchor` | enum | Não | `"bottom"` | Posicionamento base: `"top"`, `"center"`, `"bottom"`. |
| `layout.textAlign` | enum | Não | `"left"` | Alinhamento do texto: `"left"`, `"center"`, `"right"`. |
| `layout.imageFrame` | enum | Não | `"full"` | Moldura da imagem no Layout: `"full"`, `"arch"`, `"circle"`, `"square"`, `"soft-arch"`. (Se != "full", injetará máscaras e usará cor sólida ao fundo). |
| `branding` | Object | Não | - | Dados de marca ou criador de conteúdo. |
| `branding.avatarUrl` | string (url) | Não | - | Imagem redonda do autor para o slide CTA/Watermark. |
| `branding.handle` | string | Não | - | Username, ex: `"@johndoe"`. |
| `pagination` | Object | Não | - | Paginação e contagem do carrossel (no rodapé). |
| `pagination.current` | number | Não | - | Página atual (ex: `1`). |
| `pagination.total` | number | Não | - | Total de páginas (ex: `5`). |
| `overlay` | Object | Não | - | Configurações da película de contraste sobre a imagem. |
| `overlay.enabled` | boolean | Não | `false` | Se ativado, exibe um filtro sólido/degrade de contraste. |
| `overlay.type` | enum | Não | `"bottom-gradient"`| Opções: `"bottom-gradient"`, `"top-gradient"`, `"full-dark"`, `"blur-box"`, `"white-bottom-gradient"`, `"white-blur-box"`, `"film-grain"`. |
| `overlay.height` | string | Não | `"75%"` | Altura percorrida pelo gradiente ou caixa blur. |
| `overlay.opacity` | number | Não | `0.8` | Intensidade do overlay (0 a 1). |
| `actionIndicator` | Object | Não | - | Opicionais para botões de ação e swipe. |
| `actionIndicator.type`| enum | Não | - | Opções: `"swipe-arrow"`, `"swipe-text"`, `"save-button"`. |


### Exemplo de Chamada (cURL)

```bash
curl -X POST http://localhost:3000/api/v1/generate-slide \
-H "Content-Type: application/json" \
-d '{
  "backgroundImageUrl": "https://example.com/hero.jpg",
  "slideCategory": "hook",
  "content": {
    "headline": "O segredo do Design Viragem",
    "subHeadline": "Contraste denso e tipografia de alto impacto.",
    "bullets": ["Primeiro ponto", "Segundo ponto importante"]
  },
  "theme": {
    "textColor": "#FFFFFF",
    "highlightColor": "#FACC15",
    "highlightStyle": "color",
    "imageFilter": "vintage",
    "headlineFont": "Bebas Neue",
    "bodyFont": "Inter"
  },
  "layout": {
    "anchor": "bottom",
    "textAlign": "left"
  },
  "branding": {
    "avatarUrl": "https://example.com/avatar.png",
    "handle": "@sua_marca"
  },
  "pagination": {
    "current": 1,
    "total": 5
  },
  "overlay": {
    "enabled": true,
    "type": "blur-box",
    "opacity": 0.90
  },
  "actionIndicator": {
    "type": "swipe-arrow"
  }
}' --output slide-resultado.png
```

### Respostas (Responses)

- **200 OK**: Retorna o binário da imagem PNG. `Content-Type: image/png`.
- **400 Bad Request**: Erro de validação gerado pelo Zod (JSON inválido, faltando campos ou dados mal formados). Retorna `{ "error": "...", "details": [...] }`.
- **500 Internal Server Error**: Erro inesperado ao parsear layout, carregar fontes via serviço externo ou processar o `Satori / resvg`.
