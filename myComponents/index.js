import "./libs/webaudio-controls.js"

const getBaseURL = () => {
  return new URL(".", import.meta.url)
}
var basePath = getBaseURL()
var toggle = false
var loop = false
var mute = false


const template = document.createElement("template")
template.innerHTML = /*html*/ `
<style>
  .container{
    width: 50%;
    margin-right: auto;
    margin-left: auto;
    text-align:center;
  }
  ul{
    text-align: left;
    margin-left: 30%;
    list-style-type: none;
  }
  canvas {
    border: 1px solid black;
  }
  button {
    border: none;
    background-color: transparent;
  }
  .svgButtons {
    height: 3em;
  }
</style>

<div class="container">
  <h1>Current Song : <span id="songTitle"> Muse - Uprising </span></h1>
  <canvas id="myCanvas" width="400"></canvas>
  <audio id="myPlayer" crossorigin="anonymous"></audio>
  <br />
  <webaudio-knob
    id="volumeKnob"
    src="./myComponents/assets/imgs/LittlePhatty.png"
    value="10"
    min="0"
    max="20"
    step="0.01"
    diameter="32"
    tooltip="Volume: %d"
  >
  </webaudio-knob>
  <button id="mute">
    <img
      id="buttonMute"
      class="svgButtons"
      src="./myComponents/assets/imgs/buttons/volMute.svg"
    />
  </button>
  <br />
  Progression :
  <span id="current-time">0:00</span
  ><input id="progress" type="range" value="0" /><span id="total-time"
    >0:00</span
  >
  <br />
  <button id="recule10">
    <img
      class="svgButtons"
      src="./myComponents/assets/imgs/buttons/playTenAgo.svg"
    />
  </button>
  <button id="play">
    <img
      id="buttonPlay"
      class="svgButtons"
      src="./myComponents/assets/imgs/buttons/playPlay.svg"
    />
  </button>
  <button id="avance10">
    <img
      class="svgButtons"
      src="./myComponents/assets/imgs/buttons/playTenNext.svg"
    />
  </button>
  <button id="restart">
    <img
      class="svgButtons"
      src="./myComponents/assets/imgs/buttons/playRestart.svg"
    />
  </button>
  <button id="loopOne">
    <img
      id="buttonLoopOne"
      class="svgButtons"
      src="./myComponents/assets/imgs/buttons/playLoopOne.svg"
    />
  </button>
  <br />
  <label
    >Vitesse de lecture 0
    <input
      id="vitesseLecture"
      type="range"
      min="0.2"
      max="4"
      step="0.1"
      value="1"
    />
  </label>
  <br />
  Balance L/F :
  <input type="range" min="-1" max="1" step="0.1" value="0" id="balance" />
  <hr>
  <div class="eq">
      <h1>Égaliseur</h1>
      <label>60Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain0"></input>
      <output id="gainOutput0">0 dB</output>
    <br/>
      <label>170Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain1"></input>
      <output id="gainOutput1">0 dB</output>
    <br/>
      <label>310Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain2"></input>
      <output id="gainOutput2">0 dB</output>
    <br/>
      <label>600Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain3"></input>
      <output id="gainOutput3">0 dB</output>
    <br/>
      <label>1000Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain4"></input>
      <output id="gainOutput4">0 dB</output>
    <br/>
      <label>3000Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain5"></input>
      <output id="gainOutput5">0 dB</output>
    <br/>
      <label>12000Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain6"></input>
      <output id="gainOutput6">0 dB</output>
    <br/>
      <label>14000Hz</label>
      <input type="range" value="0" step="1" min="-20" max="20" id="gain7"></input>
      <output id="gainOutput7">0 dB</output>
    <br/>
  </div>
  <hr>
  <h1>Playlist</h1>
  <div>
    <ul id="playlist">
      <li>
        <button id="play">
          <img
            id="sound0"
            class="svgButtons"
            src="./myComponents/assets/imgs/buttons/playPlay.svg"
          />
          <span id="songTitle0">Muse - Uprising</span>
      </li>
      <li>
        <button id="play">
          <img
            id="sound1"
            class="svgButtons"
            src="./myComponents/assets/imgs/buttons/playPlay.svg"
          />        <span id="songTitle1">Muse - The Dark Side (Alternate Reality Version)</span>
      </li>
      <li>
        <button id="play">
          <img
            id="sound2"
            class="svgButtons"
            src="./myComponents/assets/imgs/buttons/playPlay.svg"
          />        <span id="songTitle2">Muse - The Globalist</span>
      </li>
      <li>
        <button id="play">
          <img
            id="sound3"
            class="svgButtons"
            src="./myComponents/assets/imgs/buttons/playPlay.svg"
          />        <span id="songTitle3">Muse - Exogenesis Symphony</span>
      </li>
      <li>
        <button id="play">
          <img
            id="sound4"
            class="svgButtons"
            src="./myComponents/assets/imgs/buttons/playPlay.svg"
          />        <span id="songTitle4">Muse - Unnatural Selection</span>
      </li>
    </ul>
  </div>
</div>
  `

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super()
    // Récupération des attributs HTML
    //this.value = this.getAttribute("value");

    // On crée un shadow DOM
    this.attachShadow({ mode: "open" })
    console.log("URL de base du composant : " + getBaseURL())
    console.log("basePath : " + basePath)
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.fixRelativeURLs()

    this.player = this.shadowRoot.querySelector("#myPlayer")
    this.player.src = this.getAttribute("src")
    this.player.crossOrigin = "anonymous"

    // récupérer le canvas
    this.canvas = this.shadowRoot.querySelector("#myCanvas")
    this.ctx = this.canvas.getContext("2d")

    // Récupération du contexte WebAudio
    this.audioCtx = new AudioContext()

    this.defineListeners()

    // On construit un graphe webaudio pour capturer
    // le son du lecteur et pouvoir le traiter
    // en insérant des "noeuds" webaudio dans le graphe
    this.buildAudioGraph()

    // on démarre l'animation
    requestAnimationFrame(() => {
      this.animationLoop()
    })
  }

  buildAudioGraph() {
    let audioContext = this.audioCtx

    let playerNode = audioContext.createMediaElementSource(this.player)

    // Create an analyser node
    this.analyserNode = audioContext.createAnalyser()
    this.pannerNode = audioContext.createStereoPanner()

    // Try changing for lower values: 512, 256, 128, 64...
    this.analyserNode.fftSize = 256
    this.bufferLength = this.analyserNode.frequencyBinCount
    this.dataArray = new Uint8Array(this.bufferLength)

    let filters = [];

    [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000].forEach(function (freq) {
      var eq = audioContext.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      filters.push(eq);
    });

    // Connect filters in serie
    playerNode.connect(filters[0])
    for (var i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1])
    }

    // connect the last filter to the speakers
    filters[filters.length - 1].connect(audioContext.destination)

    this.filters = filters;
    playerNode.connect(this.analyserNode);
    this.analyserNode.connect(audioContext.destination);

    playerNode.connect(this.pannerNode);
    this.pannerNode.connect(audioContext.destination);
    
  }

  animationLoop() {
    // 1 on efface le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 2 on dessine les objets
    //this.ctx.fillRect(10+Math.random()*20, 10, 100, 100);
    // Get the analyser data
    this.analyserNode.getByteFrequencyData(this.dataArray)

    let barWidth = this.canvas.width / this.bufferLength
    let barHeight
    let x = 0

    // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
    // before drawing. This is the scale factor
    let heightScale = this.canvas.height / 128

    for (let i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i]

      this.ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)"
      barHeight *= heightScale
      this.ctx.fillRect(
        x,
        this.canvas.height - barHeight / 2,
        barWidth,
        barHeight / 2
      )

      // 2 is the number of pixels between bars
      x += barWidth + 1
    }
    // 3 on deplace les objets

    // 4 On demande au navigateur de recommencer l'animation
    requestAnimationFrame(() => {
      this.animationLoop()
    })
  }

  fixRelativeURLs() {
    template.content.querySelectorAll("*[src]").forEach((e) => {
      const currentPath = e.getAttribute("src")
      if (currentPath !== undefined && currentPath.startsWith(".")) {
        e.setAttribute("src", this.basePath + currentPath)
      }
    })

    template.content.querySelectorAll("*[href]").forEach((e) => {
      const currentPath = e.getAttribute("href")
      if (currentPath !== undefined && currentPath.startsWith(".")) {
        e.setAttribute("href", this.basePath + currentPath)
      }
    })
  }

  defineListeners() {
    this.shadowRoot.querySelector("#play").onclick = () => {
      toggle = !toggle
      if (toggle) {
        this.play()
      } else {
        this.pause()
      }
    }

    this.shadowRoot.querySelector("#recule10").onclick = () => {
      this.player.currentTime -= 10
    }

    this.shadowRoot.querySelector("#avance10").onclick = () => {
      this.player.currentTime += 10
    }

    this.shadowRoot.querySelector("#loopOne").onclick = () => {
      this.loopOne()
    }

    this.shadowRoot.querySelector("#restart").onclick = () => {
      this.restart()
    }
    this.shadowRoot.querySelector("#mute").onclick = () => {
      this.mutePlayer()
    }

    this.shadowRoot.querySelector("#vitesseLecture").oninput = (event) => {
      this.player.playbackRate = parseFloat(event.target.value)
      console.log("vitesse =  " + this.player.playbackRate)
    }

    this.shadowRoot.querySelector("#progress").onchange = (event) => {
      this.player.currentTime = parseFloat(event.target.value)
    }

    this.shadowRoot.querySelector("#volumeKnob").oninput = (event) => {
      this.player.volume = event.target.value / 20
    }
 


    this.shadowRoot.querySelector("#balance").oninput = (event) => {
      this.balance(event.target.value)
    }

    this.shadowRoot.querySelector("#gain0").oninput = (event) => {
      this.changeGain(event.target.value,0)
    }
    this.shadowRoot.querySelector("#gain1").oninput = (event) => {
      this.changeGain(event.target.value,1)
    }
    this.shadowRoot.querySelector("#gain2").oninput = (event) => {
      this.changeGain(event.target.value,2)
    }
    this.shadowRoot.querySelector("#gain3").oninput = (event) => {
      this.changeGain(event.target.value,3)
    }
    this.shadowRoot.querySelector("#gain4").oninput = (event) => {
      this.changeGain(event.target.value,4)
    }
    this.shadowRoot.querySelector("#gain5").oninput = (event) => {
      this.changeGain(event.target.value,5)
    }
    this.shadowRoot.querySelector("#gain6").oninput = (event) => {
      this.changeGain(event.target.value,6)
    }
    this.shadowRoot.querySelector("#gain7").oninput = (event) => {
      this.changeGain(event.target.value,7)
    }

    this.shadowRoot.querySelector("#sound0").onclick = () => {
      this.playlistPlay(0)
    }
    this.shadowRoot.querySelector("#sound1").onclick = () => {
      this.playlistPlay(1)
    }
    this.shadowRoot.querySelector("#sound2").onclick = () => {
      this.playlistPlay(2)
    }
    this.shadowRoot.querySelector("#sound3").onclick = () => {
      this.playlistPlay(3)
    }
    this.shadowRoot.querySelector("#sound4").onclick = () => {
      this.playlistPlay(4)
    }
    
    

    this.player.ontimeupdate = (event) => {
      let progressSlider = this.shadowRoot.querySelector("#progress")
      progressSlider.max = this.player.duration
      progressSlider.min = 0
      progressSlider.value = this.player.currentTime
      this.displayTimes()
    }
  }

  secondToMinute(seconds) {}

  play() {
    this.toggle =true
    this.player.play()
    this.audioCtx.resume()
    this.shadowRoot
      .querySelector("#buttonPlay")
      .setAttribute("src", basePath + "/assets/imgs/buttons/playPause.svg")
  }
  pause() {
    this.player.pause()
    this.shadowRoot
      .querySelector("#buttonPlay")
      .setAttribute("src", basePath + "/assets/imgs/buttons/playPlay.svg")
  }
  restart() {
    this.player.currentTime = 0
  }

  loopOne() {
    loop = !loop
    if (loop) {
      this.player.loop = true
      this.shadowRoot
        .querySelector("#buttonLoopOne")
        .setAttribute(
          "src",
          basePath + "/assets/imgs/buttons/playLoopOneActive.svg"
        )
    } else {
      this.player.loop = false
      this.shadowRoot
        .querySelector("#buttonLoopOne")
        .setAttribute("src", basePath + "/assets/imgs/buttons/playLoopOne.svg")
    }
  }

  mutePlayer() {
    mute = !mute
    if (mute) {
      this.player.muted = false
      this.shadowRoot
        .querySelector("#buttonMute")
        .setAttribute("src", basePath + "/assets/imgs/buttons/volMute.svg")
    } else {
      this.player.muted = true
      this.shadowRoot
        .querySelector("#buttonMute")
        .setAttribute(
          "src",
          basePath + "/assets/imgs/buttons/volMuteActive.svg"
        )
    }
  }

  displayTimes() {
    this.shadowRoot.querySelector("#total-time").innerHTML = this.convertTime(
      this.player.duration
    )
    this.shadowRoot.querySelector("#current-time").innerHTML = this.convertTime(
      this.player.currentTime
    )
  }

  convertTime(seconds) {
    var min = Math.floor(seconds / 60)
    var sec = Math.floor(seconds % 60)
    var cleanSec = sec
    if (sec < 10) {
      cleanSec = "0" + sec
    }
    return min + ":" + cleanSec
  }

  /*
  between -1 and 1
  -1 full left
  1 full right
  */
  balance(sliderVal) {
    this.pannerNode.pan.value = parseFloat(sliderVal);
  }

  changeGain(sliderVal,nbFilter) {
    var value = parseFloat(sliderVal);
    this.filters[nbFilter].gain.value = value;
    this.shadowRoot.querySelector("#gainOutput"+nbFilter).value = sliderVal+" dB"
  }

  playlistPlay(item){
    var playlist =[
      "/myComponents/assets/audio/Muse_Uprising.mp3",
      "/myComponents/assets/audio/Muse_The_Dark_Side.mp3",
      "/myComponents/assets/audio/Muse_The_Globalist.mp3",
      "/myComponents/assets/audio/Muse_Exogenesis_Symphony.mp3",
      "/myComponents/assets/audio/Muse_Unnatural_Selection.mp3"
    ]
    var songToplay =playlist[parseInt(item)]
    console.log("song to play " +songToplay)
    this.player.src = songToplay
    this.play()
    this.shadowRoot.querySelector("#songTitle").innerHTML = this.shadowRoot.querySelector("#songTitle"+item).innerHTML

  }

}

customElements.define("my-player", MyAudioPlayer)
