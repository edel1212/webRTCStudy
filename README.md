# Room

Zoom Clone using NodeJs, Web RTC

## 기본 설치

- `npm init -y`
  - package.json 설치
- `npm i nodemon -D`
  - nodeJs 서버 실행 시 코드 변경하면 자동으로 재시작해 줌
- `npm i @babel/core -D`, `npm i @babel/cli -D` , `npm i @babel/node -D`, `npm i @babel/preset-env -D`
  - 바벨 설치
    - javascript 컴파일러이다. 인터프리터언어가 왜 컴파일러가 필요할까 하지만 babel은 정확히는 javascript로 결과물을 만들어주는 컴파일러이다
      - 브라우저 호환 같은 것도 해결해 줌!
      - Ts 변환도 가능함
- `npm i express`
  - node를 사용해서 서버를 구현 하게 해줌
- `npm i pug`
  - HTML 을 PUG 문법으로 작성하면 HTML 로 바꿔주는 기능을 한다.
  - pug 는 express의 패키지 view engine이다.

### HTTP, WebSocket 차이

- HTTP
  - 요청 -> 응답 의 간단한 방식으로 동작한다
  - Stateless 하다
  - http or https 를 사용해서 요청 후 응답을 받는다.
- WebSocket
  - Client에서 WebSocket에 요청 -> Server에서 수락 후 연결이 시작된다.
  - 양방향 연결의 연결이기 때문에 응답 요청 개념이 아닌 서로 교환 방식이 아닌 소통 개념으로 데이터를 주고 받는다.
  - ws or wss르 를 사용해 소켓 연결 후 데이터를 주고 받는다.

### Websocket 설치

- ws

  - WebSoket의 core(중심)과도 같은 존재이다.
  - 단 해당 library만으로는 채팅방과 같은 기능은 내가 만들어야함. 하지만 다른사람이 해당 라이브러리를 사용해 만든 Framework가 있음
  - 설치
    - `npm i ws`
  - 적용 코드

    ```javascript
    import http from "http";
    import express from "express";
    //  💬 ws 사용을 위한 import
    import WebSocket from "ws";

    const app = express();

    // 💬 http서버를 생성 - websocket을 함께 사용하기위해 생성함
    const server = http.createServer(app);

    // 💬 굳이 파라미터로 server를 넘겨줄필요가 없지만 넘겨주는 이유는
    //    이런식으로 해야 http서버와 websocket서버를 동시에 사용이 가능함
    //    두개의 프로토콜 기능이 같은 포트에서 작동하기를 위해 이렇게 하는것임! 필수가 아니다 절대로!!
    //    - 구조 :: Hppt서버 위에  (server 변수) Socket용 서버(wss 변수)를 올린 것이다.
    const wss = new WebSocket.Server({ server });

    const handleListen = () => console.log(`Listen on http://localhost:3000`);

    // 포트 설정
    server.listen(3000, handleListen);
    ```

### ws 단계별 간단한 적용 코드

#### - 간단한 연동

```javascript
{
  /** Server.js */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  // express 사용
  const app = express();

  // http 서버 생성 - 같은 포트로 WebSocket을 사용하기 위함
  const server = http.createServer(app);

  // WebSocket 생성 매개변수로 http서버를 주입 - http 서버위에 WebSocket을 올림
  const wss = new WebSocket.Server({ server });

  // Connection 성공 시 해당 매서드 사용
  wss.on("connection", (socket) => {
    console.log("!!!!!!!!!!!!!!");
    console.log(socket);
  });

  // 포트 설정
  server.listen(3000);
}
{
  /** Client */
  // 👉 Client에서 서버로 소켓 통신을 요청함.
  const socket = new WebSocket(`ws://${window.location.host}`);
}
```

#### - Client <-> Server 데이터 주고 받기

```javascript
{
  /** Server.js */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  const app = express();

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // 💬 커넥션 이후 socket에 대한 이벤트 처리를 담당함
  wss.on("connection", (socket) => {
    console.log("Server :: Connection to Client Success!!✅");
    // ⭐️ 메세지 보내기
    socket.send("Hello!!!");
    // ⭐️ 클라이언트에서 메세지 받기
    socket.on("message", (message) => console.log(message.toString("utf8")));
    // ⭐️ Client에서 Sokect 중단 시 실행
    socket.on("close", () => {
      console.log("클라이언트에서 종료 시 해당 함수 실행!!! ❌");
    });
  });
}

{
  /** Client */
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
}
```

#### - 서로 다른 Client 끼리 메세지 주고 받기

```javascript
{
  /** Server */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  const app = express();

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  const sockets = [];

  wss.on("connection", (socket) => {
    // ⭐️ socket자체가 Object이기에 가능하다.
    //    - 닉네임 기본 값 설정
    socket["nickname"] = "지정하지 않은 닉네임 사용자";

    sockets.push(socket);

    // 메세지 전달
    socket.on("message", (msg) => {
      // 💬 Client측에서 넘긴 문자열을  JSON으로 반환하여 사용
      const aMessage = JSON.parse(msg);
      sockets.forEach((aSocektItem) => {
        switch (aMessage.type) {
          case "new_message": // 메세지 일 경우
            aSocektItem.send(
              `${socket.nickname} : ${aMessage.payload.toString("utf8")}`
            );
            break;
          case "nickname": // 닉네임일 경우
            socket["nickname"] = aMessage.payload;
            break;
        } // switch
      });
    });
  });
}

{
  /** Client */
  const messageList = document.querySelector("ul");
  const messageForm = document.querySelector("form");

  // 💬 메세지를 서버로 전송
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    // 서버에 input 데이터 전송
    socket.send(input.value);
    // 초기화
    input.value = "";
  });
}
```

#### - 닉네임 지정

```javascript
{
  /** Server */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  const app = express();

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  /**
   * 👉 누군가 연결하면 그 connection을 해당 배열에 넣어서 관리
   *  - 해당 배열로 관리하지 않으면 접근한 Socket자체에만 send하기 떄문에
   *    다른 클라이언트에서 받지 못함 아래의 forEach를 써서 Loop돌려서 보냄
   *    !! 단 좋은 방법은 아니나 임시로 사용중인 코드 (중복이 가능하다 무한 배열...)
   */
  const sockets = [];

  wss.on("connection", (socket) => {
    // 💬 배열에 소켓에 접속한 대상을 push 해줌
    sockets.push(socket);

    // 메세지 전달
    socket.on("message", (message) => {
      // 👉 Loop를 통해 접근한 모든 소켓 대상에게 메세지 전달 비효율적이긴하나 보내는 진다.
      sockets.forEach((aSocekt) => {
        aSocekt.send(message.toString("utf8"));
      });
    });
  });
}

{
  /** Client */
  const messageList = document.querySelector("ul");
  const nickForm = document.querySelector("#nick");
  const messageForm = document.querySelector("#message");

  const socket = new WebSocket(`ws://${window.location.host}`);

  const makeMessage = (type, payload) => {
    const msg = { type, payload };
    // 👍 String으로 변환해서 보내는 이유는 받는 Socket서버가 무조건 Node기반이 아닐 수 있기 때문이다!!
    //    - 서버쪽에서 해당 JSON을 재파싱 하는 형식으로 가는게 맞는거임!
    return JSON.stringify(msg);
  };

  // 💬 닉네임 저장
  nickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
  });

  /****
   * ⭐️ 개인적인 생각이지만 처음부터 JSON구조를 만들때 부터
   *    회원의 정보를 갖고 있다가 보내는 형식으로 구현하는게 더
   *    효율적인 구조라고 생각함 .. 왜 이렇게 하는건지 이해가 안 간다.
   * **/
  // 💬 메세지를 서버로 전송
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
  });
}
```

### Socket.io

- Socket.io는 프레임워크이다.
- 실시간, 양방향 , event 기반 통신을 제공한다.
- Socket.io는 "Websocket"의 부가 기능이 아니다. 가끔 websocket을 이용해서 실시간 양방향 기반 통신을 제공하는 프레임워크일 뿐이다.
  - Webscoket이 작동하지 않는다면 Socket.IO는 알아서 다른 방법을 통해 통신을 계속해나간다는 큰 장점이 있다.
- 실시간 통신을 위해서 꼭 Socket IO를 사용할 필요는 없지만 사용한다면 훨씬 더 쉽고 편리한 기능들을 제공해주는 프레임워크이기에 사용하는 것이다.
- `http://localhost:???/socket.io/socket.io.js`와 같은 페이지 또한 제공해준다.

  - 해당 페이지의 스크립트를 사용해서 Client에서 Server로 SocketIO 요청을 할 수 있게 한다. (설치 개념으로 봐도 좋다.)
  - 이유는 SocketIO는 WebSocket이 아니기 때문에 따로 Client에서도 설치가 필요하다.

- 연결 중이던 SocketIO가 끊기면 계속해서 자동으로 재연결 요청을 보낸다.

- 설치
  - `npm i socket.io`

#### - 간단한 연동

```javascript
{
  /** Server */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();

  const httpServer = http.createServer(app);
  // 👉 SocketIO 서버 생성 - 간단하게 매개변수 주입으로 끝
  const wsServer = SocketIO(httpServer);
  wsServer.on("connection", (socket) => {
    console.log(socket);
  });

  httpServer.listen(3000);
}

{
  /** Client */
  //- ⭐ 진짜 중요 포인트이다 Client에서도 SocketIO를 불러와 설치해야함!!
  //     - 서버에 npm으로 SocketIO를 설치하면 자동으로 해당 js가 생성 된다.
  script((src = "/socket.io/socket.io.js"));

  // 💬 간단하게 io()만으로 소켓 연결 완료 - socket.io.js에서 가져온 함수 사용
  const soekct = io();
}
```

#### - 서버에 이벤트 함수 전달하기

- SoketIO는 메세지를 전달하는 개념이 아닌 이벤트를 전달하는 개념이다.
- 문자열만 보낼 수 있는게 아닌 여러가지 데이터 타입을 보낼 수 있다.
- `socket.emit("서버에서 읽을 Key값",{메세지}, 서버에서 응답 후 반환 실행 함수  )`
  - argument의 개수는 자유이다!!

```javascript
{
  /** Client.js */
  const soekct = io();

  const welcome = document.querySelector("#welcome");
  const form = welcome.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    /**
     * ⭐️ SocketIo는 소켓서버에 메세지를 보낼때 send()가 아닌 "emit()"을 사용
     *    - 단 여기서 중요 포인트는 사실 SocketIO는 메세지가 아닌 모든것을 보낼 수 있다는 것이다.
     *       => 항상 메세지를 보낼 필요가 없다는 것이다.
     *    - 따라서  soekct.emit("내마음대로 지정 가능", { 오브젝트도 가능});와 같이 사용이 가능하다
     *
     * 💯 : 일반 WebSocket을 사용했을 때는 문자열로 보냈지만 이제는 그럴 필요가 없다!!
     *      - SocketIO 프레임워크가 알아서 다 해결해준다.
     */
    soekct.emit("enter_room", { payload: input.value }, () => {
      console.log("서버에서 완료 후 해당 함수 실행 한다.");
    });
    // 초기화
    input.value = "";
  });
}

{
  /** Server.js */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();

  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);

  wsServer.on("connection", (socket) => {
    // 👉 첫번째 arg는 Client에서 지정한 Key 값
    socket.on("enter_room", (msg, done) => {
      console.log(msg); // 💬 { payload: input.value }

      // 👉 해당 함수는 Front에서 실행된다!!!
      setTimeout(() => {
        done(); // 💬 "서버에서 완료 후 해당 함수 실행 한다."
      }, 1000);
    });
  });
}
```

### emit(...) argument 사용

- 다양한 타입의 데이터를 보낼 수있다.
- 함수를 보낼 경우에는 서버에서 처리후 마직에 해당 함수를 사용해 서버에 반환 해준다.
  - ⭐️ 단 중요 포인트는 argumentd의 **마지막에** 넣어줘야한다는 것이다.
  - 해당 함수는 Back-End 측에서 실행하지 않고 **갖고 있다가 Client에서 실행 할 수 있게 그대로 반환** 해준다.

```javascript
{
  /** Client */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    soekct.emit(
      "enter_room",
      { payload: input.value },
      "!",
      1,
      true,
      false,
      [1, 2, 3]
    );
    input.value = "";
  });
}

{
  /** Server */
  wsServer.on("connection", (socket) => {
    // 첫번째 arg는 Client에서 지정한 Key 값
    socket.on("enter_room", (a, b, c, d, e, f) => {
      // { payload: '123' } "!", 1, true, false, [1, 2, 3]
      console.log(a, b, c, d, e, f);
    });
  });
}

////////////////////////////////////////////////////
///////////////////////////////////////////////////

// Function argument 활용
{
  /** Server */
  wsServer.on("connection", (socket) => {
    socket.on("enter_room", (a, done) => {
      // 👉 파라미터 추가 이건 소켓 전송이 완료 후 전달될 함수이다
      done("서버에서 작성한 메세지입니다!!");
    });
  });
}

{
  /**Client*/
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");

    // 👉 포인트는 function argument의 파라미터는 서버에서 입력이 가능하다는 것이다.
    soekct.emit("enter_room", { payload: input.value }, (msg) => {
      console.log(`서버에서 arg추가 후 전달 :: ${msg}`);
    });
    input.value = "";
  });
}
```
