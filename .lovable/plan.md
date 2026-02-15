

## Personalizar o sistema com a logo e icone do PreciBake

### Resumo
Substituir o icone generico de bolo (Cake do Lucide) pela logo e icone oficiais do PreciBake em todo o sistema.

### Arquivos de imagem

Tres imagens serao copiadas para o projeto:

- **Icone** (`src/assets/precibake-icon.jpeg`) - Etiqueta com "P", para uso em espacos pequenos (sidebar compacto, favicon, PWA)
- **Logo sem slogan** (`src/assets/precibake-logo.jpeg`) - Icone + "PreciBake", para sidebar, headers e navegacao
- **Logo com slogan** (`src/assets/precibake-logo-full.jpeg`) - Logo + "O ponto certo do preco", para landing page e telas de autenticacao

Adicionalmente, o icone sera copiado para `public/` para uso como favicon e icones PWA.

### Locais de substituicao

| Arquivo | Local | Imagem usada |
|---------|-------|-------------|
| `AppLayout.tsx` | Logo na sidebar + header mobile | Logo sem slogan |
| `HeroSection.tsx` | Header da landing page | Logo sem slogan |
| `StickyHeader.tsx` | Header fixo ao rolar | Logo sem slogan |
| `Footer.tsx` | Rodape | Logo sem slogan |
| `AuthForm.tsx` | Tela de login/cadastro | Logo com slogan |
| `ForgotPasswordForm.tsx` | Tela de esqueci a senha | Icone |
| `ResetPasswordForm.tsx` | Tela de redefinir senha | Icone |
| `PrivacyPolicy.tsx` | Pagina de privacidade | Logo sem slogan |
| `TermsOfService.tsx` | Pagina de termos | Logo sem slogan |
| `ExampleSection.tsx` | Secao de exemplo na landing | Icone |
| `index.html` | Favicon | Icone (via public/) |

### Detalhes tecnicos

**1. Copiar imagens para o projeto**
- `user-uploads://...3.jpeg` para `src/assets/precibake-icon.jpeg` e `public/precibake-icon.png`
- `user-uploads://...2.jpeg` para `src/assets/precibake-logo.jpeg`
- `user-uploads://...1.jpeg` para `src/assets/precibake-logo-full.jpeg`

**2. Em cada componente:**
- Remover o import do `Cake` de lucide-react (quando nao usado para mais nada)
- Importar a imagem adequada: `import precibakeLogo from '@/assets/precibake-logo.jpeg'`
- Substituir `<Cake className="..." />` por `<img src={precibakeLogo} alt="PreciBake" className="..." />`
- Ajustar tamanhos via classes Tailwind (`h-8 w-8`, `h-10`, etc.)

**3. Favicon e PWA**
- Atualizar `index.html` para apontar para `/precibake-icon.png`
- Atualizar `apple-touch-icon` para o novo icone
- Atualizar os icones PWA em `vite.config.ts` se necessario

**4. Remover containers de fundo**
- Os `<div className="bg-accent/10 rounded-lg">` que envolviam o icone Cake serao removidos ou ajustados, ja que a logo tem seu proprio fundo/estilo

### Observacao sobre qualidade
Como voce mencionou que as imagens nao estao com qualidade muito boa, elas serao usadas nos tamanhos menores para minimizar a perda de nitidez. Se futuramente voce tiver versoes em PNG com fundo transparente e maior resolucao, basta substituir os arquivos.

