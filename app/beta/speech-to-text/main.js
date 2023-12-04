async function main() {
  try {
    const buttonStart = document.querySelector("#buttonStart");
    const buttonStop = document.querySelector("#buttonStop");
    const result = document.querySelector("#result");

    const stream = await navigator.mediaDevices.getUserMedia({
      // <1>
      video: false,
      audio: true,
    });

    const [track] = stream.getAudioTracks();
    const settings = track.getSettings(); // <2>

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule("audio-recorder.js"); // <3>

    const mediaStreamSource = audioContext.createMediaStreamSource(stream); // <4>
    const audioRecorder = new AudioWorkletNode(audioContext, "audio-recorder"); // <5>
    const buffers = [];

    audioRecorder.port.addEventListener("message", (event) => {
      // <6>
      buffers.push(event.data.buffer);
    });
    audioRecorder.port.start(); // <7>

    mediaStreamSource.connect(audioRecorder); // <8>
    audioRecorder.connect(audioContext.destination);

    buttonStart.addEventListener("click", (event) => {
      buttonStart.setAttribute("disabled", "disabled");
      buttonStop.removeAttribute("disabled");

      const parameter = audioRecorder.parameters.get("isRecording");
      parameter.setValueAtTime(1, audioContext.currentTime); // <9>

      buffers.splice(0, buffers.length);
    });

    buttonStop.addEventListener("click", (event) => {
      buttonStop.setAttribute("disabled", "disabled");
      buttonStart.removeAttribute("disabled");

      const parameter = audioRecorder.parameters.get("isRecording");
      parameter.setValueAtTime(0, audioContext.currentTime); // <10>

      const blob = encodeAudio(buffers, settings); // <11>
      
      fetch("https://wisper.api.cla-q.net/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://app.cla-q.net/",
          // 追加: カスタムヘッダーや認証情報などが必要な場合はここに追加
        },
        body: blob,
      })
        .then((response) => response.json())
        .then((data) => {
          result.innerHTML = data.response[1].text;
        })
        .catch((error) => {
          console.log("error.");
          result.innerHTML = "エラー。";
        });
    });
  } catch (err) {
    console.error(err);
  }
}

main();
