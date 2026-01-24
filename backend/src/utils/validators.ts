import { Service } from "../types/Services.js";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const validateService = (service: Service): boolean => {
  return service.nameService.length >= 2 && service.priceP >= 0 && service.priceM >= 0 && service.priceG >= 0;
};
