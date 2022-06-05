let player;
let bpm = 100;

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
            player.seekToPrevChorusSection()
        });

    player.on("play",
        (ev) => {
            player.seekToPrevChorusSection()
        }, { offset: -2000 });

    player.on('chorusSectionLeave',
        () => {
            player.pause()
        }, { offset: +2000 })

    player.on("barEnter",
        function (ev) {
            bpm = ev.data.beat.bpm
        }
    )

    player.useMedia("https://www.youtube.com/watch?v=6j7VwJ7sM_k")
}
