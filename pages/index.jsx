import Script from 'next/script'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Heading, Container, Stack, Text, Button, Image, Input, FormControl, FormLabel, Box, } from '@chakra-ui/react'
import axios from "axios";

const STATUS_READY = 0
const STATUS_START = 1
const STATUS_RECORDING = 2
const STATUS_STOPPED = 3

const STATE_TABLE = ["Record", "Stop", "Stop", "Clear"]

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

const songIdToUrl = (id) => `https://youtu.be/${id}`;

const RecordingStack = ({ number, title }) => {
  const candidates = [
    () => <Text>録音されていません</Text>,
    () => <Text>録音中です。歌い始めてください。</Text>,
    () => <Text>録音中</Text>,
    () => <Text>録音されました</Text>,
  ]

  let [recordState, setRecordState] = useState(0)
  let [recorder, setRecorder] = useState({})
  let [collector, setCollector] = useState({})

  useEffect(() => {
    if (number == 1) {
      recorder = recorder1
      collector = collector1
    } else if (number == 2) {
      recorder = recorder2
      collector = collector2
    }

    setRecorder(recorder)
    setCollector(collector)

    recorder.events.push({
      onPeriod: () => {
        if (collector.voice.length != 0 && recordState == STATUS_START) {
          setRecordState(STATUS_RECORDING)
        }
      },
      onStart: () => { },
      onStop: () => { }
    })
  })

  const Message = candidates[recordState]

  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
      <Heading as='h3' size='lg'>
        {title}
      </Heading>

      <Text color={'gray.600'} maxW={'4xl'}>
        ボタンを押した後、曲のサビをテンポに合わせて原曲キーで歌ってください。
      </Text>

      <Button onClick={() => {
        if (recordState == STATUS_READY) {
          metronome.start()
          recorder.start()
        }
        else if (recordState === STATUS_START) {
          recordState++
        }
        else if (recordState == STATUS_RECORDING) {
          metronome.stop()
          recorder.stop()
        }
        else if (recordState == STATUS_STOPPED) {
          collector.clear()
        }

        setRecordState((recordState + 1) % 4)

      }}>{STATE_TABLE[recordState]}</Button>

      <Message> </Message>
    </Stack>
  )
}

const SongSearchResult = ({ songs, onSelect }) => {
  const [selectedSongId, setSelectedSongId] = useState("");

  if (songs === null) {
    return null;
  }

  const heading = (
    <Heading as={"h4"} size="md" marginTop="4">
      検索結果
    </Heading>
  );
  let content;

  if (songs.length < 1) {
    content = (
      <>
        <Text color="gray.600" maxW={"4xl"}>
          検索結果が見つかりませんでした。
        </Text >
        <Text color="gray.600" maxW={"4xl"}>
          再度検索するか、{" "}
          <a
            href="https://www.youtube.com/results"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline" }}
          >
            YouTube
          </a>{" "}
          から動画の URL を直接貼り付けることもできます。
        </Text>
      </>
    );
  } else {
    content = songs.map(({ id, title, thumbnails }) => {
      const borderGray = selectedSongId === id ? "gray.400" : "gray.200";

      return (
        <Box
          key={id}
          bg="gray.50"
          border="2px"
          borderColor={borderGray}
          p="1"
          style={{ margin: "1em" }}
          borderRadius="lg"
        >
          <Button
            display="block"
            is="FullWidth"
            style={{ width: "100%" }}
            onClick={() => {
              setSelectedSongId(id);
              onSelect(id);
            }}
            p="1"
          >
            <Heading
              as="h5"
              size="sm"
              margin="3"
              justifySelf="left"
              width="fit-content"
            >
              {title}
            </Heading>
            <Image
              src={thumbnails.medium.url}
              alt=""
              style={{
                maxWidth: "calc(100% - 1rem)",
                maxHeight: "auto",
                objectFit: "contain",
                margin: "0.5rem",
              }}
            />
          </Button>
        </Box>
      );
    });
  }

  return (
    <Stack>
      {heading}
      {content}
    </Stack>
  );
};


const Home = () => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchedSongs, setSearchedSongs] = useState(null);

  let [avarageDiff, setAverageDiff] = useState(0)
  let [hasFinished, setHasFinished] = useState(false)
  let [songUrl, setSongUrl] = useState("")

  const setPlayerSong = (url) => {
    player.useMedia(url);
  };

  useEffect(() => {
    setInterval(function () {
      const isRecorder1Finished = !recorder1.running && collector1.voice.length
      const isRecorder2Finished = !recorder2.running && collector2.voice.length

      if (isRecorder1Finished && isRecorder2Finished) {
        setAverageDiff(calcAvarageDiff())
        setHasFinished(isRecorder1Finished && isRecorder2Finished)
      }

    }, 500)
  })

  const searchResponseToSongs = ({ items }) => {
    // see search.ts for response type definition
    return items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnails: item.snippet.thumbnails,
    }));
  };

  function ResultStack() {
    if (hasFinished)
      return (
        <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
          <Heading as="h3" size="lg">
            結果
          </Heading>
          <Text color={"gray.600"} maxW={"4xl"}>
            キー： {Math.round(avarageDiff)}（{roundToTwo(avarageDiff)}）
          </Text>
        </Stack>
      );
    else return <div></div>;
  }

  return (
    <Container maxW={"5xl"}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.sound.min.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="https://unpkg.com/ml5@latest/dist/ml5.min.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="/script/metronome.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="/script/recorder.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="/script/pitch.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="/script/main.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="/script/songle.js"
        type="text/javascript"
        strategy="beforeInteractive"
      ></Script>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L4HPEME100"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-L4HPEME100');
        `}
      </Script>

      <Head>
        <title>Find Karaoke Key</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack
        textAlign={"center"}
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
      >
        <Heading
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
          lineHeight={"100%"}
        >
          あなたに最適な <br />
          <Text as={"span"} color={"orange.400"}>
            カラオケキーを見つける
          </Text>
        </Heading>

        <Text color={"gray.600"} maxW={"4xl"} fontSize="xl">
          気持ちよく歌えるカラオケのキーが見つからなくて困っていませんか。{" "}
          <br />
          このサイトなら、たった4ステップで気持ちのよいキーをみつけることができます。
        </Text>

        <Image src="/Karaoke-bro.png"></Image>
      </Stack>
      <br />

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as="h3" size="lg">
          step1.音楽の選択
        </Heading>

        <Heading as="h4" size="g">
          選択肢a. 検索を使う方法
        </Heading>

        <FormControl>
          <FormLabel htmlFor="q">楽曲タイトルで YouTube の動画を検索し、動画を一つ選択してください。</FormLabel>
          <Input
            id="q"
            spacing={{ base: 8, md: 10 }}
            onInput={(e) => {
              setSearchTitle(e.target.value);
            }}
            placeholder="Lemon"
          />
          <br />
          <br />
          <Button
            onClick={async () => {
              const { data } = await axios.get("/api/youtube/search/", {
                params: { q: searchTitle },
              });
              const songs = searchResponseToSongs(data);
              setSearchedSongs(songs);
              setPlayerSong(songUrl);
              console.log({ songs });
            }}
          >
            Search
          </Button>
          &nbsp;&nbsp;
        </FormControl>

        <SongSearchResult
          songs={searchedSongs}
          onSelect={(songId) => {
            const url = songIdToUrl(songId);
            setSongUrl(url);
            setPlayerSong(url);
          }}
        />


        <br />
        <Heading as="h4" size="g">
          選択肢b. URLを使う方法
        </Heading>

        <FormControl>
          <FormLabel htmlFor="youtubeURL">
            <a
              href="https://www.youtube.com/results"
              target="_blank"
              rel="noreferrer"
            >
              Youtube
            </a>
            の動画リンクからも、楽曲タイトルの設定ができます。
          </FormLabel>
          <Input
            id="youtubeURL"
            value={songUrl}
            spacing={{ base: 8, md: 10 }}
            onInput={(e) => {
              setSongUrl(e.target.value);
            }}
            placeholder="https://www.youtube.com/watch?v=SX_ViT4Ra7k"
          />
          <br />
          <br />
          <Button
            onClick={async () => {
              setPlayerSong(songUrl);
            }}
          >
            Enter
          </Button>
          &nbsp;&nbsp;
        </FormControl>
      </Stack>

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as="h3" size="lg" name="step2">
          step2.音楽を聞く
        </Heading>

        <Text color={"gray.600"} maxW={"4xl"}>
          まず、対象の曲を聞いてください。クリックすると曲のサビが流れます。
        </Text>

        <div id="songle-yt"></div>
        <div id="songle-sw"></div>
      </Stack>

      <RecordingStack number="1" title="step3.原曲キーで歌う" />
      <RecordingStack number="2" title="step4.好きなキーで歌う" />

      <ResultStack />
      <a href="https://storyset.com/people">People illustrations by Storyset</a>
    </Container>
  );
};

export default Home;
