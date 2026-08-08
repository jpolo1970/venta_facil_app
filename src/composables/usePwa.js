import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { toastController } from '@ionic/vue'

// Se registra una única vez al cargar el módulo — registerType:'prompt' +
// injectRegister:false en vite.config.js le dan control total a este composable
// (nada se actualiza en silencio, solo cuando el usuario presiona "Actualizar App").
const { updateServiceWorker, needRefresh } = useRegisterSW({
  onRegisterError(error) {
    console.error('[PWA] Error registrando el Service Worker', error)
  },
})

const actualizando = ref(false)

async function mostrarToast(message) {
  const toast = await toastController.create({ message, duration: 2500, position: 'bottom' })
  await toast.present()
}

// Espera a que el SW detecte una versión nueva (needRefresh pasa a true) tras
// pedirle explícitamente que revise — evita un timeout ciego si la red tarda.
function esperarNuevaVersion(timeoutMs = 15000) {
  return new Promise((resolve) => {
    if (needRefresh.value) return resolve(true)
    const timer = setTimeout(() => {
      clearInterval(poll)
      resolve(false)
    }, timeoutMs)
    const poll = setInterval(() => {
      if (needRefresh.value) {
        clearInterval(poll)
        clearTimeout(timer)
        resolve(true)
      }
    }, 300)
  })
}

export function usePwa() {
  async function actualizarApp() {
    if (actualizando.value) return
    actualizando.value = true
    try {
      const reg = await navigator.serviceWorker?.getRegistration()
      if (!reg) {
        await mostrarToast('No se pudo verificar actualizaciones (Service Worker no disponible).')
        return
      }
      await reg.update()
      const hayActualizacion = await esperarNuevaVersion()
      if (hayActualizacion) {
        // Descarga ya está lista en segundo plano: solo activa la nueva versión
        // y recarga — no reinstala la app ni borra los datos locales (SQLite/IndexedDB).
        await updateServiceWorker(true)
      } else {
        await mostrarToast('Ya tienes la última versión de la app.')
      }
    } catch (error) {
      console.error('[PWA] Error al actualizar', error)
      await mostrarToast('No se pudo comprobar si hay una actualización.')
    } finally {
      actualizando.value = false
    }
  }

  return { actualizarApp, actualizando, needRefresh }
}
