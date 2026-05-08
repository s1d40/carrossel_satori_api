# Princípios de Design e Hierarquia Visual 🎨

Este guia explica como a API do Gerador de Carrossel garante resultados virais e profissionais.

## 1. Categorias de Slides e Dinâmica de Conteúdos

Nossa API entende a intenção de marketing de um slide através da propriedade `slideCategory`, que infere como exibir o corpo principal:
- **`hook`**: Projetado para atrair atenção com uma headline gigantesca.
- **`body`**: Um layout focado em distribuição de conteúdo. Compatível com a propriedade `bullets` que possibilita criar bullet points impactantes.
- **`cta`**: O slide de "Call to Action", ideal para salvar post, preenchido tipicamente usando o `actionIndicator` de `save-button`.

## 2. Sistema de Películas (Contrast Overlays)

Para que o texto nunca desapareça em fundos claros ou complexos:

- **Bottom-Gradient**: Ideal para layout na base (anchor 'bottom'). Cria uma sombra densa de transição suave.
- **Top-Gradient**: Ideal para anchor top, projeta peso do topo do layout preservando o foco principal da imagem embaixo.
- **Full-Dark**: Escurece toda a imagem uniformemente. Minimalismo dark mode.
- **Blur-Box**: Uma moldura translúcida focado num contêiner retangular que borra elegantemente as bordas para destacar tipografias premium.
- **Linha White**: Adicionamos também `white-bottom-gradient` e `white-blur-box` para cenários clínicos ou clean, onde a leitura pede uma mescla clara com texto escuro garantido pela Trava de Segurança.
- **Film-Grain Layer**: Uma propriedade de texturização ultrapremium que insere um ruído na foto (Noise Overlay gerado em vetores SVG integrados) propício a estilos artísticos e fotográficos independentes.

Além disso, a API implementa os **Filtros de Imagem** (`imageFilter` no Theme) que conseguem renderizar efeitos clássicos e conceituais como *Grayscale*, *Vintage*, *Duotone* e *Ethreal* nativamente nas imagens sem uso de CSS pesados de client-side.

## 3. Ancoragem Magnética e Formas Híbridas (Image Masks)

Temos um layout que vai além do "preso abaixo" em formato full-bleed:
- `anchor`: `"top"`, `"center"`, ou `"bottom"`. Determina o pilar principal do texto (flex-start, center, flex-end respectivamente).
- `textAlign`: Pode ser configurado facilmente à esquerda, centralizado ou à direita.
- **Image Frame Moderno**: Quer afastar de visual full-bleed e criar algo Clean e Editorial Escalonado? Opcionalmente solicite `imageFrame` como `"arch"`, `"circle"`, `"square"` ou `"soft-arch"`. 
    - Dimensões expandidas: Nossos frames renderizam mais próximos das bordas com `1000px` de largura, ampliando a mancha de absorção visual.
    - O `"soft-arch"` introduz uma máscara híbrida vetorizada onde a borda inferior esfuma suavemente (Feathering com feGaussianBlur), provendo um fading linear em gradiente entre a base da imagem e a margem branca onde o texto começará, resolvendo o contorno em formatos editoriais complexos.
- **Branding & Action**: Um footer que opcionalmente traz meta-dados como `avatarUrl`, `@handle` e contagem de `pagination`.

## 4. Famílias Tipográficas

Abandonamos restrições rígidas. Nossa API baixa, armazena em cache nativo (TTF buffer) e renderiza em super velocidade as seguintes fontes:
- **Headline Fonts**: `Montserrat`, `Bebas Neue`, `Poppins`, `Anton`, `Oswald`, `Playfair Display`, e `Inter`.
- **Body Fonts**: `Roboto`, `Inter`, `Open Sans`, e `Lato`.
