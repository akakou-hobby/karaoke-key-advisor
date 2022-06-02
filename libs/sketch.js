// It based ml5 Example
let audioContext
let mic
let pitch
let recorder


// import "p5"
import * as P5Class from "p5"
window.p5 = P5Class

import * as sound from "p5/lib/addons/p5.sound";

// import 'p5/lib/addons/p5.dom';

function setup() {
  // noCanvas()
  audioContext = getAudioContext()
  mic = new p5.AudioIn()
  mic.start(loadModel)
}


const loadModel = () =>
  pitch = ml5.pitchDetection('/public/model/', audioContext, mic.stream, modelLoaded)


const modelLoaded = () =>
  select('#status').html('Model Loaded')



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
    return PitchNote.from_midi(midiNum)
  }


  static from_midi(midiNum) {
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
    this.isContinued = false
  }

  start() {
    this.getPitch()
    this.timerId = setInterval(this.getPitch.bind(this), 10);
    this.isContinued = true
  }

  stop() {
    this.isContinued = false
    clearInterval(this.timerId)
  }

  getPitch() {
    pitch.getPitch((err, frequency) => {
      const midiNum = freqToMidi(frequency)

      if (frequency) {
        this.voice.push(midiNum)

        const note = PitchNote.from_frequency(frequency)
        select('#result').html(note.to_string())
      } else {
        select('#result').html('No pitch detected')
      }
    })
  }
}

const recorder1 = new Recorder()
const recorder2 = new Recorder()

const run = (recorder) => {
  if (recorder.isContinued)
    recorder.stop()
  else
    recorder.start()
}

const calcAvarageDiff = () => {
  const sum1 = recorder1.voice.reduce((a, x) => a + x)
  const avg1 = sum1 / recorder1.voice.length

  const sum2 = recorder2.voice.reduce((a, x) => a + x)
  const avg2 = sum2 / recorder2.voice.length

  return avg1 - avg2
}

export {
  setup,
  Recorder,
  calcAvarageDiff,
  run
}