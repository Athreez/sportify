let playlists=[]
let songs=[]
let cur_song=-1
let audio=new Audio()
let loop=false
let isDragging=false

function setloop(){
    loop=!loop
    console.log(loop)
    document.querySelector(".plus").classList.toggle("grey")
}
async function fetchdata(url){
    let a=await fetch(url)
    return a.text()
}
async function getthumbnail(playlist) {
    let r=await fetchdata(playlist)
    let div=document.createElement("div")
    div.innerHTML=r;
    let x=div.querySelector(".icon-image")
    return x.href
}
async function getplaylists(){
    let r= await fetchdata("/webdev/clones/sportify/playlists")
    let div=document.createElement("div")
    div.innerHTML=r;
    let x=div.querySelectorAll(".icon-directory")
    for (let i = 1; i < x.length; i++) {
        const el = x[i];
        playlists.push(el.href)
        let p_name=el.href.split('/').pop()
        let div=document.createElement("div")
        div.classList.add("card","point")
        let thumbnail=await getthumbnail(el.href)
        div.innerHTML=` <button class="play">
                            <img src="assets/play.svg">
                        </button>
                        <img src="${thumbnail}">
                        <h3>${p_name}</h3>`
        div.addEventListener("click",async ()=>{
            await getsongs(el.href)
            cur_song=0;
            document.querySelector(".song").classList.add("currentsong")
            play_song()
        })
        document.querySelector(".cardcont").appendChild(div)
        
    }
}
async function getsongs(playlist){
    songs=[]
    let cont=document.querySelector(".create");
    cont.innerHTML="";
    let r=await fetchdata(playlist)
    let div=document.createElement("div")
    div.innerHTML=r;
    let x=div.querySelectorAll(".icon-mp3")
    
    for (let i = 0; i < x.length; i++) {
        const el = x[i];
        songs.push(el.href)
        let s_name=el.href.split('/').pop()
        let songname=s_name.slice(0,s_name.length-4)
        let div=document.createElement("div")
        div.classList.add("song","flex","align","point")
        div.innerHTML=` <p>${songname}</p>
                        <img src="assets/playing.svg">
                        <span>${i}</span>`
        div.addEventListener("click",()=>{
            if(cur_song!=-1){
                document.querySelectorAll(".song")[cur_song].classList.remove("currentsong")
            }
            cur_song=parseInt(div.querySelector("span").innerHTML)
            div.classList.add("currentsong")
            play_song()
        })
        cont.appendChild(div)
    }
}
function play_song(){
    playbutton.src="assets/pause.svg"
    document.querySelector(".playbar").style.opacity=1;
    let songname=songs[cur_song].split('/').pop()
    document.querySelector(".songname").innerHTML=songname.slice(0,songname.length-4)
    audio.pause()
    audio.src=songs[cur_song]
    audio.play()
}
next.addEventListener("click",()=>{
    document.querySelectorAll(".song")[cur_song].classList.remove("currentsong")
    cur_song=(cur_song+1)%songs.length
    document.querySelectorAll(".song")[cur_song].click()
})
pre.addEventListener("click",()=>{
    document.querySelectorAll(".song")[cur_song].classList.remove("currentsong")
    cur_song=(cur_song-1+songs.length)%songs.length
    document.querySelectorAll(".song")[cur_song].click()
})

playbutton.addEventListener("click",()=>{
    if(audio.paused){
        playbutton.src="assets/pause.svg"
        audio.play()
    }
    else{
        playbutton.src="assets/playbarplay.svg"
        audio.pause()
    }

})
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00"
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

audio.addEventListener("timeupdate",()=>{
    if(!isDragging)ball.style.left=audio.currentTime/audio.duration*100 +"%"
    document.querySelector(".songtime").innerHTML=formatTime(audio.currentTime)+"/"+formatTime(audio.duration)
})
audio.addEventListener("ended",()=>{
    if(loop || cur_song!=songs.length-1){  
        next.click()
    }
})
timeBar.addEventListener("click", (e) => {
    if(isDragging)return
    const rect = timeBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const per = clickX / rect.width
    ball.style.left = (per * 100) + "%"
    audio.currentTime = audio.duration * per
})
ball.addEventListener("mousedown", (e) => {
  e.preventDefault()
  isDragging = true
  ball.style.cursor = "grabbing"
  const rect = timeBar.getBoundingClientRect()
  function onMove(ev) {
    const moveX = Math.min(Math.max(ev.clientX - rect.left, 0), rect.width)
    const per = moveX / rect.width
    ball.style.left = (per * 100) + "%"
  }
  function onUp(ev) {
    const releaseX = Math.min(Math.max(ev.clientX - rect.left, 0), rect.width)
    const per = releaseX / rect.width
    audio.currentTime = audio.duration * per
    isDragging = false
    ball.style.cursor = "grab"
    window.removeEventListener("mousemove", onMove)
    window.removeEventListener("mouseup", onUp)
  }
  window.addEventListener("mousemove", onMove)
  window.addEventListener("mouseup", onUp)
})
document.querySelector(".ham").addEventListener("click",()=>{
    document.querySelector(".left").style.left="7px"
})
cross.addEventListener("click",()=>{
    document.querySelector(".left").style.left="-200%"
})
getplaylists()