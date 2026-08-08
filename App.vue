<template>
  <ion-app>
    <ion-menu content-id="main-content" side="start">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>VentaFacil</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list lines="none" class="menu-list">
          <ion-menu-toggle v-for="item in menuItems" :key="item.path" auto-hide="false">
            <ion-item button :router-link="item.path" :class="{ 'menu-item-active': route.path.startsWith(item.path) }">
              <ion-icon slot="start" :icon="item.icon" />
              <ion-label>{{ item.label }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <template v-if="!appInstalada">
            <div class="menu-divider"></div>
            <ion-item button @click="instalarApp">
              <ion-icon slot="start" :icon="downloadOutline" />
              <ion-label>Instalar App</ion-label>
            </ion-item>
          </template>
        </ion-list>
      </ion-content>
      <ion-footer class="menu-footer">
        <ion-list lines="none">
          <ion-item button :disabled="actualizando" @click="actualizarApp">
            <ion-icon slot="start" :icon="refreshOutline" :class="{ spinning: actualizando }" />
            <ion-label>{{ actualizando ? 'Actualizando…' : 'Actualizar App' }}</ion-label>
          </ion-item>
        </ion-list>
        <div class="menu-version">v{{ appVersion }}</div>
      </ion-footer>
    </ion-menu>

    <div v-if="actualizando" class="update-overlay">
      <div class="update-overlay-content">
        <ion-icon :icon="refreshOutline" class="update-overlay-icon" />
        <p>Actualizando app…</p>
      </div>
    </div>

    <ion-modal :is-open="mostrarPasosIOS" @didDismiss="mostrarPasosIOS = false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Instalar App</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="mostrarPasosIOS = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>Para instalar la app en tu iPhone o iPad, seguí estos pasos en Safari:</p>
        <ol class="pasos-ios">
          <li>
            <ion-icon :icon="shareOutline" />
            Tocá el botón <strong>Compartir</strong> en la barra inferior (o superior) de Safari.
          </li>
          <li>
            <ion-icon :icon="addCircleOutline" />
            Deslizá hacia abajo y elegí <strong>"Agregar a pantalla de inicio"</strong>.
          </li>
          <li>
            <ion-icon :icon="checkmarkCircleOutline" />
            Tocá <strong>"Agregar"</strong> arriba a la derecha.
          </li>
        </ol>
        <p class="pasos-nota">El ícono de la app aparecerá en tu pantalla de inicio, lista para usar sin conexión.</p>
      </ion-content>
    </ion-modal>

    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  IonApp, IonRouterOutlet, IonMenu, IonMenuToggle, IonHeader, IonToolbar, IonTitle,
  IonContent, IonFooter, IonList, IonItem, IonIcon, IonLabel, IonModal, IonButtons, IonButton,
} from '@ionic/vue'
import {
  refreshOutline, downloadOutline, shareOutline, addCircleOutline, checkmarkCircleOutline,
  cartOutline, pricetagOutline, calculatorOutline,
} from 'ionicons/icons'
import { usePwa } from '@/composables/usePwa.js'
import { useInstallPwa } from '@/composables/useInstallPwa.js'

const route = useRoute()
const menuItems = [
  { path: '/tabs/ventas', label: 'Ventas', icon: cartOutline },
  { path: '/tabs/registrar', label: 'Registrar', icon: addCircleOutline },
  { path: '/tabs/productos', label: 'Productos', icon: pricetagOutline },
  { path: '/tabs/calculo', label: 'Calculo', icon: calculatorOutline },
]

const { actualizarApp, actualizando } = usePwa()
const { instalarApp, appInstalada, mostrarPasosIOS } = useInstallPwa()
const appVersion = __APP_VERSION__
</script>

<style scoped>
.menu-list {
  padding-top: 8px;
}

.menu-item-active {
  --background: rgba(var(--ion-color-primary-rgb), 0.1);
  --color: var(--ion-color-primary);
}

.menu-item-active ion-icon {
  color: var(--ion-color-primary);
}

.menu-divider {
  height: 1px;
  margin: 8px 16px;
  background: var(--color-border);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.menu-footer {
  border-top: 1px solid var(--color-border);
}

.menu-version {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
  padding: 8px 16px 16px;
}

.update-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  animation: fade-in 0.2s ease;
}

.update-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #fff;
  font-size: 16px;
}

.update-overlay-icon {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.pasos-ios {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pasos-ios li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pasos-ios ion-icon {
  flex-shrink: 0;
  font-size: 24px;
  color: var(--ion-color-primary);
}

.pasos-nota {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>
