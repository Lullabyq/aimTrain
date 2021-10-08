export default class {
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