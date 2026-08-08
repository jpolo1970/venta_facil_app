import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'

/* CSS base de Ionic — orden importa */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Estilos propios — después de Ionic para poder sobreescribir */
import '@/styles/theme.css'
import '@/styles/global.css'

import App from './App.vue'
import router from './router/index.js'
import { initDb } from '@/db/sqlite.js'

const app = createApp(App)

app.use(IonicVue)
app.use(router)

Promise.all([router.isReady(), initDb()]).then(() => {
  app.mount('#app')
})
