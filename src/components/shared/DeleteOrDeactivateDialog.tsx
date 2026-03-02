import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Archive, Trash2, Loader2 } from 'lucide-react';
import { checkDependencies, type EntityType, type DependencyInfo } from '@/hooks/useDependencyCheck';

interface DeleteOrDeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  onHardDelete: () => void;
  onDeactivate: () => void;
  isLoading?: boolean;
  /** Extra warning shown for hard delete (e.g. price history will be lost) */
  hardDeleteWarning?: string;
}

const entityLabels: Record<EntityType, string> = {
  ingredient: 'ingrediente',
  recipe: 'receita',
  product: 'produto',
  packaging: 'embalagem',
  decoration: 'decoração',
  client: 'cliente',
};

export function DeleteOrDeactivateDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  onHardDelete,
  onDeactivate,
  isLoading,
  hardDeleteWarning,
}: DeleteOrDeactivateDialogProps) {
  const [deps, setDeps] = useState<DependencyInfo[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (open && entityId) {
      setChecking(true);
      checkDependencies(entityType, entityId)
        .then(setDeps)
        .finally(() => setChecking(false));
    }
  }, [open, entityId, entityType]);

  const hasDeps = deps.length > 0;
  const label = entityLabels[entityType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir {label}
          </DialogTitle>
          <DialogDescription>
            {checking ? (
              'Verificando dependências...'
            ) : hasDeps ? (
              <>
                <strong>{entityName}</strong> está sendo usado em:
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {deps.map((d) => (
                    <li key={d.table}>
                      {d.count} {d.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  Não é possível excluir permanentemente. Deseja <strong>desativar</strong>? O item ficará oculto nas listagens mas preservado no histórico.
                </p>
              </>
            ) : (
              <>
                <strong>{entityName}</strong> não está sendo usado em nenhum lugar. Deseja excluir permanentemente?
                {hardDeleteWarning && (
                  <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
                    ⚠️ {hardDeleteWarning}
                  </p>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          {checking ? (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verificando...
            </Button>
          ) : hasDeps ? (
            <Button
              variant="secondary"
              onClick={onDeactivate}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
              Desativar
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={onHardDelete}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir permanentemente
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
