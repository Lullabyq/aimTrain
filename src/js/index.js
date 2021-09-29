class AimGame {
    constructor(box) {
      this.box = box
      this.startBtn = box.querySelector('#start')
      this.screens = box.querySelectorAll('.screen')
      this.currentScreenIndex = 0
      this.board = box.querySelector('#board')
      this.score = 0
      this.circleColors = ['#FFDE40', '#9F3ED5', '#B9F73E']

			// //DEBUG
			// this.time = 10
			// this.mode = 2
			// this.startGame()

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
					}

					if (this.box.querySelectorAll('.active').length == 2) {
						this.changeScreen()
						this.startGame()
					}
				}

        if (evt.target.classList.contains('circle')) {
					clearInterval(this.hideId)
          this.score++
          evt.target.remove()
          this.createCircle()
					this.adjustToMode()
        }
      })
    }

		clearActiveBtn(classSelector) {
			let timesBtn = this.box.querySelectorAll(classSelector)

			timesBtn.forEach(btn => {
				if (btn.classList.contains('active')) {
					btn.classList.remove('active')
				}
			})
		}

    changeScreen() {
      this.screens[this.currentScreenIndex].classList.add('up')
      this.currentScreenIndex++
    }

    startGame() {
      this.timerId = setInterval(this.decreaseTime.bind(this), 1000);
      this.setTime()
			this.adjustToMode()
      this.createCircle()
    }

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

    finishGame() {
      let gameScreen = this.screens[this.screens.length - 1]
      let result = this.box.querySelector('.result')
      let resultScore = this.box.querySelector('.board--result')

      clearInterval(this.timerId)
			clearInterval(this.hideId)

      this.box.querySelector('.timer__info').classList.add('hide')
      setTimeout(() => {
        gameScreen.style.display = 'none'
        result.style.display = 'flex'
        resultScore.innerHTML = `<h2 class="final__score">Score: <span class='primary'>${this.score}!</span></h2>`
      }, 300);
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

		setAutoHiding(mode) {
			let delay = mode == 2 ? 1500 : 1000
			this.hideId = setInterval(this.hideCircle.bind(this), delay)
		}

		hideCircle() {
			this.board.querySelector('.circle').remove()
			this.createCircle()
		}

    createCircle() {
      let prop = this.generateCircleProp()

      let circle = document.createElement('div')
      circle.className = 'circle'

      circle.style.backgroundColor = prop.color
      circle.style.width = `${prop.diameter}px`
      circle.style.height = `${prop.diameter}px`
      circle.style.left = `${prop.position[0]}px`
      circle.style.top = `${prop.position[1]}px`

      this.board.append(circle)
    }

    generateCircleProp() {
      let circle = {}
      let colorIndex = this.getRandomNumber(0, this.circleColors.length, true)

      circle.diameter = this.getRandomNumber(this.MIN__CIRCLE__DIAMETER, this.MAX__CIRCLE__DIAMETER)

      let top = this.getRandomNumber(0, this.board.offsetHeight - circle.diameter)
      let left = this.getRandomNumber(0, this.board.offsetWidth - circle.diameter)

      circle.color = this.circleColors[colorIndex]
      circle.position = [left, top]

      return circle
    }

    getRandomNumber(min, max, isRound = false) {
      let number = min + Math.random() * (max - min)
      return isRound ? Math.floor(number) : number
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
      this.box.scrollTop = 0

      this.colorTime('normal')
      this.clearActiveBtn('.btn')

      let circle = this.board.querySelector('.circle')
      if (circle) circle.remove()

      clearInterval(this.timerId)
			clearInterval(this.hideId)
		}
  }

  let game = document.querySelector('#game')
  let aimTrainer = new AimGame(game)