// It based ml5 Example
let audioContext
let mic
let pitch
let recorder


function setup() {
  noCanvas()
  audioContext = getAudioContext()
  mic = new p5.AudioIn()
  mic.start(loadModel)
}


const loadModel = () =>
  pitch = ml5.pitchDetection('./model/', audioContext, mic.stream, modelLoaded)


const modelLoaded = () => {
  select('#status').html('Model Loaded')
  recorder = new Recorder()
  recorder.start()
}


class PitchNote {
  static scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  constructor(scale, high) {
    this.scale = scale
    this.high = high
  }

  to_string() {
    return `${this.scale}${this.high}`
  }

  static from_frequency(frequency) {
    const midiNum = freqToMidi(frequency)
    const scale = PitchNote.scale[midiNum % 12]
    const high = Math.floor(midiNum / 12) - 1

    return new PitchNote(scale, high)
  }

  static no_sound() {
    return new PitchNote('', 0)
  }
}


class Recorder {
  constructor() {
    this.voice = []
    this.timerId = 0
  }

  start() {
    this.getPitch()
    this.timerId = setInterval(this.getPitch.bind(this), 10);

  }

  stop() {
    this.shouldContinue = false
    clearInterval(this.timerId)
  }

  getPitch() {
    pitch.getPitch((err, frequency) => {
      if (frequency) {
        const note = PitchNote.from_frequency(frequency)
        this.voice.push(note)

        select('#result').html(note.to_string())
      } else {
        this.voice.push(PitchNote.no_sound())
        select('#result').html('No pitch detected')
      }
    })
  }
}
