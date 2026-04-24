const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 8-16 chars, at least 1 uppercase, at least 1 special char
const pwRe = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{8,16}$/;

function validateUser({ name, email, password, address }) {
  if (!name || name.trim().length < 20 || name.trim().length > 60)
    return 'Name must be 20–60 characters';
  if (!email || !emailRe.test(email))
    return 'Invalid email format';
  if (password !== undefined && !pwRe.test(password))
    return 'Password must be 8–16 chars with at least 1 uppercase and 1 special character';
  if (address && address.length > 400)
    return 'Address must be under 400 characters';
  return null;
}

function validateStore({ name, email, address }) {
  if (!name || name.trim().length < 20 || name.trim().length > 60)
    return 'Store name must be 20–60 characters';
  if (!email || !emailRe.test(email))
    return 'Invalid store email';
  if (address && address.length > 400)
    return 'Address must be under 400 characters';
  return null;
}

module.exports = { validateUser, validateStore, emailRe, pwRe };
