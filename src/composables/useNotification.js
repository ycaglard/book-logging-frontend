import { ref } from 'vue'

const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  autoClose: true,
  duration: 5000
})

const resolvePromise = ref(null)

export function useNotification() {
  const showNotification = (options) => {
    notification.value = {
      show: false,
      type: 'info',
      title: '',
      message: '',
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      autoClose: true,
      duration: 5000,
      ...options,
      show: true
    }

    return new Promise((resolve) => {
      resolvePromise.value = resolve
    })
  }

  const hideNotification = () => {
    notification.value.show = false
  }

  const handleConfirm = () => {
    if (resolvePromise.value) {
      resolvePromise.value(true)
      resolvePromise.value = null
    }
    hideNotification()
  }

  const handleCancel = () => {
    if (resolvePromise.value) {
      resolvePromise.value(false)
      resolvePromise.value = null
    }
    hideNotification()
  }

  const handleClose = () => {
    if (resolvePromise.value) {
      resolvePromise.value(null)
      resolvePromise.value = null
    }
    hideNotification()
  }

  // Convenience methods
  const showSuccess = (title, message, options = {}) => {
    return showNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const showError = (title, message, options = {}) => {
    return showNotification({
      type: 'error',
      title,
      message,
      ...options
    })
  }

  const showWarning = (title, message, options = {}) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const showInfo = (title, message, options = {}) => {
    return showNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  const showConfirm = (title, message, options = {}) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      showCancel: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      autoClose: false,
      ...options
    })
  }

  return {
    notification,
    showNotification,
    hideNotification,
    handleConfirm,
    handleCancel,
    handleClose,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  }
} 