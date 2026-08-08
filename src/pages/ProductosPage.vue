<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>Productos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="productos.length === 0" class="empty-state">
        <ion-icon :icon="pricetagOutline" />
        <p>Todavía no hay productos registrados.</p>
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Articulo</th>
              <th>Precio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productos" :key="p.id" :class="{ inactivo: !p.activo }" @click="abrirEdicion(p)">
              <td>{{ p.id }}</td>
              <td>{{ p.articulo }}</td>
              <td>{{ formatMoney(p.precio) }}</td>
              <td>
                <span class="badge-estado" :class="p.activo ? 'activo' : 'inactivo'">
                  {{ p.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="mostrarFormulario = true">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="mostrarFormulario" @didDismiss="mostrarFormulario = false">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Nuevo producto</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="mostrarFormulario = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="form-field">
            <label>Articulo</label>
            <ion-input v-model="nuevoArticulo" fill="outline" placeholder="Nombre del articulo" />
          </div>
          <div class="form-field">
            <label>Precio</label>
            <ion-input
              v-model="nuevoPrecio"
              type="number"
              inputmode="decimal"
              fill="outline"
              placeholder="0.00"
              @ionInput="onPrecioInput"
            />
          </div>
          <div class="form-field">
            <ion-button expand="block" color="primary" class="btn-primary" :disabled="!puedeGuardar" @click="guardarProducto">
              Guardar
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="mostrarEdicion" @didDismiss="mostrarEdicion = false">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Editar producto</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="mostrarEdicion = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="form-field">
            <label>Articulo</label>
            <ion-input v-model="editArticulo" fill="outline" placeholder="Nombre del articulo" />
          </div>
          <div class="form-field">
            <label>Precio</label>
            <ion-input
              v-model="editPrecio"
              type="number"
              inputmode="decimal"
              fill="outline"
              placeholder="0.00"
              @ionInput="onEditPrecioInput"
            />
          </div>
          <div class="form-field toggle-field">
            <label>Producto activo</label>
            <ion-toggle v-model="editActivo" />
          </div>
          <div class="form-field">
            <ion-button expand="block" color="primary" class="btn-primary" :disabled="!puedeGuardarEdicion" @click="guardarEdicion">
              Guardar cambios
            </ion-button>
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon,
  IonModal, IonButtons, IonButton, IonMenuButton, IonInput, IonToggle,
} from '@ionic/vue'
import { addOutline, pricetagOutline } from 'ionicons/icons'
import { listProductos, crearProducto, actualizarProducto } from '@/db/sqlite.js'
import { formatMoney } from '@/utils/format.js'

const productos = ref([])
const mostrarFormulario = ref(false)
const nuevoArticulo = ref('')
const nuevoPrecio = ref('')

const mostrarEdicion = ref(false)
const editId = ref(null)
const editArticulo = ref('')
const editPrecio = ref('')
const editActivo = ref(true)

const puedeGuardar = computed(() => nuevoArticulo.value.trim().length > 0 && Number(nuevoPrecio.value) > 0)
const puedeGuardarEdicion = computed(() => editArticulo.value.trim().length > 0 && Number(editPrecio.value) > 0)

function limpiarPrecio(valor) {
  let v = valor ?? ''
  v = v.replace(/[^0-9.]/g, '')
  const parts = v.split('.')
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join('')}`
  const [intPart, decPart] = v.split('.')
  let clean = intPart?.slice(0, 6) ?? ''
  if (decPart !== undefined) clean += `.${decPart.slice(0, 2)}`
  return clean
}

function onPrecioInput(ev) {
  const clean = limpiarPrecio(ev.target.value)
  nuevoPrecio.value = clean
  ev.target.value = clean
}

function onEditPrecioInput(ev) {
  const clean = limpiarPrecio(ev.target.value)
  editPrecio.value = clean
  ev.target.value = clean
}

function cargarProductos() {
  productos.value = listProductos()
}

async function guardarProducto() {
  await crearProducto({ articulo: nuevoArticulo.value.trim(), precio: Number(nuevoPrecio.value) })
  nuevoArticulo.value = ''
  nuevoPrecio.value = ''
  mostrarFormulario.value = false
  cargarProductos()
}

function abrirEdicion(p) {
  editId.value = p.id
  editArticulo.value = p.articulo
  editPrecio.value = String(p.precio)
  editActivo.value = !!p.activo
  mostrarEdicion.value = true
}

async function guardarEdicion() {
  await actualizarProducto({
    id: editId.value,
    articulo: editArticulo.value.trim(),
    precio: Number(editPrecio.value),
    activo: editActivo.value,
  })
  mostrarEdicion.value = false
  cargarProductos()
}

onMounted(cargarProductos)
onIonViewWillEnter(cargarProductos)
</script>

<style scoped>
.data-table tbody tr.inactivo {
  color: var(--color-text-disabled);
}

.badge-estado {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-estado.activo {
  background: rgba(var(--ion-color-success-rgb), 0.15);
  color: var(--ion-color-success);
}

.badge-estado.inactivo {
  background: rgba(var(--ion-color-medium-rgb), 0.15);
  color: var(--ion-color-medium);
}

.toggle-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-field label {
  margin-bottom: 0;
}
</style>
