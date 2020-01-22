const { ipcRenderer, remote } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let songFilePath = null;

document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners and declare variables
  document
    .getElementById("selectAudio")
    .addEventListener("click", selectNewAudio);

  document
    .getElementById("playInDefaultProgram")
    .addEventListener("click", playInDefaultProgram);

  const audioElement = document.querySelector("#audioPlayer");
  audioElement.addEventListener("ended", () => {
    // Set the title to be app title
    document.title = remote.getGlobal("APP_TITLE");
  });
  let songName = null;
  audioElement.addEventListener("play", () => {
    if (audioElement.currentTime === 0) {
      // In Windows only works if we set the Application User Model ID
      new Notification("Currently Playing", {
        songName
      });
      // For developer purposes on Windows, show a balloon
      ipcRenderer.invoke("showSongTitleBalloon", songName);
    }
  });

  function selectNewAudio() {
    // Remove previously selected audio source
    deleteExistingSource(audioElement);
    // Call main process
    ipcRenderer
      .invoke("getAudioFilePath")
      .then(filePath => {
        songFilePath = filePath;
        songName = createNewSource(audioElement, filePath);
        document.title = songName;
      })
      .catch(() => {
        console.log("File dialog: Error or user simply canceled.");
      });
  }
});

/**
 * Remove one source element child from audioElement
 * @param {Element} audioElement The parent audio element
 */
function deleteExistingSource(audioElement) {
  let existingSourceElement = document.querySelector("#audioPlayer source");
  if (existingSourceElement !== null) {
    audioElement.removeChild(existingSourceElement);
  }
}

/**
 * Create a new source element with filePath as src inside audioElement.
 * @param {Element} audioElement The parent audio element
 * @param {string} filePath The file path used as src
 * @returns {string} The song name
 */
function createNewSource(audioElement, filePath) {
  // Create source element
  let sourceElement = document.createElement("source");
  sourceElement.setAttribute("src", filePath);
  sourceElement.setAttribute("type", "audio/ogg");
  // Add source element to audio element
  audioElement.appendChild(sourceElement);
  audioElement.load();
  // Update the trackInformation
  let songName = path.parse(filePath).name;
  document.getElementById(
    "trackInformation"
  ).innerHTML = `<b>Currently playing</b>: ${songName}`;
  return songName;
}

function playInDefaultProgram() {
  exec(`start wmplayer "${songFilePath}"`)
}
