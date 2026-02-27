import { CheckCircle2 } from 'lucide-react';
import { getPasswordRequirements } from '@/lib/password-validation';

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
}

export function PasswordRequirements({ password, confirmPassword }: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password, confirmPassword);

  return (
    <div role="list" aria-label="Requisitos de senha" className="space-y-1.5 text-sm">
      {requirements.map((req) => (
        <div key={req.key} role="listitem" className="flex items-center gap-2">
          <CheckCircle2
            className={`h-4 w-4 shrink-0 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`}
          />
          <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
}
