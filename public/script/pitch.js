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
