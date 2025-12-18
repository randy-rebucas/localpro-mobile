export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

