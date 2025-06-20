import { VALIDATION_RULES } from '../config/constants';

// Validaciones para formularios
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'El correo electrónico es obligatorio';
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email.trim())) {
    return 'El formato del correo electrónico no es válido';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'La contraseña es obligatoria';
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres`;
  }
  
  if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
    return 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número';
  }
  
  return null;
};

export const validateConfirmPassword = (
  password: string, 
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'La confirmación de contraseña es obligatoria';
  }
  
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'El nombre es obligatorio';
  }
  
  if (name.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return `El nombre debe tener al menos ${VALIDATION_RULES.NAME.MIN_LENGTH} caracteres`;
  }
  
  if (name.trim().length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return `El nombre no puede exceder ${VALIDATION_RULES.NAME.MAX_LENGTH} caracteres`;
  }
  
  if (!VALIDATION_RULES.NAME.PATTERN.test(name.trim())) {
    return 'El nombre contiene caracteres no válidos';
  }
  
  return null;
};

// Validar formulario completo de registro
export const validateRegisterForm = (data: {
  nombre: string;
  correo: string;
  password: string;
  confirmPassword: string;
}) => {
  const errors: Record<string, string> = {};
  
  const nameError = validateName(data.nombre);
  if (nameError) errors.nombre = nameError;
  
  const emailError = validateEmail(data.correo);
  if (emailError) errors.correo = emailError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(
    data.password, 
    data.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar formulario de login
export const validateLoginForm = (data: {
  correo: string;
  password: string;
}) => {
  const errors: Record<string, string> = {};
  
  const emailError = validateEmail(data.correo);
  if (emailError) errors.correo = emailError;
  
  if (!data.password) {
    errors.password = 'La contraseña es obligatoria';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};