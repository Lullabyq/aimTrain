import Sidebar from "./sidebar"

export default class {

    constructor(trackedAmount, newPerf) {
      this.trackedAmount = trackedAmount
      this.newPerf = newPerf
      this.mode = this.newPerf.mode
      this.time = this.newPerf.time

      window.addEventListener('resize', this.makeStaticSidebar.bind(this))
      window.addEventListener('load', this.makeStaticSidebar.bind(this))
    }

    storeResult() {
      this._prevResults = this.getLocalData()
      this.placeNewResult()
    }

    fillLeaderboardTable(screen) {
      this.screen = screen
      this.table = screen.querySelector('.leaderboard__table')
      this.rows = screen.querySelectorAll('.leaderboard__perfomance')

      this.createSidebar()
      this.insertResult(this.getLocalData())
      this.highlightSettings()
    }

    createSidebar() {
      this.settings = this.screen.querySelector('.game__settings')

      this.sidebar = new Sidebar(this.screen, this.settings, this.table)
      this.sidebar.setTableListeners()
      this.isRemoved = false

      this.settings.addEventListener('click', evt => {
        let classes = this.settings.classList
        if (!classes.contains('full')
        && !classes.contains('game__settings--static')) classes.add('full')

        if (!evt.target.closest('button')
        || evt.target.classList.contains('active')) return

        let btnType = evt.target.closest('.game__settings--option')

        btnType.querySelector('.active').classList.remove('active')
        evt.target.classList.add('active')

        if (btnType.classList.contains('game--mode')) {
          this.refreshTable(evt.target, 'mode')
        } else {
          this.refreshTable(evt.target, 'time')
        }
      })
    }

    refreshTable(activeBtn, type) {
      this[type] = +activeBtn.dataset[type]
      this.insertResult(this.getLocalData())
    }

    makeStaticSidebar() {
      if (document.documentElement.clientWidth < 970 && !this.isRemoved) {
        this.sidebar.removeTableListeners()
        this.isRemoved = true
        this.settings.classList.add('game__settings--static')

      } else if (document.documentElement.clientWidth >= 970 && this.isRemoved) {
        this.sidebar.setTableListeners()
        this.settings.classList.remove('game__settings--static')
        this.isRemoved = false
      }
    }

    insertResult(results) {
      this.rows.forEach(row => {
        row.innerHTML = ''
        let index = Array.from(this.rows).indexOf(row)
        let perf  = results[index]

        if (index == this._positionIndex
          && this.mode == this.newPerf.mode
          && this.time == this.newPerf.time) {
          row.classList.add('new__result')
          this.createAndFillCells(row, 'New', perf.score, perf.pace, `${perf.accuracy} %`)
        } else if (perf === undefined) {
          row.classList.remove('new__result')
          this.createAndFillCells(row, `${index + 1})`, '-', '-', '-')
        } else {
          row.classList.remove('new__result')
          this.createAndFillCells(row, `${index + 1})`, perf.score, perf.pace, `${perf.accuracy} %`)
        }
      })
    }

    createAndFillCells(row, ...data) {
      for (let i = 0; i < data.length; i++) {
        let cell = document.createElement('td')
        cell.innerHTML = data[i]
        row.append(cell)
      }
    }

    highlightSettings() {
      this.screen
        .querySelector(`.column__right [data-mode="${this.mode}"]`)
        .classList.add('active')
      this.screen
        .querySelector(`.column__right [data-time="${this.time}"]`)
        .classList.add('active')
    }

    getLocalData() {
      let data = []

      for (let i = 0; i < this.trackedAmount; i++) {
        let achiv = JSON.parse(localStorage.getItem(this.generateKey(i + 1)))
        if (achiv) data.push(achiv)
      }

      return data
    }

    placeNewResult() {
      for (let i = 0; i < this.trackedAmount; i++) {
        if (this.checkOldPerfomance(this._prevResults[i])) {
          this._positionIndex = i
          this.changeStorage()
          break
        }
      }
    }

    checkOldPerfomance(old) {
      if (!old) return true
      return this.newPerf.score === old.score ?
      this.newPerf.accuracy > old.accuracy : this.newPerf.score > old.score
    }

    changeStorage() {
      localStorage.setItem(this.generateKey(this._positionIndex + 1), JSON.stringify(this.newPerf))
      for (let i = this._positionIndex; i < this.trackedAmount - 1; i++) {
        if (this._prevResults[i]) {
          localStorage.setItem(this.generateKey(i + 2), JSON.stringify(this._prevResults[i]))
        }
      }
    }

    generateKey(p) {
      return `m${this.mode}, t${this.time}, n${p}`
    }

    clearStorage() {
      localStorage.clear()
      return 'done -_- as you wished'
    }
  }