
# Reposicionar ThemeToggle no Desktop

## Problema
No **mobile**, o ThemeToggle fica no header fixo ao lado do Refresh e Search (linha 316).
No **desktop**, o ThemeToggle fica escondido dentro da sidebar, em uma seção inferior scrollável (linha 376).

Resultado: No desktop, o botão fica pouco acessível e não mantém consistência visual com o mobile.

## Solução
Criar uma **barra de controles fixa no desktop** logo abaixo do logo da sidebar (área de header) com:
- **ThemeToggle** (ícone sol/lua)
- **Botão Refresh** (atualizar página)
- **Botão Search** (abrir busca global, se `onSearchOpen` fornecido)

Essa barra terá `h-12` (altura fixa), estará imediatamente abaixo da seção do logo (`h-14`), e manterá os botões sempre visíveis e acessíveis, exatamente como no mobile.

## Mudanças
1. **src/components/layout/AppLayout.tsx**:
   - Remover `ThemeToggle` da seção inferior da sidebar (linha 375-377)
   - Adicionar nova seção na sidebar logo após o logo, com uma div `flex gap-1` contendo: ThemeToggle (com `h-9 w-9`), Refresh button, e Search button (se `onSearchOpen` existe)
   - Aplicar classes: `flex items-center justify-between p-2 border-b border-border`

## Resultado
ThemeToggle fica acessível e visível no desktop, alinhado com o posicionamento no mobile — sem necessidade de scroll na sidebar.

