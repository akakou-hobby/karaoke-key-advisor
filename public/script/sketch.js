// It based ml5 Example
let audioContext

async function setupAudio() {
  audioContext = getAudioContext()
  await userStartAudio()
}


class Metronome {
  sleep = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));

  constructor(bpm = 200) {
    this.interval = (bpm / 60) / 4 * 1000 - 100
    this.isMetronomeContinue = false
    this.osc = new p5.Oscillator('sine')
  }

  async start() {
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
    this.pitch = ml5.pitchDetection('/model/', audioContext, recorder.mic.stream, this.modelLoaded)
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

      if (frequency && midiNum != 69) {
        console.log("pitch controller: ", self)
        self.voice.push(midiNum)

        const note = PitchNote.fromFrequency(frequency)
        console.log("note: ", note)
      } else {
        //
      }
    })
  }

  clear() {
    this.voice = []
  }
}

class RecorderEvent {
  constructor() { }
  onStart() { }
  onPeriod() { }
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
}

class Recorder {
  constructor(event) {
    this.timerId = 0
    this.event = event
  }

  start() {
    const self = this

    this.mic = new p5.AudioIn()
    this.mic.start(() => {
      self.event.onStart(self)
    })

    this.timerId = setInterval(() => {
      self.event.onPeriod(self)
    }, 10)
  }

  stop() {
    this.mic.stop()
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

  const avarageDiffG = avg2 - avg1
  return avarageDiffG
}

