<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="ventas" href="/tabs/ventas">
          <ion-icon :icon="cartOutline" />
          <ion-label>Ventas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="registrar" href="/tabs/registrar">
          <ion-icon :icon="addCircleOutline" />
          <ion-label>Registrar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="productos" href="/tabs/productos">
          <ion-icon :icon="pricetagOutline" />
          <ion-label>Productos</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="calculo" href="/tabs/calculo">
          <ion-icon :icon="calculatorOutline" />
          <ion-label>Calculo</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon, IonRouterOutlet } from '@ionic/vue'
import { cartOutline, addCircleOutline, pricetagOutline, calculatorOutline } from 'ionicons/icons'
</script>
