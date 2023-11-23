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

// 👉 서버로 메세지 보내기
setTimeout(() => {
  socket.send("Hello! 이건 클라이언트에서 보내는 메세지야 안녕");
}, 5_000);
