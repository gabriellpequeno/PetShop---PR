export class CustomCursor {
  private cursor!: HTMLElement
  private cursorX: number = 0
  private cursorY: number = 0
  private mouseX: number = 0
  private mouseY: number = 0
  private isTouchDevice: boolean = false
  private lastTrailX: number = 0
  private lastTrailY: number = 0
  private rotation: number = 0

  private trailX: number = 0
  private trailY: number = 0

  constructor() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (this.isTouchDevice) return

    this.cursor = document.createElement('div')
    this.cursor.classList.add('custom-cursor')
    document.body.appendChild(this.cursor)

    this.addEventListeners()
    this.animate()
  }

  private addEventListeners(): void {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
      // Trail handling moved to animate() for delay
    })

    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('clicking')
    })

    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('clicking')
    })

    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.logo-container') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('service-card')

      if (isInteractive) {
        this.cursor.classList.add('hovering')
      }
    })

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.logo-container') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('service-card')

      if (isInteractive) {
        this.cursor.classList.remove('hovering')
      }
    })
  }

  private handleTrail(x: number, y: number): void {
    const dx = x - this.lastTrailX
    const dy = y - this.lastTrailY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 30) {
      this.spawnFootprint(x, y)
      this.lastTrailX = x
      this.lastTrailY = y
    }
  }

  private spawnFootprint(x: number, y: number): void {
    const footprint = document.createElement('div')
    footprint.classList.add('cursor-footprint')

    const dx = x - this.lastTrailX
    const dy = y - this.lastTrailY

    // Inverted logic (+90)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    // Offset +30px
    footprint.style.setProperty('--x', `${x + 20}px`)
    footprint.style.setProperty('--y', `${y + 20}px`)
    footprint.style.setProperty('--r', `${angle + 90}deg`)

    document.body.appendChild(footprint)

    setTimeout(() => {
      footprint.remove()
    }, 800)
  }

  private animate(): void {
    // Instant movement logic (no LERP) for main cursor
    const dx = this.mouseX - this.cursorX
    const dy = this.mouseY - this.cursorY

    // Direct assignment to remove lag for cursor
    this.cursorX = this.mouseX
    this.cursorY = this.mouseY

    // LERP for Trail (add delay)
    // 0.2 factor = smoother/slower catch up
    this.trailX += (this.mouseX - this.trailX) * 0.2
    this.trailY += (this.mouseY - this.trailY) * 0.2
    
    this.handleTrail(this.trailX, this.trailY)

    // Calculate rotation if moving significantly
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
       // Offset +90deg to correct orientation (was -90 and upside down)
       this.rotation = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90
    }

    this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0) rotate(${this.rotation}deg)`

    requestAnimationFrame(() => this.animate())
  }
}
