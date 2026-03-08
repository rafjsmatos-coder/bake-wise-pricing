

# Acesso Admin pelo PWA — Abordagem Mais Segura

## Concordo — o gesto secreto é frágil

O "5 toques na versão" pode ser descoberto acidentalmente ou por engenharia social. Vamos usar uma abordagem melhor.

## Solução: Mostrar botão "Painel Admin" **apenas para quem já tem role admin**

A ideia é simples: no menu de Configurações (ou no MoreMenu), verificar se o usuário logado tem role `admin` no backend. Se sim, mostrar um botão discreto "Painel Admin" que navega para `/admin`. Se não tem role, o botão nunca aparece.

### Por que é seguro?
- A verificação usa a Edge Function `check-admin-role` que já existe — validação 100% no backend
- Usuários comuns **nunca veem** o botão — nem sabem que existe
- Mesmo que alguém inspecione o código fonte e force a navegação para `/admin`, a tela de login + verificação de role impede o acesso
- Zero risco de acesso acidental

### Implementação

1. **No `MoreMenu.tsx`** (menu "Mais" do BottomNav): adicionar item condicional "Painel Admin" com ícone `Shield`, visível apenas quando `isAdmin === true`
2. **Usar o hook `useAdminRole`** já existente para verificar o role — ele já chama a Edge Function
3. **Ao clicar**: `window.location.href = '/admin'` (navegação completa, não SPA)
4. **No desktop sidebar**: mesma lógica — item condicional no final do menu

### Arquivos a modificar
- `src/components/layout/MoreMenu.tsx` — adicionar item admin condicional
- `src/components/layout/AppLayout.tsx` — importar e usar `useAdminRole` para passar a flag ao MoreMenu

