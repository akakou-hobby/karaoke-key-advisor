import Script from 'next/script'
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { Heading, Container, Stack, Text, Button, Image, Input, FormControl, FormLabel } from '@chakra-ui/react'


// function roundToTwo(num) {
//   return +(Math.round(num + "e+2") + "e-2");
// }

const Home = () => {
  let [songUrl, setSongUrl] = useState("")

  let [record1State, setRecord1State] = useState(0)
  let [record2State, setRecord2State] = useState(0)

  let [avarageDiff, setAverageDiff] = useState(0)

  const stateTable = ["Record", "Stop", "Clear"]

  const hasRecordedDone = function () {
    return record1State == 2 && record2State == 2
  }

  function ResultStack() {
    if (hasRecordedDone())
      return (<Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as='h3' size='lg'>
          結果
        </Heading>
        <Text color={'gray.600'} maxW={'4xl'}>
          キー： {Math.round(avarageDiff)}
        </Text>
      </Stack>)
    else
      return <div></div>
  }

  return (
    <Container maxW={'5xl'}>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.js" type="text/javascript" strategy="beforeInteractive"></Script>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js" type="text/javascript" strategy="beforeInteractive"></Script>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.sound.min.js" type="text/javascript" strategy="beforeInteractive"></Script>
      <Script src="https://unpkg.com/ml5@latest/dist/ml5.min.js" type="text/javascript" strategy="beforeInteractive"></Script>
      <Script src="/script/sketch.js" type="text/javascript" strategy="beforeInteractive"></Script>
      <Script src="/script/songle.js" type="text/javascript" strategy="beforeInteractive"></Script>

      <Head>
        <title>Find Karaoke Key</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}>

        <Heading
          fontWeight={600}
          fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
          lineHeight={'100%'}>
          あなたに最適な {' '} <br />
          <Text as={'span'} color={'orange.400'}>
            カラオケキーを見つける
          </Text>
        </Heading>

        <Text color={'gray.600'} maxW={'4xl'} fontSize='xl'>
          気持ちよく歌えるカラオケのキーが見つからなくて困っていませんか。 <br />
          このサイトなら、たった３ステップで気持ちのよいキーをみつけることができます。<br /> <br />

          ※キーを見つけるには、歌う必要があります。騒音トラブル等には十分気をつけてください。
        </Text>

        <Image src="/Karaoke-bro.png"></Image>
      </Stack>
      <br />

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as='h3' size='lg'>
          step1.音楽の選択
        </Heading>

        <Text color={'gray.600'} maxW={'4xl'}>
          Youtubeのリンクを貼り付けてください。
        </Text>

        <FormControl>
          <FormLabel htmlFor='email'>Youtubeリンク</FormLabel>
          <Input id='email' spacing={{ base: 8, md: 10 }} onInput={(e) => { setSongUrl(e.target.value) }} />
          <br /><br />
          <Button onClick={async () => {
            // userStartAudio()
            await setup()
            player.useMedia(songUrl)
            // location.hash = "step2"
          }}>Enter</Button>
        </FormControl>
      </Stack>

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as='h3' size='lg' name="step2">
          step2.音楽を効く
        </Heading>

        <Text color={'gray.600'} maxW={'4xl'}>
          まず、対象の曲を聞いてください。クリックすると曲のサビが流れます。
        </Text>

        <div id="songle-yt"></div>
        <div id="songle-sw"></div>
      </Stack>

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as='h3' size='lg'>
          step3.原曲キーで歌う
        </Heading>

        <Text color={'gray.600'} maxW={'4xl'}>
          ボタンを押して曲のサビを原曲キーで歌ってください。
        </Text>

        <Button onClick={() => {
          if (record1State == 0) {
            recorder1.start()
            setRecord1State(record1State + 1)
          }
          else if (record1State === 1) {
            recorder1.stop()
            setRecord1State(record1State + 1)
          }
          else if (record1State == 2) {
            // recorder.stop()
            clearVoice(recorder1)
            setRecord1State(0)
          }

          console.log(record1State, record2State)

          if (recorder1.voice.length && recorder2.voice.length)
            setAverageDiff(calcAvarageDiff())
        }}>{stateTable[record1State]}</Button>
        {/* <p id='status'>ローディング中</p> */}
        {/* <p id='result'>No pitch detected</p> */}
      </Stack>

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as='h3' size='lg'>
          step4.好きなキーで歌う
        </Heading>

        <Text color={'gray.600'} maxW={'4xl'}>
          ボタンを押して曲のサビを好きなキーで歌ってください。
        </Text>

        <Button onClick={() => {
          if (record2State == 0) {
            recorder2.start()
            setRecord2State(record2State + 1)
          }
          else if (record2State === 1) {
            recorder2.stop()
            setRecord2State(record2State + 1)
          }
          else if (record2State == 2) {
            // recorder.stop()
            clearVoice(recorder2)
            setRecord2State(0)
          }

          console.log(record1State, record2State)

          if (recorder1.voice.length && recorder2.voice.length)
            setAverageDiff(calcAvarageDiff())
        }}>{stateTable[record2State]}</Button>
      </Stack>
      <ResultStack />

      <a href="https://storyset.com/people">People illustrations by Storyset</a>
    </Container >

  )
}

export default Home
