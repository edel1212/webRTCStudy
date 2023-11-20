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
