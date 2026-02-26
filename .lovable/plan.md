

## Atualizacao Completa dos Assets Visuais do PreciBake

Atualizar todos os icones, favicons, banner OG e logos do projeto com os novos arquivos enviados, sem alterar layout ou estilos.

---

### 1. Copiar arquivos para /public

Copiar todos os 10 arquivos enviados para a pasta `public/`:

- `bannerog.png` - Banner Open Graph (1200x630)
- `Iconapp-1024.png` - Icone master (1024x1024)
- `icon-512.png` - PWA icon (512x512)
- `icon-192.png` - PWA icon (192x192)
- `apple-touch-icon-180.png` - Apple touch icon (180x180)
- `favicon-48.png` - Favicon 48x48
- `favicon-32.png` - Favicon 32x32
- `favicon-16.png` - Favicon 16x16
- `Logomodoclaro.png` - Logo modo claro
- `Logomodoescuro.png` - Logo modo escuro

---

### 2. Atualizar `index.html` - Meta tags e favicons

**Favicon** (linha 15): Substituir o favicon unico por 3 tamanhos:
```html
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
```

**Apple Touch Icon** (linha 16): Atualizar para:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />
```

**Open Graph** (linhas 22-24): Atualizar imagem e dimensoes:
```html
<meta property="og:image" content="https://precibake.com.br/bannerog.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

**Twitter Cards**: Adicionar apos as tags OG:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://precibake.com.br/bannerog.png" />
```

---

### 3. Atualizar `vite.config.ts` - Manifest PWA

Atualizar os icones no manifest do VitePWA para referenciar os novos arquivos:

```text
icons: [
  { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
  { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
]
```

---

### 4. Atualizar referencias internas nos componentes

Verificar e atualizar qualquer componente que importe os logos antigos (`precibake-logo.jpeg`, `precibake-logo-full.jpeg`, `precibake-icon.jpeg`) para usar os novos arquivos. Os logos de modo claro/escuro serao copiados tambem para `src/assets/` para uso nos componentes React.

---

### Resumo de arquivos alterados

| Arquivo | Mudanca |
|---------|---------|
| `public/` (10 arquivos) | Novos assets copiados |
| `index.html` | Favicons, apple-touch-icon, OG image, Twitter cards |
| `vite.config.ts` | Icones do manifest PWA |
| Componentes com logos | Atualizar imports dos logos (se necessario) |

