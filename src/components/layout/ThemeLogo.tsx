import { useTheme } from 'next-themes';
import logoClaro from '@/assets/Logomodoclaro.png';
import logoEscuro from '@/assets/Logomodoescuro.png';

interface ThemeLogoProps {
  className?: string;
  alt?: string;
}

export function ThemeLogo({ className, alt = "PreciBake" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === 'dark' ? logoEscuro : logoClaro;
  return <img src={src} alt={alt} className={className} />;
}
