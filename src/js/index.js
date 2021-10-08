import Leaderboard from "./modules/leaderboard.js"
import Perfomance from "./modules/perfomance.js"
import Circle from "./modules/circle.js"

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

            let btn = this.screens[1]
            .querySelector('.btn--records')

            btn.style.display = 'flex'

            btn.classList.add('attention')
            setTimeout(() => {
              btn.classList.remove('attention')
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

    this.clearActiveBtn('.screen__settings .active')
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
    this.clearActiveBtn('.result .btn')

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

let game = document.querySelector('#game')
new AimGame(game)