// 💬 간단하게 io()만으로 소켓 연결 완료..
const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

const room = document.querySelector("#room");
const roomNameTitle = document.querySelector("#rooName");
room.hidden = true;

let roomName;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const roomNameInput = form.querySelector("#roomName");
  const nickNameInput = form.querySelector("#nickName");
  //
  /**
   * ⭐️ SocketIo는 소켓서버에 메세지를 보낼때 send()가 아닌 "emit()"을 사용
   *    - 단 여기서 중요 포인트는 사실 SocketIO는 메세지가 아닌 모든것을 보낼 수 있다는 것이다.
   *       => 항상 메세지를 보낼 필요가 없다는 것이다.
   *    - 따라서  soekct.emit("내마음대로 지정 가능", { 오브젝트도 가능});와 같이 사용이 가능하다
   *
   * 💯 : 일반 WebSocket을 사용했을 때는 문자열로 보냈지만 이제는 그럴 필요가 없다!!
   *      - SocketIO 프레임워크가 알아서 다 해결해준다.
   */
  socket.emit(
    "enter_room",
    { roomName: roomNameInput.value, nickName: nickNameInput.value },
    () => {
      welcome.hidden = true;
      room.hidden = false;
      roomNameTitle.innerText = `Room :: ${roomName}`;

      // 메세지 보내기
      const msgForm = room.querySelector("#message");
      msgForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = room.querySelector("#message input");
        socket.emit("new_message", input.value, roomName, () => {
          addMessage(`You : ${input.value}`);
        });
      });
    }
  );
  roomName = roomNameInput.value;

  roomNameInput.value = "";
});

/**
 * 메세지 li를 만들어 ul에 추가하는 함수
 */
const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

socket.on("welcome", (nickName, newCount) => {
  roomNameTitle.innerText = `Room :: ${roomName} (${newCount})`;
  addMessage(`${nickName} joined!!!`);
});

socket.on("bye", (nickName, newCount) => {
  roomNameTitle.innerText = `Room :: ${roomName} (${newCount})`;
  addMessage(`${nickName} 나간다!!!`);
});

socket.on("toMessage", (msg) => {
  addMessage(msg);
});

// 소켓에서 응답이 올경우 방 목록 업데이트
socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  // 초기화
  roomList.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
