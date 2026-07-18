const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const COOKIE_NAME = "admin_session";
const SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret";

function getSecretWarningOnce() {
  if (process.env.JWT_SECRET) return;
  if (globalThis.__warnedJwtSecret) return;
  globalThis.__warnedJwtSecret = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[preorder-store] JWT_SECRET is not set. Using an insecure default — set it in .env.local before deploying."
  );
}

function verifyCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin";
  if (username !== expectedUser) return false;

  // Supports either a plain-text ADMIN_PASSWORD (simple setups) or a bcrypt
  // hash in ADMIN_PASSWORD_HASH (recommended for production).
  if (process.env.ADMIN_PASSWORD_HASH) {
    return bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);
  }
  return password === expectedPass;
}

function createSessionToken(username) {
  getSecretWarningOnce();
  return jwt.sign({ sub: username, role: "admin" }, SECRET, { expiresIn: "7d" });
}

function verifySessionToken(token) {
  getSecretWarningOnce();
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { COOKIE_NAME, verifyCredentials, createSessionToken, verifySessionToken };
