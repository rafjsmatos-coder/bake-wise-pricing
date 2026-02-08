import { Badge } from '@/components/ui/badge';
import { Star, ArrowUpCircle, Wrench } from 'lucide-react';
import type { SystemUpdate } from '@/hooks/useSystemUpdates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpdateCardProps {
  update: SystemUpdate;
  isNew?: boolean;
}

const typeConfig = {
  feature: {
    label: 'Novidade',
    icon: Star,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  improvement: {
    label: 'Melhoria',
    icon: ArrowUpCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  fix: {
    label: 'Correção',
    icon: Wrench,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    badgeClass: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
};

export function UpdateCard({ update, isNew }: UpdateCardProps) {
  const config = typeConfig[update.type] || typeConfig.improvement;
  const Icon = config.icon;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.bgColor}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className={config.badgeClass}>
              {config.label}
            </Badge>
            {isNew && (
              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                Novo
              </Badge>
            )}
            {update.published_at && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(update.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground mb-2">{update.title}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{update.content}</p>
        </div>
      </div>
    </div>
  );
}
