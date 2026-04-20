// Admin-only edge function to list users and grant/revoke admin role.
// Uses the service role key to look up auth.users by email.
// Supports inviting new users by email (sends Supabase auth invite with verification + password setup link).
// Enforces a hard cap of 20 admins.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const MAX_ADMINS = 20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function findUserByEmail(admin: any, email: string) {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data: list, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = list?.users ?? [];
    const match = users.find((u: any) => (u.email ?? "").toLowerCase() === email);
    if (match) return match;
    if (users.length < perPage) return null;
    page++;
    if (page > 50) return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // verify caller is admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action as "list" | "grant" | "revoke" | "invite";

    if (action === "list") {
      const allUsers: any[] = [];
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data: list } = await admin.auth.admin.listUsers({ page, perPage });
        const users = list?.users ?? [];
        allUsers.push(...users);
        if (users.length < perPage) break;
        page++;
        if (page > 50) break;
      }
      const { data: roles } = await admin.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string[]>();
      (roles ?? []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) ?? [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });
      const users = allUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at,
        roles: roleMap.get(u.id) ?? [],
      }));
      const adminCount = (roles ?? []).filter((r: any) => r.role === "admin").length;
      return json({ users, adminCount, maxAdmins: MAX_ADMINS });
    }

    // grant or invite — both result in admin role being assigned
    if (action === "grant" || action === "invite") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!email) return json({ error: "Email required" }, 400);

      // enforce admin cap
      const { count: adminCount } = await admin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((adminCount ?? 0) >= MAX_ADMINS) {
        return json({ error: `Admin limit reached (${MAX_ADMINS}). Revoke an existing admin first.` }, 400);
      }

      let target = await findUserByEmail(admin, email);
      let invited = false;

      if (!target) {
        // Send Supabase invite — this emails the user a verification link to set their password.
        const redirectTo = body.redirectTo || `${new URL(req.url).origin.replace(/\/functions.*$/, "")}`;
        const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo,
        });
        if (inviteErr) {
          // If user already exists race, try to look up again
          if (String(inviteErr.message).toLowerCase().includes("already")) {
            target = await findUserByEmail(admin, email);
          } else {
            return json({ error: `Invite failed: ${inviteErr.message}` }, 400);
          }
        } else {
          target = inviteData?.user ?? null;
          invited = true;
        }
        if (!target) return json({ error: "Could not create or find user." }, 500);
      }

      // Assign admin role (idempotent)
      const { error: insertErr } = await admin
        .from("user_roles")
        .insert({ user_id: target.id, role: "admin" });
      if (insertErr && !String(insertErr.message).includes("duplicate")) {
        return json({ error: insertErr.message }, 400);
      }

      return json({
        ok: true,
        invited,
        user: { id: target.id, email: target.email },
        message: invited
          ? `Invite email sent to ${email}. They'll set a password and verify their email via the link.`
          : `Admin granted to ${email}.`,
      });
    }

    if (action === "revoke") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!email) return json({ error: "Email required" }, 400);
      const target = await findUserByEmail(admin, email);
      if (!target) return json({ error: "User not found." }, 404);
      if (target.id === userData.user.id) {
        return json({ error: "You can't revoke your own admin role." }, 400);
      }
      const { error } = await admin.from("user_roles").delete().eq("user_id", target.id).eq("role", "admin");
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // Send password reset email to a user (admin action)
    if (action === "send_password_reset") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!email) return json({ error: "Email required" }, 400);
      const redirectTo = body.redirectTo || `${new URL(req.url).origin.replace(/\/functions.*$/, "")}/reset-password`;
      const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, message: `Password reset email sent to ${email}.` });
    }

    // Resend verification / invite email
    if (action === "resend_verification") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!email) return json({ error: "Email required" }, 400);
      const target = await findUserByEmail(admin, email);
      if (!target) return json({ error: "User not found." }, 404);
      if (target.email_confirmed_at) {
        return json({ ok: true, message: `${email} is already verified.` });
      }
      const redirectTo = body.redirectTo || `${new URL(req.url).origin.replace(/\/functions.*$/, "")}`;
      const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, message: `Verification email resent to ${email}.` });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
