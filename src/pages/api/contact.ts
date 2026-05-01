import type { APIRoute } from "astro";

export const prerender = false;

type Env = {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env ?? {};
  const wantsJson = request.headers.get("accept")?.includes("application/json");

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json(400, { ok: false, error: "Invalid form data" });
  }

  // honeypot — real users leave this empty
  if (String(data.get("website") ?? "").length > 0) {
    return wantsJson ? json(200, { ok: true }) : redirect("/contact?sent=1", 303);
  }

  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return json(400, { ok: false, error: "Missing required fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: "Invalid email address" });
  }
  if (message.length > 5000) {
    return json(400, { ok: false, error: "Message too long" });
  }

  if (!env.RESEND_API_KEY) {
    return json(500, { ok: false, error: "Email service not configured" });
  }

  const from = env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";
  const to = env.CONTACT_TO ?? "i3oc9i@icloud.com";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `Portfolio contact — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend error", res.status, detail);
    return json(502, { ok: false, error: "Failed to send" });
  }

  return wantsJson ? json(200, { ok: true }) : redirect("/contact?sent=1", 303);
};
