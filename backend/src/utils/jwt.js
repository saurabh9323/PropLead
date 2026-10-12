const crypto = require("crypto");
const AppError = require("./appError");

const base64UrlEncode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const base64UrlDecode = (value) =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured");
  return secret;
};

const signToken = (payload, expiresInSeconds = 60 * 60) => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(tokenPayload);
  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyToken = (token) => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new AppError("Invalid token", 401);
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new AppError("Invalid token", 401);
  }

  let payload;
  try {
    const header = base64UrlDecode(encodedHeader);
    if (header.alg !== "HS256" || header.typ !== "JWT") throw new Error();
    payload = base64UrlDecode(encodedPayload);
  } catch { throw new AppError("Invalid token", 401); }
  const now = Math.floor(Date.now() / 1000);

  if (!payload || !Number.isFinite(payload.exp) || payload.exp <= now) {
    throw new AppError("Token expired", 401);
  }

  return payload;
};

module.exports = {
  signToken,
  verifyToken,
};
