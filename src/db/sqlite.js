import initSqlJs from 'sql.js'
import { get, set } from 'idb-keyval'

// Única puerta a la base de datos SQLite (sql.js compilado a WASM).
// El motor corre en memoria y el archivo binario completo se persiste
// en IndexedDB (clave IDB_KEY) después de cada escritura — no hay
// Capacitor ni backend, así que esta es la forma de tener SQLite real
// en una PWA pura.
const IDB_KEY = 'calcula-ingreso-sqlite-db'
const SEED_VERSION_KEY = 'calcula-ingreso-seed-version'
const SEED_VERSION = 2

const PRODUCTOS_SEED = [
  { articulo: 'Arroz superior 1 kg', precio: 4.5 },
  { articulo: 'Azúcar blanca 1 kg', precio: 4.0 },
  { articulo: 'Aceite vegetal 1 litro', precio: 9.5 },
  { articulo: 'Fideos spaghetti 500 g', precio: 3.5 },
  { articulo: 'Harina de trigo 1 kg', precio: 4.0 },
  { articulo: 'Sal yodada 1 kg', precio: 2.0 },
  { articulo: 'Leche evaporada tarro 400 g', precio: 4.5 },
  { articulo: 'Leche evaporada tarro 170 g', precio: 2.5 },
  { articulo: 'Avena en hojuelas 500 g', precio: 4.5 },
  { articulo: 'Lentejas 500 g', precio: 4.5 },
  { articulo: 'Frijol canario 500 g', precio: 5.5 },
  { articulo: 'Arveja partida 500 g', precio: 4.0 },
  { articulo: 'Atún en lata 170 g', precio: 6.5 },
  { articulo: 'Sardinas en lata 155 g', precio: 5.0 },
  { articulo: 'Mayonesa 475 g', precio: 9.5 },
  { articulo: 'Ketchup 397 g', precio: 7.5 },
  { articulo: 'Galletas de soda 140 g', precio: 3.0 },
  { articulo: 'Galletas de chocolate 150 g', precio: 3.5 },
  { articulo: 'Galletas rellenas 100 g', precio: 2.5 },
  { articulo: 'Chocolate en barra 40 g', precio: 3.5 },
  { articulo: 'Papas fritas 45 g', precio: 2.5 },
  { articulo: 'Chizitos 45 g', precio: 2.0 },
  { articulo: 'Agua mineral 625 ml', precio: 2.0 },
  { articulo: 'Agua mineral 2.5 litros', precio: 4.5 },
  { articulo: 'Gaseosa Inca Kola 500 ml', precio: 3.5 },
  { articulo: 'Gaseosa Coca-Cola 500 ml', precio: 3.5 },
  { articulo: 'Gaseosa Pepsi 500 ml', precio: 3.0 },
  { articulo: 'Gaseosa Inca Kola 1.5 litros', precio: 6.0 },
  { articulo: 'Jugo en caja 1 litro', precio: 6.0 },
  { articulo: 'Bebida energizante 355 ml', precio: 6.0 },
  { articulo: 'Café instantáneo 50 g', precio: 8.0 },
  { articulo: 'Té filtrante caja x 25', precio: 5.0 },
  { articulo: 'Pan de molde 500 g', precio: 8.0 },
  { articulo: 'Huevos 1/2 docena', precio: 4.5 },
  { articulo: 'Jabón de lavar ropa 200 g', precio: 3.0 },
  { articulo: 'Detergente en polvo 500 g', precio: 6.5 },
  { articulo: 'Lavavajilla 500 ml', precio: 6.0 },
  { articulo: 'Papel higiénico paquete x 4', precio: 8.5 },
  { articulo: 'Pasta dental 90 g', precio: 5.5 },
  { articulo: 'Shampoo 400 ml', precio: 12.0 },
  { articulo: 'Jabón de tocador 90 g', precio: 3.5 },
]

let SQL = null
let db = null
let initPromise = null

function todayIso() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

async function persist() {
  const data = db.export()
  await set(IDB_KEY, data)
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      articulo TEXT NOT NULL,
      precio REAL NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      articulo TEXT NOT NULL,
      precio REAL NOT NULL,
      cantidad REAL NOT NULL,
      total REAL NOT NULL,
      fecha TEXT NOT NULL,
      registrado_en TEXT NOT NULL
    );
  `)
  migrateSchema()
}

// Bases de datos creadas antes de la columna `activo` no la tienen —
// CREATE TABLE IF NOT EXISTS no la agrega a tablas existentes.
function migrateSchema() {
  const columnas = queryAll('PRAGMA table_info(productos)')
  const tieneActivo = columnas.some((c) => c.name === 'activo')
  if (!tieneActivo) {
    db.run('ALTER TABLE productos ADD COLUMN activo INTEGER NOT NULL DEFAULT 1')
  }
}

function insertProductosSeed() {
  const stmt = db.prepare('INSERT INTO productos (articulo, precio) VALUES (?, ?)')
  for (const p of PRODUCTOS_SEED) {
    stmt.run([p.articulo, p.precio])
  }
  stmt.free()
}

// Reemplaza el catálogo de productos por PRODUCTOS_SEED una única vez por
// SEED_VERSION — así se puede actualizar la lista de productos ya
// desplegada sin que cada reinicio de la app borre lo que el usuario
// haya agregado o editado después.
async function reseedProductosSiCorresponde() {
  const versionGuardada = (await get(SEED_VERSION_KEY)) ?? 0
  if (versionGuardada >= SEED_VERSION) return
  db.run('DELETE FROM productos')
  insertProductosSeed()
  await set(SEED_VERSION_KEY, SEED_VERSION)
}

export async function initDb() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    SQL = await initSqlJs({ locateFile: (file) => `${import.meta.env.BASE_URL}${file}` })
    const saved = await get(IDB_KEY)
    db = saved ? new SQL.Database(saved) : new SQL.Database()
    createSchema()
    await reseedProductosSiCorresponde()
    await persist()
  })()
  return initPromise
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

// ---------- Productos ----------

export function listProductos() {
  return queryAll('SELECT id, articulo, precio, activo FROM productos ORDER BY articulo ASC')
}

export function listProductosActivos() {
  return queryAll('SELECT id, articulo, precio, activo FROM productos WHERE activo = 1 ORDER BY articulo ASC')
}

export async function crearProducto({ articulo, precio }) {
  db.run('INSERT INTO productos (articulo, precio) VALUES (?, ?)', [articulo, precio])
  await persist()
  return db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
}

export async function actualizarProducto({ id, articulo, precio, activo }) {
  db.run('UPDATE productos SET articulo = ?, precio = ?, activo = ? WHERE id = ?', [
    articulo,
    precio,
    activo ? 1 : 0,
    id,
  ])
  await persist()
}

// ---------- Ventas ----------

export function listVentasPorFecha(fecha) {
  return queryAll(
    'SELECT id, producto_id, articulo, precio, cantidad, total, fecha, registrado_en FROM ventas WHERE fecha = ? ORDER BY registrado_en DESC',
    [fecha]
  )
}

export function listVentasHoy() {
  return listVentasPorFecha(todayIso())
}

export async function crearVenta({ producto_id, articulo, precio, cantidad, fecha }) {
  const total = Math.round(precio * cantidad * 100) / 100
  const registrado_en = new Date().toISOString()
  db.run(
    'INSERT INTO ventas (producto_id, articulo, precio, cantidad, total, fecha, registrado_en) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [producto_id, articulo, precio, cantidad, total, fecha, registrado_en]
  )
  await persist()
  const id = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
  return { id, producto_id, articulo, precio, cantidad, total, fecha, registrado_en }
}

export async function eliminarVenta(id) {
  db.run('DELETE FROM ventas WHERE id = ?', [id])
  await persist()
}

// ---------- Cálculo (resumen por año-mes) ----------

export function listResumenPorMes() {
  return queryAll(`
    SELECT
      substr(fecha, 1, 7) as anioMes,
      SUM(cantidad) as cantidadArticulos,
      SUM(total) as totalVendido
    FROM ventas
    GROUP BY anioMes
    ORDER BY anioMes DESC
  `)
}

export { todayIso }
