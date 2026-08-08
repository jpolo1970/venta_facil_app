export function formatFechaHora(isoString) {
  const d = new Date(isoString)
  const fecha = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return `${fecha} ${hora}`
}

export function formatMoney(value) {
  return Number(value).toFixed(2)
}

// fechaStr en formato "YYYY-MM-DD" -> "DD/MM/YYYY"
export function formatFecha(fechaStr) {
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y}`
}
