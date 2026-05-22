/**
 * Valida um valor de transação financeira no frontend.
 * @param {string|number} value
 * @param {number} [balance] — saldo disponível (para validar saque)
 * @returns {{ valid: boolean, error: string }}
 */
export function validateAmount(value, balance = null) {
  const str = String(value).trim()

  if (!str) return { valid: false, error: 'O valor é obrigatório.' }

  const num = parseFloat(str)

  if (isNaN(num)) return { valid: false, error: 'Informe um valor numérico válido.' }

  if (num <= 0) return { valid: false, error: 'O valor deve ser maior que zero.' }

  if (num < 0.01) return { valid: false, error: 'O valor mínimo é R$ 0,01.' }

  // Verificar no máximo 2 casas decimais
  if (!/^\d+(\.\d{1,2})?$/.test(str.replace(',', '.'))) {
    return { valid: false, error: 'O valor deve ter no máximo 2 casas decimais.' }
  }

  if (balance !== null && num > balance) {
    return { valid: false, error: 'Saldo insuficiente para este saque.' }
  }

  return { valid: true, error: '' }
}

/**
 * Valida dados de registro.
 * @param {{ name: string, email: string, password: string, password_confirmation: string }} data
 * @returns {Record<string, string>}
 */
export function validateRegister(data) {
  const errors = {}

  if (!data.name?.trim()) {
    errors.name = 'O nome é obrigatório.'
  } else if (data.name.trim().length < 3) {
    errors.name = 'O nome deve ter pelo menos 3 caracteres.'
  }

  if (!data.email?.trim()) {
    errors.email = 'O e-mail é obrigatório.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (!data.password) {
    errors.password = 'A senha é obrigatória.'
  } else if (data.password.length < 8) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.'
  }

  if (!data.password_confirmation) {
    errors.password_confirmation = 'Confirme a senha.'
  } else if (data.password !== data.password_confirmation) {
    errors.password_confirmation = 'As senhas não conferem.'
  }

  return errors
}

/**
 * Valida dados de login.
 * @param {{ email: string, password: string }} data
 * @returns {Record<string, string>}
 */
export function validateLogin(data) {
  const errors = {}
  if (!data.email?.trim()) errors.email = 'O e-mail é obrigatório.'
  if (!data.password) errors.password = 'A senha é obrigatória.'
  return errors
}
