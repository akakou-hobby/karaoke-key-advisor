// It based ml5 Example
let audioContext
let mic
let pitch
const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

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
      const midiNum = freqToMidi(frequency)
      const currentNote = scale[midiNum % 12]

      select('#result').html(currentNote)
    } else {
      select('#result').html('No pitch detected')
    }
    getPitch()
  })
}