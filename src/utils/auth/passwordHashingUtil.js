import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUND_COUNT = 12;

export async function hashPlainTextPassword(plainTextPassword) {
  const generatedSalt = await bcrypt.genSalt(BCRYPT_SALT_ROUND_COUNT);
  const resultingHashedPassword = await bcrypt.hash(
    plainTextPassword,
    generatedSalt
  );
  return resultingHashedPassword;
}

export async function verifyPlainTextPasswordAgainstHash(
  plainTextPassword,
  storedHashedPassword
) {
  const doesPasswordMatch = await bcrypt.compare(
    plainTextPassword,
    storedHashedPassword
  );
  return doesPasswordMatch;
}
