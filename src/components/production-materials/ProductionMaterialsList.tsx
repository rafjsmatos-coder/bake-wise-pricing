import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useProductionMaterials, ProductionMaterial } from '@/hooks/useProductionMaterials';
import { ProductionMaterialCard } from './ProductionMaterialCard';
import { ProductionMaterialForm } from './ProductionMaterialForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ProductionMaterialsList() {
  const { materials, isLoading, deleteMaterial } = useProductionMaterials();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProductionMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<ProductionMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = materials.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (material: ProductionMaterial) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingMaterial) {
      await deleteMaterial.mutateAsync(deletingMaterial.id);
      setDeletingMaterial(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingMaterial(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materiais de Produção</h1>
          <p className="text-muted-foreground">Gerencie luvas, toucas, sacos de confeitar e outros materiais</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Material
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar materiais..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Nenhum material encontrado com esta busca.'
                : 'Nenhum material cadastrado ainda.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Material
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((material) => (
            <ProductionMaterialCard
              key={material.id}
              material={material}
              onEdit={() => handleEdit(material as ProductionMaterial)}
              onDelete={() => setDeletingMaterial(material as ProductionMaterial)}
            />
          ))}
        </div>
      )}

      <ProductionMaterialForm
        open={formOpen}
        onOpenChange={handleFormClose}
        material={editingMaterial}
      />

      <AlertDialog open={!!deletingMaterial} onOpenChange={() => setDeletingMaterial(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir material?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingMaterial?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
