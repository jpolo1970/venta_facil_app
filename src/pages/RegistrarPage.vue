<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>Registrar venta</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="resetForm">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="form-field">
        <label>Fecha</label>
        <ion-datetime-button datetime="fecha-datetime" class="fecha-button" />
        <ion-modal ref="fechaModalRef" :keep-contents-mounted="true">
          <ion-datetime
            id="fecha-datetime"
            presentation="date"
            locale="es-ES"
            v-model="fecha"
            @ionChange="onFechaChange"
          />
        </ion-modal>
      </div>

      <div class="form-field">
        <label>Articulo</label>
        <button type="button" class="select-trigger" @click="abrirModalArticulo">
          <span :class="{ placeholder: !articuloSeleccionado }">
            {{ articuloSeleccionado ? articuloSeleccionado.articulo : 'Selecciona un articulo' }}
          </span>
          <ion-icon :icon="chevronDownOutline" />
        </button>
      </div>

      <div class="form-field">
        <label>Precio</label>
        <ion-input
          v-model="precio"
          type="number"
          inputmode="decimal"
          fill="outline"
          placeholder="0.00"
          @ionInput="onPrecioInput"
        />
      </div>

      <div class="form-field">
        <label>Cantidad</label>
        <ion-input
          ref="cantidadInputRef"
          v-model="cantidad"
          type="number"
          inputmode="decimal"
          fill="outline"
          placeholder="0.00"
          @ionInput="onCantidadInput"
        />
      </div>

      <div class="form-field">
        <ion-button expand="block" color="primary" class="btn-primary" :disabled="!puedeAgregar" @click="agregarItem">
          Agregar
        </ion-button>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        <ion-icon :icon="receiptOutline" />
        <p>Aún no agregaste artículos para esta venta.</p>
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.articulo }}</td>
              <td>{{ formatMoney(item.precio) }}</td>
              <td>{{ formatMoney(item.cantidad) }}</td>
              <td>{{ formatMoney(item.total) }}</td>
              <td>
                <ion-button fill="clear" class="delete-btn" @click="confirmarEliminar(item.id)">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section-total" v-if="items.length > 0">
        <span>Total registrado</span>
        <span>{{ formatMoney(totalItems) }}</span>
      </div>

      <ion-modal :is-open="mostrarModalArticulo" @didDismiss="onModalArticuloDidDismiss">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Seleccionar articulo</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="cerrarModalArticulo">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
          <ion-toolbar>
            <ion-searchbar
              v-model="busquedaArticulo"
              placeholder="Buscar articulo"
              debounce="0"
            />
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-radio-group :value="productoId" @ionChange="onSeleccionArticulo">
            <ion-item v-for="p in productosFiltrados" :key="p.id">
              <ion-radio :value="p.id" justify="start" label-placement="end">
                {{ p.articulo }} — S/ {{ formatMoney(p.precio) }}
              </ion-radio>
            </ion-item>
          </ion-radio-group>
          <div v-if="productosFiltrados.length === 0" class="empty-state">
            <ion-icon :icon="searchOutline" />
            <p>No se encontraron artículos.</p>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonMenuButton, IonIcon, IonContent,
  IonInput, IonModal, IonSearchbar, IonRadioGroup, IonRadio, IonItem,
  IonDatetimeButton, IonDatetime, alertController,
} from '@ionic/vue'
import { addOutline, trashOutline, receiptOutline, chevronDownOutline, searchOutline } from 'ionicons/icons'
import { listProductosActivos, listVentasPorFecha, crearVenta, eliminarVenta, todayIso } from '@/db/sqlite.js'
import { formatMoney } from '@/utils/format.js'

const fecha = ref(todayIso())
const productos = ref([])
const productoId = ref(null)
const precio = ref('')
const cantidad = ref('')
const items = ref([])
const mostrarModalArticulo = ref(false)
const busquedaArticulo = ref('')
const cantidadInputRef = ref(null)
const fechaModalRef = ref(null)
let enfocarCantidadAlCerrar = false

const totalItems = computed(() => items.value.reduce((acc, i) => acc + i.total, 0))

const articuloSeleccionado = computed(() => productos.value.find((p) => p.id === productoId.value))

const productosFiltrados = computed(() => {
  const q = busquedaArticulo.value.trim().toLowerCase()
  if (!q) return productos.value
  return productos.value.filter((p) => p.articulo.toLowerCase().includes(q))
})

const puedeAgregar = computed(() => {
  return (
    productoId.value !== null &&
    Number(precio.value) > 0 &&
    Number(cantidad.value) > 0
  )
})

function abrirModalArticulo() {
  busquedaArticulo.value = ''
  mostrarModalArticulo.value = true
}

function cerrarModalArticulo() {
  mostrarModalArticulo.value = false
}

function onSeleccionArticulo(ev) {
  const id = ev.detail.value
  productoId.value = id
  const p = productos.value.find((pr) => pr.id === id)
  if (p) precio.value = p.precio.toFixed(2)
  enfocarCantidadAlCerrar = true
  mostrarModalArticulo.value = false
}

// El modal restaura el foco al elemento que lo abrió al terminar su animación
// de cierre — esperamos ese evento para poder robarle el foco a Cantidad después.
function onModalArticuloDidDismiss() {
  mostrarModalArticulo.value = false
  if (enfocarCantidadAlCerrar) {
    enfocarCantidadAlCerrar = false
    setTimeout(() => {
      cantidadInputRef.value?.$el?.setFocus()
    }, 50)
  }
}

// Precio: máximo 6 dígitos en total, 2 decimales
function onPrecioInput(ev) {
  let v = ev.target.value ?? ''
  v = v.replace(/[^0-9.]/g, '')
  const parts = v.split('.')
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join('')}`
  const [intPart, decPart] = v.split('.')
  let clean = intPart?.slice(0, 6) ?? ''
  if (decPart !== undefined) clean += `.${decPart.slice(0, 2)}`
  precio.value = clean
  ev.target.value = clean
}

// Cantidad: máximo 3 dígitos enteros, 2 decimales
function onCantidadInput(ev) {
  let v = ev.target.value ?? ''
  v = v.replace(/[^0-9.]/g, '')
  const parts = v.split('.')
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join('')}`
  const [intPart, decPart] = v.split('.')
  let clean = intPart?.slice(0, 3) ?? ''
  if (decPart !== undefined) clean += `.${decPart.slice(0, 2)}`
  cantidad.value = clean
  ev.target.value = clean
}

function cargarProductos() {
  productos.value = listProductosActivos()
}

function cargarItems() {
  items.value = listVentasPorFecha(fecha.value)
}

// Elegir un día en el calendario aplica la fecha y cierra el modal al toque,
// sin necesidad de presionar "Listo".
function onFechaChange() {
  cargarItems()
  fechaModalRef.value?.$el?.dismiss()
}

async function agregarItem() {
  const p = productos.value.find((pr) => pr.id === productoId.value)
  const nuevo = await crearVenta({
    producto_id: productoId.value,
    articulo: p.articulo,
    precio: Number(precio.value),
    cantidad: Number(cantidad.value),
    fecha: fecha.value,
  })
  items.value.push(nuevo)
  productoId.value = null
  precio.value = ''
  cantidad.value = ''
}

async function confirmarEliminar(id) {
  const alert = await alertController.create({
    header: 'Eliminar item',
    message: 'Se va a eliminar el item, ¿deseas continuar?',
    buttons: [
      { text: 'No', role: 'cancel' },
      {
        text: 'Sí',
        role: 'destructive',
        handler: async () => {
          await eliminarVenta(id)
          items.value = items.value.filter((i) => i.id !== id)
        },
      },
    ],
  })
  await alert.present()
}

// Reinicia el formulario y la grilla: cada entrada a Registrar (o el botón +)
// representa una venta nueva, no continúa una sesión previa.
function resetForm() {
  fecha.value = todayIso()
  productoId.value = null
  precio.value = ''
  cantidad.value = ''
  busquedaArticulo.value = ''
  items.value = []
}

onMounted(() => {
  cargarProductos()
  resetForm()
})

onIonViewWillEnter(() => {
  cargarProductos()
  resetForm()
})
</script>

<style scoped>
.fecha-button {
  --background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  width: 100%;
  padding: 4px 12px;
}
</style>
