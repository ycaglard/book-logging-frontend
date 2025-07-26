<template>
  <Transition name="notification">
    <div v-if="show" class="notification-overlay" @click="handleOverlayClick">
      <div class="notification-content" @click.stop>
        <div class="notification-header">
          <div class="notification-icon" :class="type">
            <CheckCircle v-if="type === 'success'" class="icon" />
            <AlertCircle v-else-if="type === 'error'" class="icon" />
            <Info v-else-if="type === 'info'" class="icon" />
            <AlertTriangle v-else-if="type === 'warning'" class="icon" />
          </div>
          <button class="close-btn" @click="close">
            <X class="icon" />
          </button>
        </div>
        <div class="notification-body">
          <h3 class="notification-title">{{ title }}</h3>
          <p class="notification-message">{{ message }}</p>
        </div>
        <div class="notification-actions">
          <button 
            v-if="showCancel" 
            class="cancel-btn" 
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button 
            class="confirm-btn" 
            :class="type"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'OK'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

let autoCloseTimer = null

const close = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  // Do not call close() here; parent will handle hiding
}

const handleCancel = () => {
  emit('cancel')
  // Do not call close() here; parent will handle hiding
}

const handleOverlayClick = () => {
  if (props.showCancel) {
    handleCancel()
  } else {
    close()
  }
}

onMounted(() => {
  if (props.autoClose && !props.showCancel) {
    autoCloseTimer = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.notification-content {
  background-color: rgb(30, 30, 40);
  border: 1px solid rgb(60, 60, 80);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 400px;
  max-height: 90%;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgb(60, 60, 80);
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.notification-icon.success {
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.notification-icon.error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.notification-icon.warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.notification-icon.info {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.notification-icon .icon {
  width: 20px;
  height: 20px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: rgb(150, 150, 150);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgb(60, 60, 80);
  color: rgb(200, 200, 200);
}

.close-btn .icon {
  width: 16px;
  height: 16px;
}

.notification-body {
  padding: 1.5rem;
}

.notification-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 0.75rem 0;
}

.notification-message {
  font-size: 0.95rem;
  color: rgb(180, 180, 180);
  line-height: 1.5;
  margin: 0;
}

.notification-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgb(60, 60, 80);
}

.cancel-btn,
.confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: rgb(60, 60, 80);
  color: rgb(200, 200, 200);
}

.cancel-btn:hover {
  background: rgb(80, 80, 100);
}

.confirm-btn {
  background: #0077cc;
  color: white;
}

.confirm-btn:hover {
  background: #005fa3;
}

.confirm-btn.success {
  background: #22c55e;
}

.confirm-btn.success:hover {
  background: #16a34a;
}

.confirm-btn.error {
  background: #ef4444;
}

.confirm-btn.error:hover {
  background: #dc2626;
}

.confirm-btn.warning {
  background: #f59e0b;
}

.confirm-btn.warning:hover {
  background: #d97706;
}

.confirm-btn.info {
  background: #3b82f6;
}

.confirm-btn.info:hover {
  background: #2563eb;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style> 