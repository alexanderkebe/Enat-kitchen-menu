import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function sign(payload) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const signature = base64url(
    crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${signature}`;
}

function verify(token) {
  try {
    const [header, body, signature] = token.split(".");
    const expected = base64url(
      crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest()
    );
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, "base64").toString());
    // Token valid for 7 days
    if (payload.iat && Date.now() / 1000 - payload.iat > 7 * 24 * 60 * 60) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createToken() {
  return sign({ role: "admin" });
}

export function validateRequest(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (!match) return false;
  return verify(match[1]) !== null;
}

export function checkPassword(password) {
  return password === (process.env.ADMIN_PASSWORD || "enat2024");
}
