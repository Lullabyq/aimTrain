class AimGame {
  constructor(box) {
    this.box = box
    this.startBtn = box.querySelector('#start')
    this.screens = box.querySelectorAll('.screen')
    this.board = box.querySelector('#board')
    this.currentScreenIndex = 0
    this.score = 0
    this.countMiss = 0
    this.placeHint()

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
        }

        if (evt.target.classList.contains('btn--time')) {
          this.clearActiveBtn('.btn--time')
          evt.target.classList.add('active')

          this.time = +evt.target.dataset.time
          this.initTime = this.time
        }

        if (this.box.querySelectorAll('.active').length == 2) {
          this.changeScreen(1)
          this.startGame()
        }
      }

      if (evt.target.closest('.board')) {

        if (evt.target.classList.contains('circle')) {
          clearInterval(this.hideId)
          this.score++
          evt.target.remove()
          this.initializeCircle()
          this.adjustToMode()
        }

        if (evt.target.classList.contains('board')) {
          this.countMiss++
        }
      }
    })
  }

  changeScreen(index = this.currentScreenIndex) {
    this.screens[index].classList.add('up')
    this.currentScreenIndex++
  }

  startGame() {
    this.timerId = setInterval(this.decreaseTime.bind(this), 1000);
    this.setTime()
    this.adjustToMode()
    this.initializeCircle()
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
    let result = this.box.querySelector('.result')
    let resultScore = this.box.querySelector('.board--result')

    this.processData()

    clearInterval(this.timerId)
    clearInterval(this.hideId)

    this.box.querySelector('.timer__info').classList.add('hide')
    setTimeout(() => {
      gameScreen.style.display = 'none'
      result.style.display = 'flex'
      resultScore.innerHTML = `<h2 class="final__score">Score: <span class='primary'>${this.score}!</span></h2>`
    }, 300);
  }

  resetGame() {
    let gameScreen = this.screens[this.screens.length - 1]
    let result = this.box.querySelector('.result')
    let resultScore = this.box.querySelector('.board--result')

    gameScreen.style.display = 'flex'
    result.style.display = 'none'
    resultScore.innerHTML = ''

    this.box.querySelectorAll('.up').forEach(screen => {
      screen.classList.remove('up')
    })

    this.currentScreenIndex = 0
    this.score = 0
    this.countMiss = 0
    this.box.scrollTop = 0

    this.colorTime('normal')
    this.clearActiveBtn('.btn')

    let circle = this.board.querySelector('.circle')
    if (circle) circle.remove()

    clearInterval(this.timerId)
    clearInterval(this.hideId)
  }

  // ==================(OPTION SCREEN)=======================
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

  // ====================(GAME SCREEN)=============================
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
    let delay = mode == 2 ? 1500 : 1000
    this.hideId = setInterval(this.hideCircle.bind(this), delay)
  }

  hideCircle() {
    this.board.querySelector('.circle').remove()
    this.initializeCircle()
  }

  // ===================(GAMEEND)=========================
  processData() {
    let newPerf = new Perfomance(this.score, this.initTime, this.mode, this.countMiss)
    let repository = new LeaderBoard(3, newPerf)

    repository.calculateResult()
  }
}

class LeaderBoard {

  constructor(trackedAmount, newPerf) {
    this.trackedAmount = trackedAmount
    this.newPerf = newPerf
    this.perf = new Perfomance()
  }

  calculateResult() {
    this.getLocalData()
    this.placeNewResult()
  }

  getLocalData() {
    this._prevResults = []

    for (let i = 0; i < this.trackedAmount; i++) {
      let achiv = JSON.parse(localStorage.getItem(this.generateKey(i + 1)))
      // let achiv = this.perf.getLocalData(this.generateKey(i + 1))

      if (achiv) this._prevResults.push(achiv)
    }
  }

  placeNewResult() {
    for (let i = 0; i < this.trackedAmount; i++) {
      if (this.checkOldPerfomance(this._prevResults[i])) {
        this._positionIndex = i
        this.changeLeaderBoard()
        break
      }
    }
  }

  checkOldPerfomance(old) {
    if (!old) return true
    return this.newPerf.score === old.score ?
    this.newPerf.accuracy > old.accuracy : this.newPerf.score > old.score
  }

  changeLeaderBoard() {
    localStorage.setItem(this.generateKey(this._positionIndex + 1), JSON.stringify(this.newPerf))
    for (let i = this._positionIndex; i < this.trackedAmount - 1; i++) {
      if (this._prevResults[i]) {
        localStorage.setItem(this.generateKey(i + 2), JSON.stringify(this._prevResults[i]))
      }
    }
  }

  generateKey(p) {
    return `m${this.newPerf.mode}, t${this.newPerf.time}, n${p}`
  }

  clearStorage() {
    localStorage.clear()
    return 'done -_- as you wished'
  }
}

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
    this.score = score
    this.time = initTime
    this.mode = mode
    this.pace = score / initTime
    this.accuracy = (score / (countMiss + score)).toFixed(4) * 100
  }
}

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