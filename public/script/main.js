function setup() {
  noLoop()
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
