export function mandatoryEnvVars(vars = []) {
  const missing = vars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing mandatory environment variables: ${missing.join(", ")}`
    );
  }
}
