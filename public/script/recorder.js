class RecorderEvent {
  constructor() { }
  onStart(recorder) { }
  onPeriod(recorder) { }
  onStop(recorder) { }
}


class Recorder {
  constructor(event) {
    this.interval = 10
    this.timerId = 0
    this.event = event
    this.audioContext = null
    this.runnning = false
    this.onPeriodHook = () => {}
  }

  async start() {
    if (this.runnning) return

    const self = this

    this.audioContext = new AudioContext()

    await userStartAudio()

    this.mic = new p5.AudioIn()

    this.mic.start(() => {
      self.event.onStart(self)
    })

    this.timerId = setInterval(() => {
      self.event.onPeriod(self)
      self.onPeriodHook()
    }, this.interval)


    this.runnning = true
  }

  stop() {
    if (!this.runnning) return

    this.runnning = false
    this.mic.stop()
    this.audioContext.close()

    this.event.onStop(this)

    clearInterval(this.timerId)
  }
}


