const socket = io();

const myFace = document.querySelector("#myFace");

const cameraBtn = document.querySelector("#camera");
const muteBtn = document.querySelector("#mute");
const cameraSelect = document.querySelector("#cameras");

let myStream;
// 음소거 스위치
let muted = false;
// 카메라 스위치
let cameraOff = false;

/**
 * Stream객체를 만든는 함수
 * ⭐️ async로 동작 해야한다. - 동기식 처리
 */
async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // 💬 접근 허용 창이 뜬다!
    console.log(myStream);
    myFace.srcObject = myStream;
    // 👉 카메라를 가져오는 함수 실행
    await getCameras();
  } catch (error) {
    console.log(error);
  }
}

/**
 * 접근되는 카메라 디바이스를 가져옴
 *  */
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((item) => item.kind === "videoinput");
    console.log(cameras);
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

getMedia();

/** 버튼 Click Event */
cameraBtn.addEventListener("click", () => {
  if (!cameraOff) {
    cameraBtn.innerHTML = "카메라 켜기";
  } else {
    cameraBtn.innerHTML = "카메라 끄기";
  } //if else
  cameraOff = !cameraOff;
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
});
muteBtn.addEventListener("click", () => {
  if (!muted) {
    muteBtn.innerHTML = "음소거";
  } else {
    muteBtn.innerHTML = "음소거 해제";
  } //if else
  muted = !muted;
  // 💬 만들어진 객체의 getAudioTracks()를 받아서 Loop문으로 처리
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
});
