import { Resend } from "npm:resend@4.1.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Templates em português
const templates: Record<string, { subject: string; html: (url: string) => string }> = {
  signup: {
    subject: "Confirme seu e-mail - PreciBake",
    html: (confirmUrl: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Confirme seu e-mail</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Confirme seu e-mail</h2>
          <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Para ativar sua conta e começar seu teste grátis de 7 dias, confirme seu e-mail clicando no botão abaixo.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${confirmUrl}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Confirmar meu e-mail</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${confirmUrl}</p>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não criou uma conta no PreciBake, ignore este e-mail.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  recovery: {
    subject: "Redefinir sua senha - PreciBake",
    html: (confirmUrl: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Redefinir sua senha</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Redefinir sua senha</h2>
          <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${confirmUrl}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Redefinir minha senha</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${confirmUrl}</p>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  email_change: {
    subject: "Confirme a alteração de e-mail - PreciBake",
    html: (confirmUrl: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Confirme a alteração de e-mail</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Confirme a alteração de e-mail</h2>
          <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Clique no botão abaixo para confirmar a alteração do e-mail da sua conta.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${confirmUrl}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Confirmar novo e-mail</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${confirmUrl}</p>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não solicitou esta alteração, ignore este e-mail.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  magic_link: {
    subject: "Seu link de acesso - PreciBake",
    html: (confirmUrl: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Link de acesso</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background-color:#1e293b;padding:24px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">PreciBake</h1></td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Seu link de acesso</h2>
          <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Clique no botão abaixo para acessar sua conta.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${confirmUrl}" target="_blank" style="display:inline-block;background-color:#f59e0b;color:#1e293b;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Acessar minha conta</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;word-break:break-all;">Ou copie e cole este link no seu navegador:<br />${confirmUrl}</p>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">Se você não solicitou este link, ignore este e-mail.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 PreciBake</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log("[SEND-AUTH-EMAIL] Received payload:", JSON.stringify({
      email_action_type: payload.email_data?.email_action_type,
      recipient: payload.user?.email,
    }));

    const {
      user,
      email_data: {
        token,
        token_hash,
        redirect_to,
        email_action_type,
        site_url,
        token_new,
        token_hash_new,
      },
    } = payload;

    const recipientEmail = user.email;

    if (!recipientEmail) {
      console.error("[SEND-AUTH-EMAIL] No recipient email");
      return new Response(JSON.stringify({ error: "No recipient email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map email_action_type to template key
    let templateKey: string;
    switch (email_action_type) {
      case "signup":
        templateKey = "signup";
        break;
      case "recovery":
        templateKey = "recovery";
        break;
      case "email_change":
      case "email_change_current":
      case "email_change_new":
        templateKey = "email_change";
        break;
      case "magic_link":
        templateKey = "magic_link";
        break;
      default:
        templateKey = "signup";
        console.log(`[SEND-AUTH-EMAIL] Unknown action type: ${email_action_type}, defaulting to signup`);
    }

    const template = templates[templateKey];

    // Build confirmation URL
    const baseUrl = site_url || redirect_to || "https://bake-wise-pricing.lovable.app";
    const confirmUrl = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}`;

    console.log(`[SEND-AUTH-EMAIL] Sending ${templateKey} email to ${recipientEmail}`);

    const { data, error } = await resend.emails.send({
      from: "PreciBake <noreply@precibake.com.br>",
      to: [recipientEmail],
      subject: template.subject,
      html: template.html(confirmUrl),
    });

    if (error) {
      console.error("[SEND-AUTH-EMAIL] Resend error:", JSON.stringify(error));
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[SEND-AUTH-EMAIL] Email sent successfully:", JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[SEND-AUTH-EMAIL] Exception:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
