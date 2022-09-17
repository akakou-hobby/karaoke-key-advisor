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

  console.log("original: ", avg1)
  console.log("real: ", avg2)

  const diff = avg2 - avg1

  console.log("diff: ", diff)

  let sign = diff >= 0 ? 1 : -1
  const mod = Math.abs(diff) % 14

  console.log("sign: ", sign)
  console.log("mod: ", mod)

  let result

  if (mod > 7) {
    result = 14 - mod
    sign *= -1
  } else {
    result = mod
  }

  result *= sign
  console.log("result: ", result)

  return result
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === 'hidden') {
    recorder1.stop()
    recorder2.stop()

    metronome.stop()
  }
})
