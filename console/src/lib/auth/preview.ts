/**
 * Optional Grok auth-broker preview client (server-only — NEVER import from the client).
 *
 * For local/dev without a broker, leave GROK_AUTH_CLIENT_ID / GROK_AUTH_CLIENT_SECRET
 * unset — email/password and anonymous preview still work via Better Auth when configured.
 * Deployed apps should inject per-app GROK_AUTH_* via the environment. Never bake secrets.
 */

/** Preview client id — override with GROK_AUTH_CLIENT_ID. */
export const PREVIEW_CLIENT_ID = "grok_preview";

/**
 * No baked secret. Read GROK_AUTH_CLIENT_SECRET (or GROK_PREVIEW_CLIENT_SECRET) from env.
 * Empty string disables broker OAuth until configured.
 */
export const PREVIEW_CLIENT_SECRET = "";

/** Shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/** Host patterns whose callbacks the preview client accepts when a secret is set. */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
