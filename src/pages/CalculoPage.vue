<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>Calculo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="resumen.length === 0" class="empty-state">
        <ion-icon :icon="calculatorOutline" />
        <p>Todavía no hay ventas registradas.</p>
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Año-Mes</th>
              <th>Cantidad de articulos vendidos</th>
              <th>Total vendido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in resumen" :key="r.anioMes">
              <td>{{ r.anioMes }}</td>
              <td>{{ formatMoney(r.cantidadArticulos) }}</td>
              <td>{{ formatMoney(r.totalVendido) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonMenuButton } from '@ionic/vue'
import { calculatorOutline } from 'ionicons/icons'
import { listResumenPorMes } from '@/db/sqlite.js'
import { formatMoney } from '@/utils/format.js'

const resumen = ref([])

function cargarResumen() {
  resumen.value = listResumenPorMes()
}

onMounted(cargarResumen)
onIonViewWillEnter(cargarResumen)
</script>
