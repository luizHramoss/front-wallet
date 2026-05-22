/**
 * Formata número como moeda BRL.
 * @param {number|string} value
 * @returns {string}  ex: "R$ 1.250,50"
 */
export function formatCurrency(value) {
  const num = parseFloat(value ?? 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(num)
}

/**
 * Formata data ISO como data local legível.
 * @param {string} iso
 * @returns {string}  ex: "15/01/2024 às 10:05"
 */
export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/**
 * Formata data ISO como data curta.
 * @param {string} iso
 * @returns {string}  ex: "15/01/2024"
 */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(iso))
}

/**
 * Extrai mensagem de erro legível de uma resposta Axios.
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.data?.errors) {
    const firstKey = Object.keys(error.response.data.errors)[0]
    return error.response.data.errors[firstKey]?.[0] ?? 'Erro de validação.'
  }
  if (error?.message) return error.message
  return 'Ocorreu um erro inesperado.'
}

/**
 * Extrai objeto de erros de campo da resposta Laravel.
 * @param {unknown} error
 * @returns {Record<string, string>}
 */
export function getFieldErrors(error) {
  const raw = error?.response?.data?.errors ?? {}
  return Object.fromEntries(
    Object.entries(raw).map(([key, msgs]) => [key, Array.isArray(msgs) ? msgs[0] : msgs])
  )
}
