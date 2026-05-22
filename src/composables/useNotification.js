import { ref } from 'vue'

const notifications = ref([])
let nextId = 0

export function useNotification() {
  function push(message, type = 'info', duration = 4000) {
    const id = ++nextId
    notifications.value.push({ id, message, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return {
    notifications,
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
    warning: (msg) => push(msg, 'warning'),
    remove,
  }
}
