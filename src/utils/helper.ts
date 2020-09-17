export function validateEmail(value: string): string | undefined {
  const regExRequirement = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const correct = regExRequirement.test(value);
  let error;
  if (!correct) {
    error = "Invalid email";
  }
  return error;
}
