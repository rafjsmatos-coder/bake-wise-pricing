import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';

export function VideoSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Veja como funciona em 60 segundos
          </h2>
          <p className="text-lg text-muted-foreground">
            Do cadastro do ingrediente ao preço final — sem complicação
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-muted/50 flex items-center justify-center cursor-pointer group">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto group-hover:bg-accent/20 transition-colors">
                    <Play className="w-10 h-10 text-accent ml-1" />
                  </div>
                  <p className="text-muted-foreground text-sm">Vídeo em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
