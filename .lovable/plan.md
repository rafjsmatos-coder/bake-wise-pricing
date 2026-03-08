

# Dica de formatação no campo "Modo de Preparo"

## Problema
O campo de instruções formata automaticamente cada linha como um passo numerado (1, 2, 3...) na visualização, mas o placeholder atual ("Descreva o passo a passo da receita...") não comunica isso ao usuário.

## Solução
Adicionar um texto auxiliar (`helperText`) abaixo do campo `Textarea` explicando o comportamento, e melhorar o placeholder para ser mais descritivo.

### Mudanças em `src/components/recipes/RecipeForm.tsx` (linhas 455-464):
- Alterar o `placeholder` para algo como:
  ```
  "Misture os ingredientes secos\nAdicione os líquidos\nLeve ao forno por 30 min"
  ```
- Adicionar um `<p>` com classe `text-xs text-muted-foreground` abaixo do Textarea:
  ```
  "Cada linha será exibida como um passo numerado (1, 2, 3...)"
  ```

Resultado: O usuário entende imediatamente que pular linha = novo passo numerado.

