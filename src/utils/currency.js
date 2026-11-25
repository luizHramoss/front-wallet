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
  return new Intl.DateTimeFormat('pt-BR').format(parseISODate(iso))
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Converte string ISO em Date. Datas puras ("YYYY-MM-DD", como occurred_at
 * da API) são interpretadas no fuso local - `new Date('2024-01-15')` é
 * meia-noite UTC, que no Brasil (UTC-3) vira 14/01 às 21h e exibia o dia
 * anterior.
 * @param {string} iso
 * @returns {Date}
 */
export function parseISODate(iso) {
  const m = DATE_ONLY.exec(iso)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(iso)
}

/**
 * Formata um Date como "YYYY-MM-DD" no fuso local (formato aceito pela API e
 * por <input type="date">). Evita `toISOString().slice(0, 10)`, que usa UTC e
 * à noite no Brasil já devolve o dia seguinte.
 * @param {Date} [date]
 * @returns {string}
 */
export function toISODate(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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
