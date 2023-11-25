// 👉 Client에서 서버로 소켓 통신을 요청함.
const socket = new WebSocket(`ws://${window.location.host}`);

// 👉 Socket Open
socket.addEventListener("open", () => {
  console.log("Client :: Connection to Server Success!!");
});

// 👉 Socket get Message
socket.addEventListener("message", (message) => {
  console.log("Just got this :: ", message.data);
});

// 👉 Socket get Message 받기
socket.addEventListener("close", () => {
  console.log("Disconnected Server");
});

////////////////////////////

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

// 💬 메세지를 서버로 전송
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  // 전송
  socket.send(input.value);
  // 초기화
  input.value = "";
});
