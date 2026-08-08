<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ tituloVentas }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="mostrarCalendario = true">
            <ion-icon slot="icon-only" :icon="calendarOutline" />
          </ion-button>
          <ion-button @click="cargarHoy">
            <ion-icon slot="start" :icon="todayOutline" />
            Hoy
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-text="Desliza para actualizar" refreshing-spinner="crescent" />
      </ion-refresher>

      <div v-if="ventas.length === 0" class="empty-state">
        <ion-icon :icon="cartOutline" />
        <p>Todavía no hay ventas registradas para esta fecha.</p>
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Articulo</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in ventas"
              :key="v.id"
              :class="{ selected: selectedId === v.id }"
              @click="toggleSelect(v.id)"
            >
              <td>{{ formatFechaHora(v.registrado_en) }}</td>
              <td>{{ v.articulo }}</td>
              <td>{{ formatMoney(v.precio) }}</td>
              <td>{{ formatMoney(v.cantidad) }}</td>
              <td>{{ formatMoney(v.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section-total" v-if="ventas.length > 0">
        <span>Total</span>
        <span>{{ formatMoney(totalDia) }}</span>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="irARegistrar">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <ion-toolbar v-if="selectedId !== null" class="selection-bar">
        <!-- id del item seleccionado se mantiene solo en memoria (selectedId), no se expone en el DOM -->
        <ion-buttons slot="end">
          <ion-button class="delete-btn" @click="confirmarEliminar">
            <ion-icon slot="start" :icon="trashOutline" />
            Eliminar
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="start">
          <ion-button @click="selectedId = null">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-modal :is-open="mostrarCalendario" @didDismiss="mostrarCalendario = false">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Seleccionar fecha</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="mostrarCalendario = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-datetime
            presentation="date"
            locale="es-ES"
            :value="fechaSeleccionada"
            @ionChange="onFechaSeleccionadaChange"
          />
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent,
  IonFab, IonFabButton, IonIcon, IonButtons, IonButton, IonMenuButton, IonModal, IonDatetime, alertController,
} from '@ionic/vue'
import { addOutline, cartOutline, trashOutline, calendarOutline, todayOutline } from 'ionicons/icons'
import { listVentasPorFecha, eliminarVenta, todayIso } from '@/db/sqlite.js'
import { formatFechaHora, formatMoney, formatFecha } from '@/utils/format.js'

const router = useRouter()
const ventas = ref([])
const selectedId = ref(null)
const fechaSeleccionada = ref(todayIso())
const mostrarCalendario = ref(false)

const totalDia = computed(() => ventas.value.reduce((acc, v) => acc + v.total, 0))
const esHoy = computed(() => fechaSeleccionada.value === todayIso())
const tituloVentas = computed(() => (esHoy.value ? 'Ventas de hoy' : `Ventas del ${formatFecha(fechaSeleccionada.value)}`))

function cargarVentas() {
  ventas.value = listVentasPorFecha(fechaSeleccionada.value)
  selectedId.value = null
}

function cargarHoy() {
  fechaSeleccionada.value = todayIso()
  cargarVentas()
}

function onFechaSeleccionadaChange(ev) {
  const value = ev.detail.value
  if (!value) return
  fechaSeleccionada.value = value.slice(0, 10)
  mostrarCalendario.value = false
  cargarVentas()
}

function toggleSelect(id) {
  selectedId.value = selectedId.value === id ? null : id
}

function irARegistrar() {
  router.push('/tabs/registrar')
}

async function confirmarEliminar() {
  const id = selectedId.value
  const alert = await alertController.create({
    header: 'Eliminar venta',
    message: 'Deseas eliminar el item, ¿estás seguro?',
    buttons: [
      { text: 'No', role: 'cancel' },
      {
        text: 'Sí',
        role: 'destructive',
        handler: async () => {
          await eliminarVenta(id)
          cargarVentas()
        },
      },
    ],
  })
  await alert.present()
}

function handleRefresh(event) {
  cargarVentas()
  event.target.complete()
}

// Al entrar a la pantalla, el valor por defecto siempre es la fecha actual.
function resetAHoy() {
  fechaSeleccionada.value = todayIso()
  cargarVentas()
}

onMounted(resetAHoy)
onIonViewWillEnter(resetAHoy)
</script>

<style scoped>
.selection-bar {
  position: sticky;
  bottom: 0;
  --background: var(--color-bg-card);
}
</style>
