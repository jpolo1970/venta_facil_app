import { ref } from 'vue'
import { toastController } from '@ionic/vue'

// Chrome/Edge/Android disparan 'beforeinstallprompt' y lo dejan disponible para
// invocarlo manualmente más tarde — hay que capturarlo apenas carga el módulo,
// antes de que el usuario abra el menú.
const promptDiferido = ref(null)
const appInstalada = ref(esStandalone())

function esStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  promptDiferido.value = event
})

window.addEventListener('appinstalled', () => {
  appInstalada.value = true
  promptDiferido.value = null
})

const mostrarPasosIOS = ref(false)

async function mostrarToast(message) {
  const toast = await toastController.create({ message, duration: 2500, position: 'bottom' })
  await toast.present()
}

export function useInstallPwa() {
  async function instalarApp() {
    if (promptDiferido.value) {
      promptDiferido.value.prompt()
      const { outcome } = await promptDiferido.value.userChoice
      if (outcome === 'accepted') appInstalada.value = true
      promptDiferido.value = null
      return
    }
    if (esIOS) {
      mostrarPasosIOS.value = true
      return
    }
    await mostrarToast('Este navegador no permite instalar la app. Busca la opción "Instalar app" en el menú del navegador.')
  }

  return { instalarApp, appInstalada, esIOS, mostrarPasosIOS }
}
