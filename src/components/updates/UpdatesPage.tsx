import { useEffect } from 'react';
import { useSystemUpdates } from '@/hooks/useSystemUpdates';
import { UpdateCard } from './UpdateCard';
import { Newspaper, Loader2 } from 'lucide-react';

export function UpdatesPage() {
  const { updates, isLoading, lastSeenAt, markAsSeen } = useSystemUpdates();

  useEffect(() => {
    if (updates.length > 0) {
      markAsSeen();
    }
  }, [updates.length]);

  const isNewUpdate = (publishedAt: string | null) => {
    if (!publishedAt) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(publishedAt) > sevenDaysAgo;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Newspaper className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Novidades</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe as últimas atualizações e melhorias do PreciBake
          </p>
        </div>
      </div>

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Nenhuma novidade ainda</h3>
          <p className="text-sm text-muted-foreground">
            Fique atento, em breve teremos novidades para você!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              isNew={isNewUpdate(update.published_at)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
