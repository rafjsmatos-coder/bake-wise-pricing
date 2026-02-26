

## Trocar Logo Automaticamente no Dark Mode

Todos os 7 arquivos que exibem o logo importam apenas `Logomodoclaro.png`. A solucao e criar um componente reutilizavel `ThemeLogo` que alterna entre as duas versoes com base no tema ativo.

---

### 1. Criar componente `src/components/layout/ThemeLogo.tsx`

Componente simples que usa `useTheme()` do `next-themes` para renderizar a imagem correta:

- Tema claro: `Logomodoclaro.png`
- Tema escuro: `Logomodoescuro.png`
- Aceita props `className` e `alt` para flexibilidade

```text
import { useTheme } from 'next-themes';
import logoClaro from '@/assets/Logomodoclaro.png';
import logoEscuro from '@/assets/Logomodoescuro.png';

export function ThemeLogo({ className, alt = "PreciBake" }) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === 'dark' ? logoEscuro : logoClaro;
  return <img src={src} alt={alt} className={className} />;
}
```

---

### 2. Substituir `<img src={precibakeLogo}>` pelo `<ThemeLogo>` em 7 arquivos

| Arquivo | Locais |
|---------|--------|
| `AppLayout.tsx` | Header mobile + sidebar desktop (2 usos) |
| `AuthForm.tsx` | Logo no card de login (1 uso) |
| `StickyHeader.tsx` | Header fixo da landing (1 uso) |
| `HeroSection.tsx` | Nav da hero section (1 uso) |
| `Footer.tsx` | Rodape da landing (1 uso) |
| `PrivacyPolicy.tsx` | Header da pagina (1 uso) |
| `TermsOfService.tsx` | Header da pagina (1 uso) |

Em cada arquivo: remover o `import precibakeLogo` e substituir as tags `<img>` por `<ThemeLogo className="..." />`.

---

### Resultado

O logo mudara automaticamente ao alternar o tema, sem alterar layout ou estilos.

