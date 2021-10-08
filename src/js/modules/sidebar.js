export default class {
    constructor(screen, sidebar, table) {
      this.screen = screen
      this.sidebar = sidebar
      this.table = table

      this.onPointerOver = event => {
        if (!event.target.closest('table')
        || event.relatedTarget.closest('table')
        || event.relatedTarget.closest('.game__settings')) return

        this.sidebar.classList.add('preview')
        setTimeout(() => {
          this.sidebar.classList.remove('preview')
        }, 200)
      }

      this.onPointerOut = evt => {
        if (!evt.relatedTarget) return
        if (!evt.target.closest('table')) return
        if (evt.relatedTarget.closest('table')
          || evt.relatedTarget.closest('.game__settings')) return

        if (this.sidebar.classList.contains('full')) this.closeSidebar()
      }

      this.onPointerLeave = evt => {
        if (evt.relatedTarget.closest('table')
        || !evt.target.classList.contains('full')) return

        this.closeSidebar()
      }
    }

    setTableListeners() {
      this.screen.addEventListener('pointerover', this.onPointerOver)
      this.screen.addEventListener('pointerout', this.onPointerOut)
      this.sidebar.addEventListener('pointerleave', this.onPointerLeave)
    }

    removeTableListeners() {
      this.screen.removeEventListener('pointerover', this.onPointerOver)
      this.screen.removeEventListener('pointerout', this.onPointerOut)
      this.sidebar.removeEventListener('pointerleave', this.onPointerLeave)
    }

    closeSidebar() {
      this.sidebar.classList.add('hide__sidebar')
      this.sidebar.classList.remove('full')
      setTimeout(() => {
        this.sidebar.classList.remove('hide__sidebar')
      }, 500)
    }
  }