function setup() {
  noLoop()
}


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


class PitchNote {
  static scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  constructor(scale, high) {
    this.scale = scale
    this.high = high
  }

  toString() {
    return `${this.scale}${this.high}`
  }

  static fromFrequency(frequency) {
    const midiNum = freqToMidi(frequency)
    return PitchNote.fromMidi(midiNum)
  }

  static fromMidi(midiNum) {
    const scale = PitchNote.scale[midiNum % 12]
    const high = Math.floor(midiNum / 12) - 1

    return new PitchNote(scale, high)
  }

  static noSound() {
    return new PitchNote('', 0)
  }
}


class PitchCollector {
  constructor() {
    this.voice = []
    this.pitch = null
  }

  init(recorder) {
    const self = this

    self.pitch = ml5.pitchDetection('/model/', recorder.audioContext, recorder.mic.stream, this.modelLoaded)
  }

  modelLoaded() {
    console.log("Loaded")
  }

  collectPitch() {
    if (this.pitch == null)
      return

    const self = this

    this.pitch.getPitch((err, frequency) => {
      const midiNum = freqToMidi(frequency)

      if (!frequency || midiNum == 69) return

      console.log("pitch controller: ", self)
      self.voice.push(midiNum)

      const note = PitchNote.fromFrequency(frequency)
      console.log("note: ", note)
    })
  }

  clear() {
    this.voice = []
  }
}

class RecorderEvent {
  constructor() { }
  onStart(recorder) { }
  onPeriod(recorder) { }
  onStop(recorder) { }
}


// todo: fix name
class EventBinder extends RecorderEvent {
  constructor(pitchCollector) {
    super()
    this.pitchCollector = pitchCollector
  }

  onStart(recorder) {
    this.pitchCollector.init(recorder)
  }

  onPeriod(recorder) {
    this.pitchCollector.collectPitch(recorder)
  }

  onStop(recorder) { }
}

class Recorder {
  constructor(event) {
    this.interval = 10
    this.timerId = 0
    this.event = event
    this.audioContext = null
    this.runnning = false
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


const collector1 = new PitchCollector()
const collector2 = new PitchCollector()

const binder1 = new EventBinder(collector1)
const binder2 = new EventBinder(collector2)


const recorder1 = new Recorder(binder1)
const recorder2 = new Recorder(binder2)

const metronome = new Metronome()

const calcAvarageDiff = () => {
  const sum1 = collector1.voice.reduce((a, x) => a + x)
  const avg1 = sum1 / collector1.voice.length

  const sum2 = collector2.voice.reduce((a, x) => a + x)
  const avg2 = sum2 / collector2.voice.length

  return avg2 - avg1
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === 'hidden') {
    recorder1.stop()
    recorder2.stop()

    metronome.stop()
  }
})
