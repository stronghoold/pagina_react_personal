/**
 * Gráfico lineal reutilizable (SVG puro, sin librerías externas).
 * Recibe la información desde FastAPI: { etiquetas: [], valores: [] }.
 */
const LineChart = ({
  data,
  color = '#06b6d4',
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

  const padding = { top: 18, right: 22, bottom: 52, left: 78 }
  const ancho = Math.max(360, etiquetas.length * 62)
  const alturaArea = altura - padding.top - padding.bottom
  const anchoArea = ancho - padding.left - padding.right
  const max = Math.max(...valores, 1)
  const potencia = Math.pow(10, Math.floor(Math.log10(max)))
  const escala = potencia * Math.ceil(max / potencia)

  const paso = etiquetas.length > 1 ? anchoArea / (etiquetas.length - 1) : 0
  const puntos = valores.map((valor, i) => ({
    x: padding.left + i * paso,
    y: padding.top + alturaArea - (valor / escala) * alturaArea,
    valor,
    etiqueta: etiquetas[i],
  }))

  const linea = puntos.map((p) => `${p.x},${p.y}`).join(' ')
  const area = `${padding.left},${padding.top + alturaArea} ${linea} ${
    padding.left + (puntos.length - 1) * paso
  },${padding.top + alturaArea}`

  const lineas = [0, 0.25, 0.5, 0.75, 1]
  const rotarEtiquetas = etiquetas.length > 6

  return (
    <svg
      viewBox={`0 0 ${ancho} ${altura}`}
      className="h-64 w-full"
      role="img"
      aria-label="Gráfico lineal"
    >
      <defs>
        <linearGradient id={`area-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

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

      <polygon points={area} fill={`url(#area-${color.replace('#', '')})`} />
      <polyline
        points={linea}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {puntos.map((p) => (
        <g key={p.etiqueta}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke={color} strokeWidth="2.5">
            <title>{`${p.etiqueta}: ${formato(p.valor)}`}</title>
          </circle>
          <text
            x={p.x}
            y={padding.top + alturaArea + 16}
            textAnchor={rotarEtiquetas ? 'end' : 'middle'}
            transform={rotarEtiquetas ? `rotate(-35 ${p.x} ${padding.top + alturaArea + 16})` : undefined}
            className="fill-slate-500 dark:fill-slate-400"
            style={{ fontSize: 10 }}
          >
            {p.etiqueta}
          </text>
        </g>
      ))}

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

export default LineChart
