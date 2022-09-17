import Script from "next/script";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Heading,
  Container,
  Stack,
  Text,
  Button,
  Image,
  Input,
  FormControl,
  FormLabel,
  Link,
  Center,
  Box,
} from "@chakra-ui/react";
import axios from "axios";

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

const songIdToUrl = (id) => `https://youtu.be/${id}`;

const RecordingIndicator = ({ isRecording, hasStarted }) => {
  if (isRecording) {
    return (
      <Center h="3em" bg="green.500">
        Recording
      </Center>
    );
  } else if (hasStarted) {
    return (
      <Center h="3em" bg="red.400">
        歌い始めると録音を開始します……
      </Center>
    );
  } else {
    return (
      <Center h="3em" bg="red.400">
        Not Recording
      </Center>
    );
  }
};

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
        </Text>
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
              margin="2"
              display="block"
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
  let [songUrl, setSongUrl] = useState("");

  let [record1State, setRecord1State] = useState(0);
  let [record2State, setRecord2State] = useState(0);

  let [avarageDiff, setAverageDiff] = useState(0);

  const [voiceLength1, setVoiceLength1] = useState(0);
  const [voiceLength2, setVoiceLength2] = useState(0);
  const [isRecording1, setIsRecording1] = useState(false);
  const [isRecording2, setIsRecording2] = useState(false);

  const stateTable = ["Record", "Stop", "Clear"];

  useEffect(() => {
    recorder1.onPeriodHook = () => {
      const len = recorder1.event.pitchCollector.voice.length;
      const voiceAppended = voiceLength1 !== len;

      if (voiceAppended) {
        setVoiceLength1(len);
        setIsRecording1(true);
      }
    };

    setIsRecording1(isRecording1 && record1State === 1);
  }, [voiceLength1, setVoiceLength1, record1State, isRecording1]);

  useEffect(() => {
    recorder2.onPeriodHook = () => {
      const len = recorder2.event.pitchCollector.voice.length;
      const voiceAppended = voiceLength2 !== len;

      if (voiceAppended) {
        setVoiceLength2(len);
        setIsRecording2(true);
      }
    };

    setIsRecording2(isRecording2 && record2State === 1);
  }, [voiceLength2, setVoiceLength2, record2State, isRecording2]);

  const hasRecordedDone = function () {
    return record1State == 2 && record2State == 2;
  };

  const searchResponseToSongs = ({ items }) => {
    // see search.ts for response type definition
    return items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnails: item.snippet.thumbnails,
    }));
  };

  function ResultStack() {
    if (hasRecordedDone())
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

        <FormControl>
          <FormLabel htmlFor="q">楽曲タイトルで YouTube を検索</FormLabel>
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
            console.log({ url, songId });
          }}
        />

        <FormControl>
          <FormLabel htmlFor="youtubeURL">
            <a
              href="https://www.youtube.com/results"
              target="_blank"
              rel="noreferrer"
            >
              Youtube
            </a>
            の動画リンク
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
              player.useMedia(songUrl);
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

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as="h3" size="lg">
          step3.原曲キーで歌う
        </Heading>

        <Text color={"gray.600"} maxW={"4xl"}>
          ボタンを押した後、曲のサビをテンポに合わせて原曲キーで歌ってください。
        </Text>

        <Button
          onClick={() => {
            if (record1State == 0) {
              metronome.start();
              recorder1.start();
              setRecord1State(record1State + 1);
            } else if (record1State === 1) {
              metronome.stop();
              recorder1.stop();
              setRecord1State(record1State + 1);
            } else if (record1State == 2) {
              // recorder.stop()
              collector1.clear();
              setRecord1State(0);
              setVoiceLength1(0);
            }

            console.log(record1State, record2State);

            if (collector1.voice.length && collector2.voice.length)
              setAverageDiff(calcAvarageDiff());
          }}
        >
          {stateTable[record1State]}
        </Button>
        {/* <p id='status'>ローディング中</p> */}
        {/* <p id='result'>No pitch detected</p> */}
        <RecordingIndicator
          isRecording={isRecording1}
          hasStarted={record1State === 1}
        />
      </Stack>

      <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
        <Heading as="h3" size="lg">
          step4.好きなキーで歌う
        </Heading>

        <Text color={"gray.600"} maxW={"4xl"}>
          ボタンを押した後、曲のサビをテンポに合わせて好きなキーで歌ってください。
        </Text>

        <Button
          onClick={() => {
            if (record2State == 0) {
              metronome.start();
              recorder2.start();

              setRecord2State(record2State + 1);
            } else if (record2State === 1) {
              metronome.stop();
              recorder2.stop();
              setRecord2State(record2State + 1);
            } else if (record2State == 2) {
              // recorder.stop()
              collector2.clear();
              setRecord2State(0);
              setVoiceLength2(0);
            }

            console.log(record1State, record2State);

            if (collector1.voice.length && collector2.voice.length)
              setAverageDiff(calcAvarageDiff());
          }}
        >
          {stateTable[record2State]}
        </Button>
        <RecordingIndicator
          isRecording={isRecording2}
          hasStarted={record2State === 1}
        />
      </Stack>
      <ResultStack />

      <a href="https://storyset.com/people">People illustrations by Storyset</a>
    </Container>
  );
};

export default Home;
