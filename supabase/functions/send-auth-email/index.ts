import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@4.1.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
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
      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
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
      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function emailChangeTemplate(url: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
      <tr><td style="padding:32px 40px;">
        <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Confirme a alteração de e-mail</h2>
        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Clique no botão abaixo para confirmar a alteração do e-mail da sua conta.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="${url}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Confirmar novo e-mail</a>
        </td></tr></table>
        <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${url}</p>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não solicitou esta alteração, ignore este e-mail.</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// ─── Main Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { action, email, password, fullName, redirectTo } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    console.log(`[SEND-AUTH-EMAIL] action=${action}, email=${email}`);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── SIGNUP ──────────────────────────────────────────────
    if (action === "signup") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required for signup" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user without sending default email
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName || "" },
      });

      if (createError) {
        console.error("[SEND-AUTH-EMAIL] createUser error:", createError.message);
        
        // Map common errors to Portuguese
        let ptMessage = createError.message;
        if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
          ptMessage = "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.";
        }
        
        return new Response(
          JSON.stringify({ error: ptMessage }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate confirmation link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        options: { redirectTo: redirectTo || "https://bake-wise-pricing.lovable.app" },
      });

      if (linkError) {
        console.error("[SEND-AUTH-EMAIL] generateLink error:", linkError.message);
        return new Response(
          JSON.stringify({ error: "Erro ao gerar link de confirmação" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const confirmUrl = linkData?.properties?.action_link;
      if (!confirmUrl) {
        console.error("[SEND-AUTH-EMAIL] No action_link in response");
        return new Response(
          JSON.stringify({ error: "Erro ao gerar link de confirmação" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send PT-BR email via Resend
      const { error: emailError } = await resend.emails.send({
        from: "PreciBake <noreply@precibake.com.br>",
        to: [email],
        subject: "Confirme seu e-mail - PreciBake",
        html: confirmationTemplate(confirmUrl),
      });

      if (emailError) {
        console.error("[SEND-AUTH-EMAIL] Resend error:", JSON.stringify(emailError));
        // User was created but email failed - still return success so they can retry
        return new Response(
          JSON.stringify({ success: true, emailSent: false, userId: createData.user?.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[SEND-AUTH-EMAIL] Signup email sent to", email);
      return new Response(
        JSON.stringify({ success: true, emailSent: true, userId: createData.user?.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        // Don't reveal if email exists or not
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const confirmUrl = linkData?.properties?.action_link;
      if (!confirmUrl) {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: emailError } = await resend.emails.send({
        from: "PreciBake <noreply@precibake.com.br>",
        to: [email],
        subject: "Redefinir sua senha - PreciBake",
        html: recoveryTemplate(confirmUrl),
      });

      if (emailError) {
        console.error("[SEND-AUTH-EMAIL] Resend recovery error:", JSON.stringify(emailError));
      } else {
        console.log("[SEND-AUTH-EMAIL] Recovery email sent to", email);
      }

      // Always return success to not reveal if email exists
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── UNKNOWN ACTION ──────────────────────────────────────
    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[SEND-AUTH-EMAIL] Exception:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
