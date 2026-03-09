import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.1.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

// ─── Rate Limiting ─────────────────────────────────────────────────
const EMAIL_ACTION_LIMIT = 3;
const EMAIL_ACTION_WINDOW_MIN = 15;
const IP_LIMIT = 10;
const IP_WINDOW_MIN = 1;

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function checkAndRecordRateLimit(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  email: string,
  action: string,
  ip: string
): Promise<{ limited: boolean }> {
  await supabaseAdmin.rpc("cleanup_old_rate_limits");

  const { count: emailCount } = await supabaseAdmin
    .from("auth_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("email", email.toLowerCase())
    .eq("action", action)
    .gte("created_at", new Date(Date.now() - EMAIL_ACTION_WINDOW_MIN * 60 * 1000).toISOString());

  if ((emailCount ?? 0) >= EMAIL_ACTION_LIMIT) {
    return { limited: true };
  }

  const { count: ipCount } = await supabaseAdmin
    .from("auth_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", new Date(Date.now() - IP_WINDOW_MIN * 60 * 1000).toISOString());

  if ((ipCount ?? 0) >= IP_LIMIT) {
    return { limited: true };
  }

  await supabaseAdmin
    .from("auth_rate_limits")
    .insert({ email: email.toLowerCase(), action, ip });

  return { limited: false };
}

// ─── Email sending helper (anti-spam headers) ──────────────────────
const FROM_EMAIL = "PreciBake <noreply@precibake.com.br>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  textContent: string;
  tags?: { name: string; value: string }[];
}

async function sendEmail({ to, subject, html, textContent, tags }: SendEmailOptions) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject,
    html,
    text: textContent,
    headers: {
      "X-Entity-Ref-ID": crypto.randomUUID(),
      "List-Unsubscribe": `<mailto:suporte@precibake.com.br?subject=unsubscribe>`,
    },
    tags: tags || [],
  });
}

// ─── Templates PT-BR ────────────────────────────────────────────────
function confirmationTemplate(url: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
      <tr><td style="padding:32px 40px;">
        <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Confirme seu e-mail</h2>
        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Para ativar sua conta e começar seu teste grátis de 7 dias, confirme seu e-mail clicando no botão abaixo.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="${url}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Confirmar meu e-mail</a>
        </td></tr></table>
        <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${url}</p>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não criou uma conta no PreciBake, ignore este e-mail.</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 PreciBake — precibake.com.br</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function confirmationTextContent(url: string) {
  return `PreciBake - Confirme seu e-mail

Para ativar sua conta e começar seu teste grátis de 7 dias, acesse o link abaixo:

${url}

Se você não criou uma conta no PreciBake, ignore este e-mail.

© 2026 PreciBake — precibake.com.br`;
}

function recoveryTemplate(url: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
      <tr><td style="padding:32px 40px;">
        <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Redefinir sua senha</h2>
        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="${url}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Redefinir minha senha</a>
        </td></tr></table>
        <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${url}</p>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 PreciBake — precibake.com.br</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function recoveryTextContent(url: string) {
  return `PreciBake - Redefinir sua senha

Clique no link abaixo para criar uma nova senha. Este link é válido por 1 hora.

${url}

Se você não solicitou a redefinição de senha, ignore este e-mail.

© 2026 PreciBake — precibake.com.br`;
}

// ─── Generic success response (anti-enumeration) ───────────────────
const GENERIC_SUCCESS = { success: true, message: "Se esse e-mail estiver apto, você receberá as instruções em breve." };

// ─── Main Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { action, email, password, fullName, redirectTo } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();
    const clientIp = getClientIp(req);

    console.log(`[SEND-AUTH-EMAIL] action=${action}, email=${email}, ip=${clientIp}`);

    if (!email || typeof email !== 'string' || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!action || !["signup", "recovery"].includes(action)) {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // ─── RATE LIMITING ───────────────────────────────────────
    const { limited } = await checkAndRecordRateLimit(supabaseAdmin, email, action, clientIp);
    if (limited) {
      console.warn(`[SEND-AUTH-EMAIL] Rate limited: email=${email}, action=${action}, ip=${clientIp}`);
      return new Response(
        JSON.stringify({ success: true, message: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." }),
        { status: 429, headers: jsonHeaders }
      );
    }

    // ─── SIGNUP ──────────────────────────────────────────────
    if (action === "signup") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required for signup" }),
          { status: 400, headers: jsonHeaders }
        );
      }

      // ─── Backend password validation (defense-in-depth) ────
      const pwErrors: string[] = [];
      if (typeof password !== "string" || password.length < 10) pwErrors.push("Mínimo 10 caracteres.");
      if (!/[a-zA-Z]/.test(password)) pwErrors.push("Inclua pelo menos 1 letra.");
      if (!/[0-9]/.test(password)) pwErrors.push("Inclua pelo menos 1 número.");
      if (!/[!@#$%&*._\-]/.test(password)) pwErrors.push("Inclua pelo menos 1 caractere especial.");
      const blockedPasswords = ["12345678","1234567890","password","qwerty","abcdefg","11111111","precibake","senha1234","abcd1234"];
      if (blockedPasswords.includes(password.toLowerCase())) pwErrors.push("Senha muito comum.");
      if (pwErrors.length > 0) {
        return new Response(
          JSON.stringify({ error: "Senha não atende os requisitos: " + pwErrors[0] }),
          { status: 400, headers: jsonHeaders }
        );
      }

      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName || "" },
      });

      if (createError) {
        console.error("[SEND-AUTH-EMAIL] createUser error:", createError.message);

        if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
          console.log("[SEND-AUTH-EMAIL] Email already registered, returning generic success (anti-enum)");
          return new Response(
            JSON.stringify(GENERIC_SUCCESS),
            { status: 200, headers: jsonHeaders }
          );
        }

        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: jsonHeaders }
        );
      }

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        options: { redirectTo: redirectTo || "https://bake-wise-pricing.lovable.app" },
      });

      if (linkError) {
        console.error("[SEND-AUTH-EMAIL] generateLink error:", linkError.message);
        return new Response(
          JSON.stringify(GENERIC_SUCCESS),
          { status: 200, headers: jsonHeaders }
        );
      }

      const confirmUrl = linkData?.properties?.action_link;
      if (!confirmUrl) {
        console.error("[SEND-AUTH-EMAIL] No action_link in response");
        return new Response(
          JSON.stringify(GENERIC_SUCCESS),
          { status: 200, headers: jsonHeaders }
        );
      }

      const { error: emailError } = await sendEmail({
        to: email,
        subject: "Confirme seu e-mail - PreciBake",
        html: confirmationTemplate(confirmUrl),
        textContent: confirmationTextContent(confirmUrl),
        tags: [{ name: "category", value: "confirmation" }],
      });

      if (emailError) {
        console.error("[SEND-AUTH-EMAIL] Resend error:", JSON.stringify(emailError));
      } else {
        console.log("[SEND-AUTH-EMAIL] Signup email sent to", email);
      }

      return new Response(
        JSON.stringify(GENERIC_SUCCESS),
        { status: 200, headers: jsonHeaders }
      );
    }

    // ─── RECOVERY ────────────────────────────────────────────
    if (action === "recovery") {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: redirectTo || "https://bake-wise-pricing.lovable.app/reset-password" },
      });

      if (linkError) {
        console.error("[SEND-AUTH-EMAIL] recovery generateLink error:", linkError.message);
        return new Response(
          JSON.stringify(GENERIC_SUCCESS),
          { status: 200, headers: jsonHeaders }
        );
      }

      const confirmUrl = linkData?.properties?.action_link;
      if (!confirmUrl) {
        return new Response(
          JSON.stringify(GENERIC_SUCCESS),
          { status: 200, headers: jsonHeaders }
        );
      }

      const { error: emailError } = await sendEmail({
        to: email,
        subject: "Redefinir sua senha - PreciBake",
        html: recoveryTemplate(confirmUrl),
        textContent: recoveryTextContent(confirmUrl),
        tags: [{ name: "category", value: "recovery" }],
      });

      if (emailError) {
        console.error("[SEND-AUTH-EMAIL] Resend recovery error:", JSON.stringify(emailError));
      } else {
        console.log("[SEND-AUTH-EMAIL] Recovery email sent to", email);
      }

      return new Response(
        JSON.stringify(GENERIC_SUCCESS),
        { status: 200, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: jsonHeaders }
    );

  } catch (err) {
    const origin = req.headers.get('origin');
    const errorCorsHeaders = getCorsHeaders(origin);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[SEND-AUTH-EMAIL] Exception:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...errorCorsHeaders, "Content-Type": "application/json" } }
    );
  }
});
