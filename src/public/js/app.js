// 💬 간단하게 io()만으로 소켓 연결 완료..
const soekct = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
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
  soekct.emit("enter_room", { payload: input.value }, "!", "@", "#", "$", "%");
  input.value = "";
});
