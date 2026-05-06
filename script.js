let playlists=[]
let songs=[]
let cur_song=-1
let audio=new Audio()
let loop=false
let isDragging=false

// Initialize DOM elements
let playbutton, next, pre, ball, timeBar;
function initControls(){
    playbutton = document.getElementById("playbutton")
    next = document.getElementById("next")
    pre = document.getElementById("pre")
    ball = document.getElementById("ball")
    timeBar = document.getElementById("timeBar")
}

function setloop(){
    loop=!loop
    console.log(loop)
    let loopBtn = document.getElementById("loopbtn")
    if(loopBtn) {
        loopBtn.classList.toggle("active")
    }
}
async function fetchJSON(url){
    let response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)
    return response.json()
}
async function getplaylists(){
    try {
        let config = await fetchJSON("./config.json")
        
        for (let playlistInfo of config.playlists) {
            let playlistData = await fetchJSON(`./${playlistInfo.path}/info.json`)
            
            let div = document.createElement("div")
            div.classList.add("card", "point")
            let thumbnailPath = `./${playlistInfo.path}/${playlistData.image}`
            div.innerHTML = `<button class="play">
                                <img src="assets/play.svg">
                            </button>
                            <img src="${thumbnailPath}">
                            <h3>${playlistData.title}</h3>`
            div.addEventListener("click", async () => {
                // Pause current playback and reset state
                audio.pause()
                playbutton.src="assets/playbarplay.svg"
                cur_song = -1
                
                // Load new playlist
                await getsongs(playlistInfo.path)
                
                // Start playing first song
                if(songs.length > 0) {
                    cur_song = 0
                    let firstSong = document.querySelector(".song")
                    if(firstSong) {
                        firstSong.classList.add("currentsong")
                    }
                    play_song()
                }
            })
            document.querySelector(".cardcont").appendChild(div)
            playlists.push(playlistInfo.path)
        }
    } catch(error) {
        console.error("Error loading playlists:", error)
    }
}
async function getsongs(playlistPath){
    songs=[]
    let cont=document.querySelector(".create");
    cont.innerHTML="";
    
    try {
        let playlistData = await fetchJSON(`./${playlistPath}/info.json`)
        
        for (let i = 0; i < playlistData.songs.length; i++) {
            const songFile = playlistData.songs[i];
            let songPath = `./${playlistPath}/${songFile}`
            songs.push(songPath)
            let songname = songFile.slice(0, songFile.length - 4)
            let div = document.createElement("div")
            div.classList.add("song", "flex", "align", "point")
            div.innerHTML = `<p>${songname}</p>
                            <img src="assets/playing.svg">
                            <span>${i}</span>`
            div.addEventListener("click", () => {
                if(cur_song != -1){
                    document.querySelectorAll(".song")[cur_song].classList.remove("currentsong")
                }
                cur_song = parseInt(div.querySelector("span").innerHTML)
                div.classList.add("currentsong")
                play_song()
            })
            cont.appendChild(div)
        }
    } catch(error) {
        console.error("Error loading songs:", error)
    }
}
function play_song(){
    playbutton.querySelector("img").src="assets/pause.svg"
    document.querySelector(".playbar").style.opacity=1;
    let songname=songs[cur_song].split('/').pop()
    document.querySelector(".songname").innerHTML=songname.slice(0,songname.length-4)
    audio.pause()
    audio.src=songs[cur_song]
    audio.play()
}

function attachEventListeners(){
    next.addEventListener("click",()=>{
        if(songs.length === 0 || cur_song === -1) return
        let songElements = document.querySelectorAll(".song")
        if(songElements[cur_song]) {
            songElements[cur_song].classList.remove("currentsong")
        }
        cur_song=(cur_song+1)%songs.length
        if(songElements[cur_song]) {
            songElements[cur_song].click()
        }
    })
    pre.addEventListener("click",()=>{
        if(songs.length === 0 || cur_song === -1) return
        let songElements = document.querySelectorAll(".song")
        if(songElements[cur_song]) {
            songElements[cur_song].classList.remove("currentsong")
        }
        cur_song=(cur_song-1+songs.length)%songs.length
        if(songElements[cur_song]) {
            songElements[cur_song].click()
        }
    })

    playbutton.addEventListener("click",()=>{
        if(audio.paused){
            playbutton.querySelector("img").src="assets/pause.svg"
            audio.play()
        }
        else{
            playbutton.querySelector("img").src="assets/playbarplay.svg"
            audio.pause()
        }
    })

    audio.addEventListener("timeupdate",()=>{
        if(!isDragging) {
            const progress = (audio.currentTime / audio.duration) * 100
            document.querySelector(".progress-fill").style.width = progress + "%"
            ball.style.left = progress + "%"
        }
        document.querySelector(".songtime").innerHTML=formatTime(audio.currentTime)+"/"+formatTime(audio.duration)
    })
    audio.addEventListener("ended",()=>{
        if(songs.length === 0 || cur_song === -1) return
        if(loop || cur_song!=songs.length-1){  
            next.click()
        }
    })
    timeBar.addEventListener("click", (e) => {
        if(isDragging)return
        const rect = timeBar.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const per = (clickX / rect.width) * 100
        ball.style.left = per + "%"
        document.querySelector(".progress-fill").style.width = per + "%"
        audio.currentTime = audio.duration * (per / 100)
    })
    ball.addEventListener("mousedown", (e) => {
      e.preventDefault()
      isDragging = true
      const rect = timeBar.getBoundingClientRect()
      function onMove(ev) {
        const moveX = Math.min(Math.max(ev.clientX - rect.left, 0), rect.width)
        const per = (moveX / rect.width) * 100
        ball.style.left = per + "%"
        document.querySelector(".progress-fill").style.width = per + "%"
      }
      function onUp(ev) {
        const releaseX = Math.min(Math.max(ev.clientX - rect.left, 0), rect.width)
        const per = (releaseX / rect.width) * 100
        audio.currentTime = audio.duration * (per / 100)
        isDragging = false
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    })
}
document.querySelector(".ham").addEventListener("click",()=>{
    document.querySelector(".left").style.left="7px"
})
cross.addEventListener("click",()=>{
    document.querySelector(".left").style.left="-200%"
})

// Initialize controls and load playlists
initControls()
attachEventListeners()
getplaylists()