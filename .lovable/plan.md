

## Implementar Screenshots Reais na Landing Page

Substituir os placeholders da secao `ScreenshotsSection` pelas 5 imagens reais enviadas pelo usuario, exibidas dentro de mockups de celular.

---

### Arquivos de imagem

Copiar as 5 imagens para `src/assets/screenshots/`:

| Arquivo | Conteudo |
|---------|----------|
| `dashboard.jpeg` | IMG_1068 - Dashboard principal |
| `product-cost.jpeg` | IMG_1069 - Detalhamento de custos |
| `order-calendar.jpeg` | IMG_1070 - Calendario de pedidos |
| `financial.jpeg` | IMG_1071 - Controle financeiro |
| `whatsapp-quote.jpeg` | IMG_1072 - Orcamento via WhatsApp |

---

### Mudancas em `ScreenshotsSection.tsx`

- Importar as 5 imagens como ES6 modules
- Substituir os placeholders (icone + "Print em breve") por `<img>` com as capturas reais
- Envolver cada imagem em uma moldura de celular usando CSS (borda arredondada, sombra, fundo escuro simulando a borda do dispositivo)
- Manter o carrossel horizontal com scroll e snap
- Cada card tera: imagem real + titulo + descricao curta abaixo

### Layout do mockup de celular (CSS puro)

```text
+-------------------+
|    (notch area)    |  <-- borda superior arredondada
|                    |
|   [screenshot]     |  <-- imagem real com object-fit: cover
|                    |
|                    |
+-------------------+
   Titulo do print
   Descricao curta
```

- Container com `rounded-[2rem]`, `border-4 border-gray-800`, `shadow-2xl`, `overflow-hidden`
- Imagem interna com `aspect-[9/19.5]` (proporcao de tela de celular) e `object-fit: cover`
- Fundo `bg-gray-900` para simular a moldura

### Dimensoes

- Largura de cada card: `min-w-[260px] md:min-w-[280px]`
- Altura da imagem: proporcional via aspect-ratio
- No mobile, o carrossel desliza horizontalmente com snap

