// SoketIO Object
const socket = io();

/** Video Control   */
const myFace = document.querySelector("#myFace");
const cameraBtn = document.querySelector("#camera");
const muteBtn = document.querySelector("#mute");
const cameraSelect = document.querySelector("#cameras");

/** Global Variable   */
let myStream;
let muted = false;
let cameraOff = false;
let roomName;

/**
 * Stream 객체 생성 및 주입
 * - Video를 연결함
 */
async function getMedia(deviceId) {
  // 카메라 ❌
  const initalConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  // 카메라 👌
  const cameraConstrains = {
    audio: true,
    video: {
      deviceId: { exact: deviceId },
    },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      // 삼항 사용
      deviceId ? cameraConstrains : initalConstrains
    );
    // 스트림 객체 주입
    myFace.srcObject = myStream;

    // 최초 한번 실행 - deviceId가 없을 경우에만 그려줌
    if (!deviceId) await getCameras();
  } catch (error) {
    console.log(error);
  } // try - catch
}

/**
 * 접근 가능한 디바이스 정보를 가져와 UI생성
 *  */
const getCameras = async () => {
  try {
    // 현재 사용자의 디바이스 정보를 가져옴
    const devices = await navigator.mediaDevices.enumerateDevices();
    // 카메라 정보만 Filter
    const cameras = devices.filter((item) => item.kind === "videoinput");
    // 현재 사용중인 카메라 Lable을 가져옴
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // lable이 같다면  Selected!
      if (currentCamera.label === camera.label) option.selected = true;

      cameraSelect.appendChild(option);
    }); // forEach
  } catch (e) {
    console.log(e);
  } // try - catch
};

//getMedia();

// 카메라 설정 Click Event
cameraBtn.addEventListener("click", () => {
  // UI처라
  cameraBtn.innerHTML = !cameraOff ? "카메라 켜기" : "카메라 끄기";
  // 전역변수 변경
  cameraOff = !cameraOff;

  // Stream객체의 Video Track enabled 처리
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  }); // forEach
});

// 음소거 버튼  Click Event
muteBtn.addEventListener("click", () => {
  // UI처리
  muteBtn.innerHTML = muted ? "음소거" : "음소거 해제";
  // 전역변수 변경
  muted = !muted;

  // Stream객체의 Audio Track을 받아와 enabled 처리
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  }); // forEach
});

// 카메라 목록 Select Event
cameraSelect.addEventListener("input", (camersSelect) => {
  getMedia(camersSelect.target.value);
});

/******************************************* */
/***********    Room Script     ************ */
/******************************************* */

/** Room Control  */
const welcome = document.querySelector("#welcome");
const call = document.querySelector("#call");
const welcomeForm = welcome.querySelector("form");

/** UI init */
call.hidden = true;

// ⭐️ 시작 함수 SocketIO 마지막 인자로 넣으므로 최종적 실행 함수
const startMedia = () => {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
};

// Form 전송 버튼 클릭 시
welcomeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  // 💬 SocketIO에 방 생성 요청
  socket.emit("join_room", input.value, startMedia);
  // 전역변수 방이름 할당
  roomName = input.value;
  // 초기화
  input.value = "";
});

/** Socket Code  */
socket.on("welcome", () => {
  console.log("누군가 들어왔다!!!");
});
