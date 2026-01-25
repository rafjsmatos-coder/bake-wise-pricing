import { Cake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Cake className="w-4 h-4 text-accent" />
            </div>
            <span className="font-semibold text-foreground">Confeitaria Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Confeitaria Pro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
