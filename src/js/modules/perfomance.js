export default class {
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