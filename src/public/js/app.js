const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

// 💬 닉네임 저장
nickForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  // 초기화
  input.value = "";
});

// 💬 메세지를 서버로 전송
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  // 서버에 input 데이터 전송
  socket.send(makeMessage("new_message", input.value));
  // 초기화
  input.value = "";
});

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// 👉 Client에서 서버로 소켓 통신을 요청함.
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  // 👍 String으로 변환해서 보내는 이유는 받는 Socket서버가 무조건 Node기반이 아닐 수 있기 때문이다!!
  //    - 서버쪽에서 해당 JSON을 재파싱 하는 형식으로 가는게 맞는거임!
  return JSON.stringify(msg);
};

// 👉 Socket Open
socket.addEventListener("open", () => {
  console.log("Client :: Connection to Server Success!!");
});

// 👉 Socket get Message
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

// 👉 Socket get Message 받기
socket.addEventListener("close", () => {
  console.log("Disconnected Server");
});
