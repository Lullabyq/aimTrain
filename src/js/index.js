class AimGame {
  constructor(box) {
    this.box = box
    this.startBtn = box.querySelector('#start')
    this.screens = box.querySelectorAll('.screen')
    this.board = box.querySelector('#board')
    this.resultScreen = this.box.querySelector('.result')
    this.currentScreenIndex = 0
    this.score = 0
    this.countMiss = 0
    this.placeHint()

    // DEBUGING
    this.mode = 3
    this.initTime = 10
    // this.time = 10
    // this.startGame()
    this.finishGame()

    setTimeout(() => {
      let click = new Event('click', {
        bubbles: true,
      })
      let target = this.box.querySelector('.btn--back')
      target.dispatchEvent(click)
    }, 0)


    window.addEventListener('resize', this.adjustHintToResize.bind(this))
    window.addEventListener('load', this.adjustHintToResize.bind(this))

    box.addEventListener('click', evt => {
      if (evt.target.tagName == 'A') {
        evt.preventDefault()
        this.changeScreen()
      }

      if (evt.target.classList.contains('btn')) {

        if (evt.target.classList.contains('btn--mode')) {
          this.clearActiveBtn('.btn--mode')
          evt.target.classList.add('active')

          this.mode = +evt.target.dataset.mode

          if (this.checkForGameStart()) {
            this.changeScreen()
            this.startGame()
          }
        }

        if (evt.target.classList.contains('btn--time')) {
          this.clearActiveBtn('.btn--time')
          evt.target.classList.add('active')

          this.time = +evt.target.dataset.time
          this.initTime = this.time

          if (this.checkForGameStart()) {
            this.changeScreen()
            this.startGame()
          }
        }

        if (evt.target.classList.contains('btn--back')) {
          setTimeout(() => {
            this.leaderboard.fillLeaderboardTable(this.screens[1])
            this.resetGame()
            this.changeScreen()

            let btnList = this.screens[this.currentScreenIndex]
            .querySelector('.btn--records')
            .classList

            btnList.add('attention')
            setTimeout(() => {
              btnList.remove('attention')
            }, 800)
          }, 300)
        }
      }

      if (evt.target.classList.contains('btn--records')
      || evt.target.classList.contains('mask')) {
        this.switchModalWindow(evt.target)
      }

      if (evt.target.closest('.board')) {
        if (evt.target.classList.contains('clicked')) return

        if (evt.target.classList.contains('circle')) {
          evt.target.classList.add('clicked')
          evt.target.style.backgroundColor = ''

          clearInterval(this.hideId)
          this.score++

          this.initializeCircle()
          this.adjustToMode()
          setTimeout(() => {
            evt.target.remove()
          }, 200)
        }

        if (evt.target.classList.contains('board')) {
          this.countMiss++
        }
      }
    })
  }

  adjustHintToResize() {
    let hints = this.box.querySelectorAll('.btn__hint')

    if (document.documentElement.clientWidth < 775) {
      hints.forEach(hint => {
        hint.classList.add('btn__hint--small')
        hint.style = ''
      })
    } else if (hints[0].classList.contains('btn__hint--small')) {
      hints.forEach(hint => {
        hint.classList.remove('btn__hint--small')
        this.placeHint()
      })
    }
  }

  switchModalWindow(target) {
    let elem = this.box.querySelector(target.dataset.nodeSelector)
    this.mask = this.box.querySelector('.mask')
    this.mask.classList.toggle('mask--disabled')
    elem.hidden = !elem.hidden
  }

  changeScreen(index = this.currentScreenIndex) {
    this.screens[index].classList.add('up')
    this.currentScreenIndex++
  }

  checkForGameStart() {
    return this.box.querySelectorAll('.column__center .active')
    .length == 2
  }

  startGame() {
    let timer = this.box.querySelector('.timer__info')

    this.board.classList.add('wait')
    this.board.innerHTML = '<h2 class="primary">Go!</h2>'
    timer.classList.add('hide')

    setTimeout(() => {
      this.board.classList.remove('wait')
      this.board.innerHTML = ''
      timer.classList.remove('hide')

      this.adjustToMode()
      this.initializeCircle()

      this.timerId = setInterval(this.decreaseTime.bind(this), 1000);
      this.setTime()
    }, 900)
  }

  adjustToMode() {
    switch (this.mode.toString()) {
      case '1': // rusty
        this.MAX__CIRCLE__DIAMETER = 60
        this.MIN__CIRCLE__DIAMETER = 30
        break;
      case '2': // gamer
        this.MAX__CIRCLE__DIAMETER = 30
        this.MIN__CIRCLE__DIAMETER = 18
        this.setAutoHiding(this.mode)
        break;
      case '3': // pro
        this.MAX__CIRCLE__DIAMETER = 20
        this.MIN__CIRCLE__DIAMETER = 14
        this.setAutoHiding(this.mode)
        break;
    }
  }

  finishGame() {
    let gameScreen = this.screens[this.screens.length - 1]
    let resultScore = this.box.querySelector('.board--result')
    let circle = gameScreen.querySelector('.circle')

    if (circle) circle.remove()
    clearInterval(this.timerId)
    clearInterval(this.hideId)

    this.box.querySelector('.timer__info').classList.add('hide')
    setTimeout(() => {
      gameScreen.style.display = 'none'
      this.resultScreen.style.display = 'flex'
      resultScore.innerHTML = `<h2 class="final__score">Score: <span class='primary'>${this.score}!</span></h2>`

      this.processData(this.resultScreen)
    }, 200);
  }

  resetGame() {
    let gameScreen = this.screens[this.screens.length - 1]
    let resultScore = this.box.querySelector('.board--result')

    gameScreen.style.display = 'flex'
    this.resultScreen.style.display = 'none'
    resultScore.innerHTML = ''

    this.box.querySelectorAll('.up').forEach(screen => {
      screen.classList.remove('up')
    })

    this.currentScreenIndex = 0
    this.score = 0
    this.countMiss = 0

    this.colorTime('normal')
    this.clearActiveBtn('.column__center .btn')

    let circle = this.board.querySelector('.circle')
    if (circle) circle.remove()

    clearInterval(this.timerId)
    clearInterval(this.hideId)
  }

  //             OPTION SCREEN
  // =======================
  clearActiveBtn(classSelector) {
    let timesBtn = this.box.querySelectorAll(classSelector)

    timesBtn.forEach(btn => {
      if (btn.classList.contains('active')) {
        btn.classList.remove('active')
      }
    })
  }

  placeHint() {
    let hintArray = this.box.querySelectorAll('.btn__hint')

    hintArray.forEach(hint => {
      let hintElem = hint.previousElementSibling
      let metrix = hintElem.getBoundingClientRect()
      let top = hintElem.offsetTop + metrix.height + 15
      let left = metrix.width / 2 - hint.offsetWidth / 2

      hint.style.left = left + 'px'
      hint.style.top = top + 'px'
    })
  }

  //             GAME SCREEN
  //=============================
  // ---Timer---
  decreaseTime() {
    this.time --
    this.setTime()
    if (this.time == 0) this.finishGame()
  }

  setTime() {
    let time = this.box.querySelector('#time__seconds')
    time.innerHTML = this.time < 10 ? `0${this.time}` : `${this.time}`
    if (this.time <= 5) this.colorTime('warn')
  }

  colorTime(state = 'normal') {
    let timer = this.box.querySelector('.timer__info')
    if (state === 'warn') {
      timer.classList.add('warn')
    } else {
      if (timer.classList.contains('warn')) timer.classList.remove('warn')
      timer.classList.remove('hide')
    }
  }

  // ---Circle---
  initializeCircle() {
    let circleProp = new Circle(this.MIN__CIRCLE__DIAMETER, this.MAX__CIRCLE__DIAMETER, this.board)
    let circle = document.createElement('div')

    circle.className = 'circle'
    circle.style.backgroundColor = circleProp.color
    circle.style.width = `${circleProp.diameter}px`
    circle.style.height = `${circleProp.diameter}px`
    circle.style.left = `${circleProp.position[0]}px`
    circle.style.top = `${circleProp.position[1]}px`

    this.board.append(circle)
  }

  setAutoHiding(mode) {
    let delay = mode == 2 ? 1200 : 1000
    this.hideId = setInterval(this.hideCircle.bind(this), delay)
  }

  hideCircle() {
    this.board.querySelector('.circle').remove()
    this.initializeCircle()
  }

  //                GAMEEND
  //===============================
  processData() {
    let newPerf = new Perfomance(this.score, this.initTime, this.mode, this.countMiss)
    this.leaderboard = new Leaderboard(3, newPerf)

    this.leaderboard.storeResult()
    this.leaderboard.fillLeaderboardTable(this.resultScreen)
  }
}


//             AUXILIARY CLASSES
//==================================
//---Leaderboard---
class Leaderboard {

  constructor(trackedAmount, newPerf) {
    this.trackedAmount = trackedAmount
    this.newPerf = newPerf
    this.mode = this.newPerf.mode
    this.time = this.newPerf.time
  }

  storeResult() {
    this._prevResults = this.getLocalData()
    this.placeNewResult()
  }

  fillLeaderboardTable(screen) {
    this.screen = screen
    this.sidebar = screen.querySelector('.game__settings')
    this.table = screen.querySelector('.leaderboard__table')
    this.rows = screen.querySelectorAll('.leaderboard__perfomance')

    this.insertResult(this.getLocalData())
    this.highlightSettings()
    this.setTableListeners()
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

  setTableListeners() {
    this.screen.addEventListener('pointerover', event => {
      if (!event.target.closest('table')
        || event.relatedTarget.closest('table')
        || event.relatedTarget.closest('.game__settings')) return

      this.sidebar.classList.add('preview')
      setTimeout(() => {
        this.sidebar.classList.remove('preview')
      }, 200)
    })

    this.screen.addEventListener('pointerout', evt => {
      if (!evt.relatedTarget) return
      if (!evt.target.closest('table')) return
      if (evt.relatedTarget.closest('table')
        || evt.relatedTarget.closest('.game__settings')) return

      if (this.sidebar.classList.contains('full')) this.closeSidebar()
    })

    this.sidebar.addEventListener('click', evt => {
      let classes = this.sidebar.classList
      if (!classes.contains('full')) classes.add('full')

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

    this.sidebar.addEventListener('pointerleave', evt => {
      if (evt.relatedTarget.closest('table')
      || !evt.target.classList.contains('full')) return

      this.closeSidebar()
    })
  }

  closeSidebar() {
    this.sidebar.classList.add('hide__sidebar')
    this.sidebar.classList.remove('full')
    setTimeout(() => {
      this.sidebar.classList.remove('hide__sidebar')
    }, 500)
  }

  refreshTable(activeBtn, type) {
    this[type] = +activeBtn.dataset[type]
    this.insertResult(this.getLocalData())
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

// ---Perfomance---
class Perfomance {
  constructor(...prop) {
    if (prop.length != 0) this.createDataProp(...prop)
  }

  getLocalData(key) {
    let perfData = JSON.parse(localStorage.getItem(key))
    if (perfData) {
      this.createDataProp(perfData.score, perfData.initTime, perfData.mode, perfData.countMiss)
    }
  }

  createDataProp(score, initTime, mode, countMiss) {
    let clicks = countMiss + score
    let pace = (score / initTime).toFixed(2).toString()

    if (pace.slice(-2) == '00') {
      this.pace = +pace.slice(0, -2)
    } else if (pace[-1] == '0') {
      this.pace = +pace.slice(0, -1)
    } else {
      this.pace = +pace
    }

    this.score = score
    this.time = initTime
    this.mode = mode
    this.accuracy = clicks === 0 ? 0 : (score / clicks  * 100).toFixed()
  }
}

// --- CIRCLE ---
class Circle {
  constructor(minD, maxD, place) {
    this.circleColors = ['#FFDE40', '#9F3ED5', '#B9F73E']
    this.minDiameter = minD
    this.maxDiameter = maxD
    this.board = place

    this.generateCircleProp()
  }

  generateCircleProp() {
    let colorIndex = this.getRandomNumber(0, this.circleColors.length, true)
    this.diameter = this.getRandomNumber(this.minDiameter, this.maxDiameter)

    let top = this.getRandomNumber(0, this.board.offsetHeight - this.diameter)
    let left = this.getRandomNumber(0, this.board.offsetWidth - this.diameter)

    this.color = this.circleColors[colorIndex]
    this.position = [left, top]
  }

  getRandomNumber(min, max, isRound = false) {
    let number = min + Math.random() * (max - min)
    return isRound ? Math.floor(number) : number
  }
}


let game = document.querySelector('#game')
let aimTrainer = new AimGame(game)