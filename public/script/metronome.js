class Metronome {
  sleep = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));

  constructor(bpm = 200) {
    this.interval = (bpm / 60) / 4 * 1000 - 100
    this.isMetronomeContinue = false
    this.osc = new p5.Oscillator('sine')
  }

  async start() {
    if (this.isMetronomeContinue) return

    this.isMetronomeContinue = true

    this.continue()
  }

  async continue() {
    while (this.isMetronomeContinue) {
      this.osc.start()
      await this.sleep(100)
      this.osc.stop()
      await this.sleep(this.interval)
    }
  }

  stop = () => this.isMetronomeContinue = false
}
