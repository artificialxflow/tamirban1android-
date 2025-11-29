const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const authConfig = {
  otp: {
    testCode: process.env.OTP_TEST_CODE ?? "0000",
    expirationMinutes: toNumber(process.env.OTP_EXPIRATION_MINUTES, 5),
    maxAttempts: toNumber(process.env.OTP_MAX_ATTEMPTS, 5),
    bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
    accessExpiresInSeconds: 60 * 60, // 1 hour
    refreshExpiresInSeconds: 60 * 60 * 24 * 7, // 7 days
  },
};

if (!authConfig.jwt.secret) {
  console.warn("JWT_SECRET is not set. Authentication routes will throw if accessed.");
}

if (!authConfig.jwt.refreshSecret) {
  console.warn("JWT_REFRESH_SECRET is not set. Refresh tokens will not be issued.");
}

