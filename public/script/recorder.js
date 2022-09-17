class RecorderEvent {
  constructor() { }
  onStart(recorder) { }
  onPeriod(recorder) { }
  onStop(recorder) { }
}


class Recorder {
  constructor(events) {
    this.interval = 10
    this.timerId = 0
    this.events = events
    this.audioContext = null
    this.running = false
  }

  async start() {
    if (this.running) return

    const self = this

    this.audioContext = new AudioContext()

    await userStartAudio()

    this.mic = new p5.AudioIn()

    this.mic.start(() => {
      for (const event of self.events) {
        event.onStart(self)
      }
    })

    this.timerId = setInterval(() => {
      for (const event of self.events) {
        event.onPeriod(self)
      }

    }, this.interval)


    this.running = true
  }

  stop() {
    if (!this.running) return

    this.running = false
    this.mic.stop()
    this.audioContext.close()

    for (const event of this.events) {
      event.onStop(this)
    }

    clearInterval(this.timerId)
  }
}


