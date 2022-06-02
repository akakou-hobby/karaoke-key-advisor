// It based ml5 Example
let audioContext
let mic
let pitch

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
}

function setup() {
  noCanvas()
  audioContext = getAudioContext()
  mic = new p5.AudioIn()
  mic.start(startPitch)
}

const startPitch = () => {
  pitch = ml5.pitchDetection('./model/', audioContext, mic.stream, modelLoaded)
}

const modelLoaded = () => {
  select('#status').html('Model Loaded')
  getPitch()
}

const getPitch = () => {
  pitch.getPitch((err, frequency) => {
    if (frequency) {
      const note = PitchNote.from_frequency(frequency)

      select('#result').html(note.to_string())
    } else {
      select('#result').html('No pitch detected')
    }
    getPitch()
  })
}