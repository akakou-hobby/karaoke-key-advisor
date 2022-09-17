let player;
let bpm = 100;
let hasFirst = true

window.onSongleAPIReady = (Songle) => {
    player =
        new Songle.Player({
            mediaElement: "#songle-yt"
        })

    player.addPlugin(new Songle.Plugin.Chorus());
    player.addPlugin(new Songle.Plugin.SongleWidget({
        element: "#songle-sw"
    }))
    player.addPlugin(new Songle.Plugin.Beat());

    player.on("ready",
        function (ev) {
            console.log(ev)
            player.pause()
            hasFirst = true
        });

    player.on("play",
        (ev) => {
            if (hasFirst) {
                player.seekToPrevChorusSection()
                hasFirst = false
            }
            player.seekToPrevChorusSection()
        }, { offset: -2000 });

    player.on('chorusSectionLeave',
        () => {
            player.pause()
        }, { offset: +2000 })

    player.on("barEnter",
        function (ev) {
            metronome.setIntervalTime(ev.data.beat.bpm)
        }
    )

    player.useMedia("https://www.youtube.com/watch?v=6j7VwJ7sM_k")
}
