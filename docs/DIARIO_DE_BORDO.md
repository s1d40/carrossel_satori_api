# 📖 Diário de Bordo: Carrossel Viral Engine

Este documento registra a evolução arquitetural e as tomadas de decisão ao longo da construção da nossa API de Direção de Arte Automatizada.

---

### 📅 Dia 1 (Terça-feira, 31 de Março de 2026)
**Foco Inicial: Fundação e Renderização Determinística**
- **O Desafio:** Criar uma forma autônoma de sobrepor textos dinâmicos em fundos de imagem sem perder qualidade, escapando do modelo travado de *templates* de Photoshop.
- **A Solução (Backend):** Implementamos o motor com Node.js usando `Express` e configuramos o `Satori` com `@resvg/resvg-js`. A pilha garante transformação de Árvores JSX (Estilo React) diretamente para Buffers `.png`.
- **Zod Shield:** Blindamos a porta de entrada com `Zod`, exigindo um formato rígido no payload do Agente de IA.
- **Engenharia de Destaque:** Para resolver a quebra de narrativa, montamos no `imageGenerator.ts` um Parser via Expressão Regular (Regex) que fatia textos com Asteriscos duplos (`**palavra**`) e injeta o Node Flexbox condicionalmente com um `highlightColor` vibrante para hackear a atenção.
- Criamos a estrutura fundacional de Documentação (`/docs/README.md` e Design System).

---

### 📅 Dia 2 (Quarta-feira, 1º de Abril de 2026)
**Foco: Magnética Visual e Legibilidade Extrema**
- Notamos que fundos aleatórios do Midjourney matavam o texto branco moderno (Inter 80px). O contraste oscilava e falhava redondamente.
- **Overlays Múltiplos:** Atualizamos a engine do Satori para parar de pintar degradês hardcoded e introduziu os objetos dinâmicos: `top-gradient` e `bottom-gradient`.
- **Queda de Opacidade (FallOff):** Injetamos múltiplas camadas de transparência (`1`, `0.95`, `0.7`, `0`) para garantir o padrão de cinema, criando um poço negro para a tipografia pousar em extrema segurança visual.
- **Separação Responsiva (Ancoragem):** Implementamos o `flexGrow: 1` controlável. O texto deixou de ser rígido no centro e passou a ser alocado magneticamente para a Margem Inferior ou Margem Superior da imagem conforme o Agente decidisse.

---

### 📅 Dia 4 (Sexta-feira, 8 de Maio de 2026 - HOJE)
**Foco: Escalabilidade Global e Cloud Ready**
Preparamos o microsserviço para sair do ambiente local (`localhost`) e ser implantado em infraestrutura de escala mundial no Google Cloud Run.

1. **Dockerização e Padronização:**
   - Criamos o `Dockerfile` otimizado para Node.js 20, com separação de estágios de *Build* e *Production* para minimizar o tamanho da imagem final.
   - Incluímos dependências nativas para o `sharp` (libvips) dentro do container, garantindo que o processamento de imagens seja idêntico ao ambiente local.
   - Configuramos o `.dockerignore` para manter a imagem limpa e segura, excluindo arquivos de teste e segredos.

2. **Conformidade Cloud Run:**
   - O servidor Express foi validado para respeitar a variável de ambiente `PORT` injetada pelo Cloud Run.
   - Criamos um guia completo de implantação em `docs/DEPLOYMENT.md` cobrindo o ciclo de vida desde a configuração do GCloud SDK até o comando de deploy final.

3. **Arquitetura de Documentação:**
   - Atualizamos o `README.md` centralizando o acesso ao guia de deploy, tornando o projeto auto-contido para administradores de sistema.
