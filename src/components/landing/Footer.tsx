import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { ThemeLogo } from '@/components/layout/ThemeLogo';

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="py-8 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ThemeLogo className="h-8 object-contain" />
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://instagram.com/precibake"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Instagram className="h-4 w-4" />
              @precibake
            </a>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/privacidade" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/termos" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos de Uso
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PreciBake. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
