const pointsToPath = (points) => {
  if (points.length === 0) return ''
  if (points.length < 3) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[points.length - 1].x.toFixed(1)} ${points[points.length - 1].y.toFixed(1)}`
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2
    const midY = (points[i].y + points[i + 1].y) / 2
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`
  }

  const last = points[points.length - 1]
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`

  return d
}