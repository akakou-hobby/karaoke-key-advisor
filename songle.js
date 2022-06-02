window.onSongleAPIReady = (Songle) => {
    const player =
        new Songle.Player({
            mediaElement: "#songle-yt"
        })

    player.addPlugin(new Songle.Plugin.Chorus());
    player.addPlugin(new Songle.Plugin.SongleWidget({
        element: "#songle-sw"
    }))


    player.on("play",
        () => {
            player.seekToNextChorusSection()
        }, { offset: -2000 });

    player.on('chorusSectionLeave',
        () => {
            player.pause()
        }, { offset: +2000 })

    player.useMedia("https://www.youtube.com/watch?v=6j7VwJ7sM_k")
}
