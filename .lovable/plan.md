# Politica de Senha Forte — Plano de Implementacao

## Resumo

Criar uma funcao utilitaria unica (`src/lib/password-validation.ts`) com todas as regras de senha e um componente visual reutilizavel (`src/components/auth/PasswordRequirements.tsx`), e aplicar em todos os 3 formularios + backend.

---

## 1. Novo arquivo: `src/lib/password-validation.ts`

Contera:

```text
- MIN_LENGTH = 10
- Regex: pelo menos 1 letra (/[a-zA-Z]/)
- Regex: pelo menos 1 numero (/[0-9]/)
- Regex: pelo menos 1 caractere especial (/[!@#$%&*._\-]/)
- Lista de senhas bloqueadas: ["12345678", "1234567890", "password", "qwerty", "abcdefg", "11111111", "precibake", "senha1234", "abcd1234"]
```

Funcoes exportadas:

- `getPasswordRequirements(password: string)` — retorna array de `{ key, met, text }` para checklist visual
- `validatePassword(password: string)` — retorna `{ valid: boolean, errors: string[] }` para uso em submit
- `isPasswordValid(password: string)` — boolean simples para disabled/enabled do botao

---

## 2. Novo componente: `src/components/auth/PasswordRequirements.tsx`

Componente reutilizavel que recebe `password: string` e renderiza o checklist visual com icones CheckCircle2 (verde quando atendido, cinza quando nao). Inclui `role="list"` e `aria-label="Requisitos de senha"` para acessibilidade.

Requisitos exibidos:

- Pelo menos 10 caracteres
- Pelo menos 1 letra (a-z)
- Pelo menos 1 numero (0-9)
- Pelo menos 1 caractere especial (!@#$%&*._-)
- Senhas conferem (quando `confirmPassword` for fornecido)
- Senha nao e uma senha comum

---

## 3. Alteracoes nos formularios

### 3a. `src/components/auth/AuthForm.tsx` (Cadastro)

- Remover logica inline de `passwordRequirements` (linhas 84-86)
- Remover validacao inline `password.length < 8` (linhas 58-64)
- Importar `validatePassword`, `isPasswordValid` de `password-validation.ts`
- Importar `PasswordRequirements` componente
- No submit: chamar `validatePassword()` e mostrar toast com primeiro erro se invalido
- No botao: `disabled={!isPasswordValid(signupPassword)}`
- Atualizar `minLength` do input de 8 para 10
- Adicionar `aria-label="Senha"` no input

### 3b. `src/components/auth/ResetPasswordForm.tsx` (Reset)

- Remover logica inline de `passwordRequirements` (linhas 68-71)
- Remover validacao inline `newPassword.length < 8` (linhas 33-38)
- Importar e usar `validatePassword`, `isPasswordValid`, `PasswordRequirements`
- No submit: chamar `validatePassword()` antes de enviar
- No botao: `disabled={!isPasswordValid(newPassword) || newPassword !== confirmPassword}`
- Atualizar `minLength` de 8 para 10
- Adicionar `aria-label` nos inputs

### 3c. `src/components/auth/PasswordChangeForm.tsx` (Painel logado)

- Mesmas mudancas: remover logica inline, importar util e componente
- Remover validacao `newPassword.length < 8` (linhas 31-36)
- Remover `passwordRequirements` inline (linhas 68-71)
- No submit: `validatePassword()` antes de enviar
- Botao: `disabled={!isPasswordValid(newPassword) || newPassword !== confirmPassword}`
- Atualizar `minLength` de 8 para 10

---

## 4. Validacao no backend (defense-in-depth)

### `supabase/functions/send-auth-email/index.ts`

Adicionar validacao de senha ANTES do `createUser` no fluxo de signup:

```text
- Verificar length >= 10
- Verificar regex letra, numero, especial
- Verificar lista de bloqueadas
- Se invalido: retornar 400 com mensagem clara
```

Isso garante que mesmo se alguem chamar a API diretamente (bypass do frontend), a senha fraca sera rejeitada.

---

## 5. Arquivos alterados (resumo)


| Arquivo                                        | Acao                            |
| ---------------------------------------------- | ------------------------------- |
| `src/lib/password-validation.ts`               | CRIAR — util centralizado       |
| `src/components/auth/PasswordRequirements.tsx` | CRIAR — componente visual       |
| `src/components/auth/AuthForm.tsx`             | EDITAR — usar util + componente |
| `src/components/auth/ResetPasswordForm.tsx`    | EDITAR — usar util + componente |
| `src/components/auth/PasswordChangeForm.tsx`   | EDITAR — usar util + componente |
| `supabase/functions/send-auth-email/index.ts`  | EDITAR — validacao backend      |


---

## 6. Checklist de testes

- Cadastro: senha com 9 chars → bloqueado; sem numero → bloqueado; sem especial → bloqueado; "precibake" → bloqueado; senha valida → OK
- Reset senha: mesmas regras aplicadas; botao desabilitado ate cumprir tudo; senhas nao conferem → bloqueado
- Painel (alterar senha logado): mesmas regras; toast de erro claro quando invalido
- Backend: POST direto para send-auth-email com senha fraca → 400
- Mobile: checklist visivel e legivel em tela pequena
- Modo escuro: cores do checklist consistentes  
  
Aproveite já consete o botõ do odo escuo no desktop, tem algo errado lá.  
só tem um icone lá, e não da de identificar pra que serve.