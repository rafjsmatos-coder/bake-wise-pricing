const MIN_LENGTH = 10;

const BLOCKED_PASSWORDS = [
  "12345678",
  "1234567890",
  "password",
  "qwerty",
  "abcdefg",
  "11111111",
  "precibake",
  "senha1234",
  "abcd1234",
];

const HAS_LETTER = /[a-zA-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[!@#$%&*._\-]/;

export interface PasswordRequirement {
  key: string;
  met: boolean;
  text: string;
}

export function getPasswordRequirements(
  password: string,
  confirmPassword?: string
): PasswordRequirement[] {
  const reqs: PasswordRequirement[] = [
    { key: "length", met: password.length >= MIN_LENGTH, text: `Pelo menos ${MIN_LENGTH} caracteres` },
    { key: "letter", met: HAS_LETTER.test(password), text: "Pelo menos 1 letra (a-z)" },
    { key: "number", met: HAS_NUMBER.test(password), text: "Pelo menos 1 número (0-9)" },
    { key: "special", met: HAS_SPECIAL.test(password), text: "Pelo menos 1 caractere especial (!@#$%&*._-)" },
    { key: "blocked", met: password.length > 0 ? !BLOCKED_PASSWORDS.includes(password.toLowerCase()) : true, text: "Não é uma senha comum" },
  ];

  if (confirmPassword !== undefined) {
    reqs.push({
      key: "match",
      met: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
      text: "Senhas conferem",
    });
  }

  return reqs;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < MIN_LENGTH) errors.push(`Use pelo menos ${MIN_LENGTH} caracteres.`);
  if (!HAS_LETTER.test(password)) errors.push("Inclua pelo menos 1 letra.");
  if (!HAS_NUMBER.test(password)) errors.push("Inclua pelo menos 1 número.");
  if (!HAS_SPECIAL.test(password)) errors.push("Inclua pelo menos 1 caractere especial (!@#$%&*._-).");
  if (BLOCKED_PASSWORDS.includes(password.toLowerCase())) errors.push("Essa senha é muito comum. Escolha outra.");

  return { valid: errors.length === 0, errors };
}

export function isPasswordValid(password: string): boolean {
  return validatePassword(password).valid;
}

// Backend-compatible version for edge functions (same rules)
export const PASSWORD_MIN_LENGTH = MIN_LENGTH;
export const PASSWORD_BLOCKED_LIST = BLOCKED_PASSWORDS;
