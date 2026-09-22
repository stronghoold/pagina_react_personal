/**
 * Gráfico de barras reutilizable (SVG puro, sin librerías externas).
 * Recibe la información desde FastAPI: { etiquetas: [], valores: [] }.
 */
const BarChart = ({
  data,
  color = '#6366f1',
  colorOscuro = '#4338ca',
  formato = (v) => v,
  altura = 260,
  vacio = 'No hay información para mostrar.',
}) => {
  const etiquetas = data?.etiquetas || []
  const valores = (data?.valores || []).map((v) => Number(v) || 0)

  if (etiquetas.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">{vacio}</p>
    )
  }

  const padding = { top: 18, right: 18, bottom: 52, left: 78 }
  const anchoBarra = 34
  const ancho = Math.max(360, etiquetas.length * (anchoBarra + 28))
  const alturaArea = altura - padding.top - padding.bottom
  const max = Math.max(...valores, 1)
  // Redondea el máximo hacia arriba para que la escala sea legible
  const escala = Math.pow(10, Math.floor(Math.log10(max))) * Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max))))
  const anchoArea = ancho - padding.left - padding.right
  const paso = anchoArea / etiquetas.length

  const lineas = [0, 0.25, 0.5, 0.75, 1]
  const rotarEtiquetas = etiquetas.length > 6

  return (
    <svg
      viewBox={`0 0 ${ancho} ${altura}`}
      className="h-64 w-full"
      role="img"
      aria-label="Gráfico de barras"
    >
      {/* Rejilla y eje Y */}
      {lineas.map((p) => {
        const y = padding.top + alturaArea - p * alturaArea
        return (
          <g key={p}>
            <line
              x1={padding.left}
              y1={y}
              x2={ancho - padding.right}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-500 dark:fill-slate-400"
              style={{ fontSize: 10 }}
            >
              {formato(Math.round(escala * p))}
            </text>
          </g>
        )
      })}

      {/* Barras */}
      {valores.map((valor, i) => {
        const alturaBarra = escala === 0 ? 0 : (valor / escala) * alturaArea
        const x = padding.left + i * paso + (paso - anchoBarra) / 2
        const y = padding.top + alturaArea - alturaBarra
        return (
          <g key={etiquetas[i]}>
            <rect
              x={x}
              y={y}
              width={anchoBarra}
              height={Math.max(alturaBarra, valor > 0 ? 2 : 0)}
              rx="6"
              fill={color}
            >
              <title>{`${etiquetas[i]}: ${formato(valor)}`}</title>
            </rect>
            <rect
              x={x}
              y={y}
              width={anchoBarra}
              height={Math.max(alturaBarra, valor > 0 ? 2 : 0)}
              rx="6"
              fill="none"
              stroke={colorOscuro}
              strokeOpacity="0.6"
            />
            <text
              x={x + anchoBarra / 2}
              y={padding.top + alturaArea + 16}
              textAnchor={rotarEtiquetas ? 'end' : 'middle'}
              transform={rotarEtiquetas ? `rotate(-35 ${x + anchoBarra / 2} ${padding.top + alturaArea + 16})` : undefined}
              className="fill-slate-500 dark:fill-slate-400"
              style={{ fontSize: 10 }}
            >
              {etiquetas[i]}
            </text>
          </g>
        )
      })}

      {/* Eje inferior */}
      <line
        x1={padding.left}
        y1={padding.top + alturaArea}
        x2={ancho - padding.right}
        y2={padding.top + alturaArea}
        stroke="currentColor"
        strokeOpacity="0.35"
      />
    </svg>
  )
}

export default BarChart
