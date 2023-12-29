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
async function getMedia(deviceId) {
  //  💬 디바이스ID가 없을 경우 Default 설정
  const initalConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };

  //  💬 디바이스ID가 있을 경우 카메라 ID설정
  const cameraConstrains = {
    audio: true,
    video: {
      deviceId: { exact: deviceId },
    },
  };

  /*** ✅ 디바이스 지정
   * 💬 디바이스 아이디를 지정 후 없으면 알아서 다른 접근 가능한 디바이스로 연결함
   * {
   * video: {
   *   deviceId: myPreferredCameraDeviceId,
   *  },
   * }
   * --------------------------------------------------------------------
   * 💬 디바이스 아이디를 지정 후 없으면 연결 하지 않음
   * {
   * video: {
   * deviceId: {
   *   exact: myExactCameraOrBustDeviceId,
   *  },
   * },
   *}
   */

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initalConstrains
    );
    // 💬 스트림 객체 주입
    myFace.srcObject = myStream;
    // 디바이스ID가 없다면 Select UI를 그리지 않음
    if (!deviceId) {
      await getCameras();
    } // ifs
  } catch (error) {
    console.log(error);
  }
}

/**
 *  💬 접근되는 카메라 디바이스를 가져온 후 Select Dom을 그림
 *  */
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((item) => item.kind === "videoinput");
    // 현재 사용중인 카메라 Lable을 가져옴
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // 💬 카메라 레이블이 같을 경우에 Selected!
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }

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

/**
 * 카메라 목록 변경 시 Event
 */
cameraSelect.addEventListener("input", (camersSelect) => {
  getMedia(camersSelect.target.value);
});
