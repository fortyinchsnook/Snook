import mascotCalm from '../assets/mascot-calm.png'

function loadImage(src, crossOrigin) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let sx, sy, sw, sh
  if (imgRatio > boxRatio) {
    sh = img.height
    sw = sh * boxRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / boxRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

// Builds a shareable image for a catch: photo + tier label + handle +
// a small watermark. Returns a Blob (PNG) ready to share or download.
export async function buildShareImage({ photoUrl, handle, length, tierLabel, verification }) {
  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // background photo (or a dark fallback if no photo)
  if (photoUrl) {
    try {
      const photo = await loadImage(photoUrl, true)
      drawCover(ctx, photo, 0, 0, W, H)
    } catch {
      ctx.fillStyle = '#0A0E14'
      ctx.fillRect(0, 0, W, H)
    }
  } else {
    ctx.fillStyle = '#0A0E14'
    ctx.fillRect(0, 0, W, H)
  }

  // dark gradient at the bottom so text stays readable over any photo
  const grad = ctx.createLinearGradient(0, H * 0.5, 0, H)
  grad.addColorStop(0, 'rgba(10,14,20,0)')
  grad.addColorStop(1, 'rgba(10,14,20,0.92)')
  ctx.fillStyle = grad
  ctx.fillRect(0, H * 0.5, W, H * 0.5)

  // verification pill
  ctx.font = '700 30px Arial'
  const pillText = verification === 'certified' ? '📏 CERTIFIED' : '🤥 LIAR'
  ctx.fillStyle = verification === 'certified' ? '#0F2A28' : '#3A1810'
  const pillW = ctx.measureText(pillText).width + 50
  const pillX = 60, pillY = H - 330
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillW, 56, 28)
  ctx.fill()
  ctx.fillStyle = verification === 'certified' ? '#2FE6D9' : '#FF5A36'
  ctx.textBaseline = 'middle'
  ctx.fillText(pillText, pillX + 25, pillY + 30)

  // length, huge
  ctx.font = '900 140px Arial'
  ctx.fillStyle = '#FFC93C'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`${length}"`, 60, H - 190)

  // tier label
  ctx.font = '700 40px Arial'
  ctx.fillStyle = '#E7EDF2'
  ctx.fillText(tierLabel || '', 60, H - 130)

  // angler handle
  ctx.font = '700 36px Arial'
  ctx.fillStyle = '#8593A2'
  ctx.fillText(`@${handle || 'angler'}`, 60, H - 80)

  // watermark
  ctx.font = '700 30px Arial'
  ctx.fillStyle = 'rgba(231,237,242,0.85)'
  ctx.textAlign = 'right'
  ctx.fillText('40inchsnook.com', W - 40, H - 40)
  ctx.textAlign = 'left'

  // small mascot in the corner, top right
  try {
    const mascot = await loadImage(mascotCalm)
    const mw = 140
    const mh = mw * (mascot.height / mascot.width)
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 20
    ctx.drawImage(mascot, W - mw - 40, 40, mw, mh)
    ctx.restore()
  } catch {
    // fine without it
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Shares a catch via the native share sheet when available; falls back
// to triggering a plain download if the browser can't share files.
export async function shareCatch(catchData) {
  const blob = await buildShareImage(catchData)
  const file = new File([blob], 'snook-catch.png', { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: '40" Snook Club',
      text: `Check out this ${catchData.length}" snook on 40 Snook Club!`,
    })
    return 'shared'
  }

  // fallback: download the image
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'snook-catch.png'
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
