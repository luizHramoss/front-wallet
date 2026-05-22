import { ref, reactive } from 'vue'

/**
 * Composable genérico para formulários com loading e erros de campo.
 * @param {Record<string, unknown>} initialValues
 */
export function useForm(initialValues = {}) {
  const form = reactive({ ...initialValues })
  const errors = reactive({})
  const loading = ref(false)

  function clearErrors() {
    Object.keys(errors).forEach((key) => delete errors[key])
  }

  function setErrors(newErrors) {
    clearErrors()
    Object.assign(errors, newErrors)
  }

  function reset() {
    Object.assign(form, initialValues)
    clearErrors()
  }

  async function submit(handler) {
    loading.value = true
    clearErrors()
    try {
      return await handler(form)
    } finally {
      loading.value = false
    }
  }

  return { form, errors, loading, submit, setErrors, clearErrors, reset }
}
