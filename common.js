
document.addEventListener("DOMContentLoaded", function(){
  //————————————————————
  // 스네이크 게임 실행문
  //————————————————————
  App.SnakeGame.init();
  //————————————————————
  // 헤더와 푸터 고정 실행문
  //————————————————————
  App.ContentHeightSet.init();
  window.addEventListener("resize", App.ContentHeightSet.init);
  //contentHeightSet();
  //——————————————————————————————————————————
  // CSS에서 쓸 --vh 프로퍼티 선언하는 함수 실행문
  //——————————————————————————————————————————
  setScreenSize();
  window.addEventListener("resize", setScreenSize);
  /*
  @brief 모바일에서 탑과 바텀바로 인해 100vh가 적용되지 않는 현상 해결하는 함수
  @return : 윈도우 안쪽 높이의 100분의 1을 vh변수에 담아 도큐먼트에 --vh라는 프로퍼티를 반환하여 CSS에서 사용할 수 있다.
  @param : 없음
  */
  function setScreenSize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  //——————————————————————————————————————————
  // 모바일에서 스크롤 이벤트 삭제 함수 실행문
  //——————————————————————————————————————————
  disableScroll();
  /*
  @brief 모바일에서 터치이벤트로 게임동작할 때 스크롤 이벤트로 생기는 버그가 있어 스크롤 이벤트를 삭제하는 함수
  @return : 
  @param : 이벤트
  */
  function disableScroll() { 
    document.querySelector('body').addEventListener('touchmove', this.removeEvent, { passive: false });
  }
  removeEvent = e => {
    e.preventDefault();
    e.stopPropagation();
  } 
});
var App = new Object();

/*
@details 스네이크 게임의 전역변수와 기능, 중복되는 코드 메서드로 정의
@author : 함은영
@date : 2022-06-22
@version : 0.1
*/
App.SnakeGame = function() {
var self;
var score = 0; //스코어
var state = '';
var speed = 280; //최초스피드
var LR = 0; // 좌우 방향
var TB = 1; // 위아래 방향
var scoreText = document.getElementsByClassName('score')[0]; //스코어텍스트
var eatSound = document.querySelector('.eat'); //사과먹는 사운드
var gameOverSound = document.querySelector('.gameover'); //게임오버 사운드

var rightPressed = false; 
var leftPressed = false;
var upPressed = false;
var downPressed = false;

var mapSize = 17; //맵 크기

var gameInterval; //자동재생

var snake = new Array(); //뱀 변수
var apple = new Array(); //사과 변수

var startX; //터치이벤트 x좌표 시작
var startY; //터치이벤트 y좌표 시작
var endX; //터치이벤트 x좌표 끝
var endY; //터치이벤트 y좌표 끝

  return {
    //——————————————————————————————————————————————————
    // 게임 초기화
    //——————————————————————————————————————————————————
    init: function() {
      self = this;
      score = 0; // 점수 초기화
      speed = 290; // 속도 초기화
      scoreText.innerText="SNAKE GAME"; //점수에서 스네이크 게임 헤드명으로 변경

      self.initMap(); // 맵 초기화
      self.initSnake(); // init snake
      self.initApple(); // init apple
      LR = 0; // 좌우 방향 초기화, 1일때 play버튼 누르면 오른쪽으로 이동
      TB = 1; // 위아래 방향 초기화, 1일때 play버튼 누르면 아래로 이동

      rightPressed = false;
      leftPressed = false;
      downPressed = false;
      upPressed = false;   

      document.querySelector('.wrap').classList.remove('end');
      document.querySelector('.btn-play').addEventListener('click', self.start);

    },
    //——————————————————————————————————————————————————
    // 게임 재시작
    //——————————————————————————————————————————————————
    restart: function() {
      self.init();
    },
    //——————————————————————————————————————————————————
    // 랜덤 숫자 생성
    //——————————————————————————————————————————————————
    generateRandom: function(min, max) {
      var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
      return ranNum;
    },
    //——————————————————————————————————————————————————
    // 스네이크 게임 맵 생성
    //——————————————————————————————————————————————————
    initMap: function() {
      var snakeBg;
      var tableCode = '';

      for (var i=0; i<mapSize; i++) {
        tableCode += '<div>';
        
        var rowCode = '';
        for (var j=0; j<mapSize; j++) {
          rowCode += '<span id="bg-row'+i+'_'+j+'"></span>';
        }

        tableCode += rowCode + '</div>';
        
      }
      snakeBg = document.querySelector("#snakeTable");
      if(snakeBg.childNodes.length > 0) {
        snakeBg.innerHTML = '';
      }
      snakeBg.innerHTML = snakeBg.innerHTML + tableCode;
    },
    //——————————————————————————————————————————————————
    // snake 초기화 
    //——————————————————————————————————————————————————
    initSnake: function() {
      snake = [];
      snake.push([0, 0]);
      self.drawSnake();
    },
    //——————————————————————————————————————————————————
    // snake 생성
    //——————————————————————————————————————————————————
    drawSnake: function() {
      state = '';
      //——————————————————————————————————————————————————
      // snake클래스 가진 요소 전체에서 클래스 지우기 위한 코드
      //——————————————————————————————————————————————————
      var block = document.querySelectorAll('.snake');
      for (var i = 0; i <block.length; i++) { 
        block[i].classList.remove("snake");
      }
      //————————————————————————————————
      // snake 배열의 길이만큼 반복하는 코드
      //————————————————————————————————
      for(var i=0; i<snake.length; i++) {
        var bgRow = document.querySelector('#bg-row'+snake[i][0]+'_'+snake[i][1]);
        //————————————————————————————————
        // snake가 자기 몸에 부딪힐 때 게임 종료
        //————————————————————————————————
        if(bgRow.classList.contains('snake')) { 
          self.clearGame();
        }
        //————————————————————————————————
        // snake 클래스 추가로 픽셀 표시
        //————————————————————————————————
        bgRow.classList.add("snake");
        //————————————————————————————————————————————————————————————————————————————————————————————————————————
        // snake가 apple을 먹으면 점수 추가, 속도 증가, 인터벌을 클리어(게임종료)하고 재시작, apple을 초기화하고 state에 상태 반영
        //————————————————————————————————————————————————————————————————————————————————————————————————————————
        if(bgRow.classList.contains('apple')) { 
          score++;
          scoreText.innerText="SCORE : " + score;
          eatSound.currentTime = 0;
          eatSound.play();
          speed = speed - score; 
          self.pause(); 
          self.start(); 
          self.initApple(); 
          state = 'eat'; 
        }
      }
      return state; 
    },
    //——————————————————————————————————————————————————
    // apple 초기화
    //——————————————————————————————————————————————————
    initApple: function() {
      var snakeP = new Array(); //현재 스네이크의 위치를 배열에 담아 새로 생성될 애플의 위치에서 제외
      snakeP[0] = snake[0][0];
      snakeP[1] = snake[0][1];

      var x = '';
      var y = '';

      x = self.generateRandom(0,mapSize-1); //난수생성 
      y = self.generateRandom(0,mapSize-1);

      apple = [];
      apple.push([x, y]);
      self.drawApple();
    },
    //——————————————————————————————————————————————————
    // apple 생성
    //——————————————————————————————————————————————————
    drawApple: function() {
      //————————————————————————————————
      // 움직일 때 기존 애플 픽셀 지우기 위한 코드
      //————————————————————————————————
      var block = document.querySelectorAll('.apple');
      if(block.length > 0) {
        block[0].classList.remove("apple");
      }
      //————————————————————————————————————————————————————————————————
      // apple 생성 : 현재 스네이크 위치에 애플이 생성되었다면 초기화 후 다시 생성
      //————————————————————————————————————————————————————————————————
      for(var i=0; i<apple.length; i++) {
        var bgRow = document.querySelector('#bg-row'+apple[i][0]+'_'+apple[i][1]);
        if(bgRow.classList.contains('snake')){ //
          self.initApple();
        } else{
          bgRow.classList.add("apple");
        }
      }
    },
    //——————————————————————————————————————————————————
    // 키보드 동작 제어
    //——————————————————————————————————————————————————
    keyDownHandler: function(event) {
      switch (event.keyCode){
        case 39: //right
          if(leftPressed == false){ 
            self.right();
          }
          break;
        case 37: //left
          if(rightPressed == false){
            self.left();
          }
          break;
        case 40: //down
          if(upPressed == false){
            self.down();
          }
          break;
        case 38: //up
          if(downPressed == false){
            self.up();
          }
          break;
      }
    },
    //——————————————————————————————————————————————————
    // 터치 이벤트 제어
    //——————————————————————————————————————————————————
    touchStart: function(e) {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, 
    touchEnd: function(e) {
      endX = e.changedTouches[0].clientX - startX;
      endY = e.changedTouches[0].clientY - startY;

      if(endX > 50 && leftPressed == false) {//right
        self.right();
      } else if(endX < -50 && rightPressed == false){ //left
        self.left();
      } else if(endY > 50 && upPressed == false) { //down
        self.down();
      } else if(endY < -50 && downPressed == false) {
        self.up();
      }
    },
    //——————————————————————————————————————————————————
    // 방향전환
    //——————————————————————————————————————————————————
    right: function() {
      rightPressed = true; 
      LR = 1;
      TB = 0;
      self.move();
      downPressed = false;
      upPressed = false;
    },
    left: function() {
      leftPressed = true;
      LR = -1;
      TB = 0;
      self.move();
      downPressed = false;
      upPressed = false;
    },
    down: function() {
      downPressed = true;
      LR = 0;
      TB = 1;
      self.move();
      rightPressed = false;
      leftPressed = false;
    },
    up: function() {
      upPressed = true;
      LR = 0;
      TB = -1;
      self.move();
      rightPressed = false;
      leftPressed = false;
    },
    //——————————————————————————————————————————————————
    // 키보드 혹은 터치로 snake를 이동
    //——————————————————————————————————————————————————
    move: function() {
      var head = new Array();
      head[0] = snake[0][0];
      head[1] = snake[0][1];

      //————————————————————————————————————————————————————————————————————————————————————————————————————————————
      // move 진행 시 head배열에 snake의 현재 위치에 방향키의 값을 더해 새로운 위치값을 snake 배열에 넣어줌 mapSize를 벗어나 움직이면 종료
      //————————————————————————————————————————————————————————————————————————————————————————————————————————————
      var x = head[0]+1*TB;
      if(x >= 0 && x < mapSize) {
          head[0] = x;
      }else {
        self.clearGame();
      }
      var y = head[1]+1*LR;
      if(y >= 0 && y < mapSize) {
        head[1] = y;
      } else {
        self.clearGame();
      }
      
      snake.unshift(head);

      if(state != 'eat') { 
        snake.pop();
      }

      self.drawSnake();
    },
    //——————————————————————————————————————————————————
    // 게임 시작
    //——————————————————————————————————————————————————
    start: function() {
      gameInterval = setInterval(self.move, speed);
      scoreText.innerText="SCORE : 0"; //점수초기화
      document.addEventListener('keydown', self.keyDownHandler, false); //클릭이벤트
      document.addEventListener('touchstart', self.touchStart, false); //터치시작이벤트
      document.addEventListener('touchend', self.touchEnd, false); //터치종료이벤트
      document.querySelector('.btn-play').removeEventListener('click', self.start); //시작버튼
    },
    //—————————————————————————————————————————————————————————————————————
    // 게임 중 snake가 apple을 먹었을 때 게임을 중지 시키고 재시작시키기 위한 과정
    //—————————————————————————————————————————————————————————————————————
    pause: function() {
      clearInterval(gameInterval);
      document.removeEventListener('keydown', self.keyDownHandler, false); //클릭이벤트
      document.removeEventListener('touchstart', self.touchStart, false); //터치시작이벤트
      document.removeEventListener('touchend', self.touchEnd, false); //터치종료이벤트
    },
    //——————————————————————————————————————————————————
    // 게임 종료
    //——————————————————————————————————————————————————
    clearGame: function() {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
      document.querySelector('.wrap').classList.add('end');
      self.pause();
      document.querySelector('.restart').addEventListener('click', self.restart);
      return;
    }
  }
}();

/*
@details 헤더와 푸터를 화면에 고정시키고 콘텐츠 + 헤더 + 푸터 높이가 브라우저 크기보다 넓어질 때 고정해제

@author : 함은영
@date : 2022-07-08
@version : 0.2
*/
App.ContentHeightSet = function() { 
  var self;
  return {
    init: function() {
      self = this;
      
      var windowH = window.innerHeight;
      var restH = document.querySelector('.header-wrap').offsetHeight + document.querySelector('.controller').offsetHeight;
      var gameBoxH = document.querySelector('.game').offsetHeight;
      var wrap = document.querySelector('.wrap');

      if(restH + gameBoxH > windowH) {
        wrap.classList.add("off");
      } else { 
        if(!wrap.classList.contains('off')){
          return;
        }
        wrap.classList.remove("off");
      } 
    }
  }
}();