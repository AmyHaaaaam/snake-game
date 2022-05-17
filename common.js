
document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
  
  initAll();
  contentHeightSet(); 
  window.onresize = function() {
    contentHeightSet();
  };
});
//-----------------------------------------------------------------------------------------
//헤더 푸터가 위 아래에 붙어 있도록 하는 코드
//----------------------------------------------------------------------------------------- 
function contentHeightSet() {
	var windowH = window.innerHeight;
  var restH = document.querySelector('.header-wrap').offsetHeight + document.querySelector('.controller').offsetHeight;
  var gameBoxH = document.querySelector('.game').offsetHeight;
  var wrap = document.querySelector('.wrap');

  if(restH + gameBoxH > windowH) { //콘텐츠 + 헤더 + 푸터 높이가 브라우저 크기보다 넓어질 때
    wrap.classList.add("off");
  } else { 
    if(!wrap.classList.contains('off')){
      return;
    }
    wrap.classList.remove("off");
  } 
}
//-----------------------------------------------------------------------------------------
//뱀게임 전역 변수
//-----------------------------------------------------------------------------------------
var score = 0; //스코어
var state = '';
var speed = 280; //최초스피드
var LR = 0; // 좌우 방향
var TB = 1; // 위아래 방향
var scoreText = document.getElementsByClassName('score')[0]; //스코어텍스트
var eatSound = document.querySelector('.eat'); //사과먹는 사운드
var gameOverSound = document.querySelector('.gameover'); //게임오버 사운드

//클릭, 터치 이벤트 상태
var rightPressed = false; 
var leftPressed = false;
var upPressed = false;
var downPressed = false;

var mapSize = 17; //맵 크기

var gameInterval; //자동재생

var snake = new Array(); //뱀 변수
var prevSnake = new Array(); //이전 뱀 변수
var apple = new Array(); //사과 변수

var startX; //터치이벤트 x좌표 시작
var startY; //터치이벤트 y좌표 시작
var endX; //터치이벤트 x좌표 끝
var endY; //터치이벤트 y좌표 끝

// 난수 생성 함수 
function generateRandom (min, max) {
  var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
  return ranNum;
}
//-----------------------------------------------------------------------------------------
// 전체 초기화
//----------------------------------------------------------------------------------------- 
function initAll() {
  score = 0; // 점수 초기화
  speed = 290; // 속도 초기화
  scoreText.innerText="SNAKE GAME"; //점수에서 스네이크 게임 헤드명으로 변경

  initMap(); // 맵 초기화
  initSnake(); // init snake
  initApple(); // init apple
  LR = 0; // 좌우 방향 초기화, 1일때 play버튼 누르면 오른쪽으로 이동
  TB = 1; // 위아래 방향 초기화, 1일때 play버튼 누르면 아래로 이동

  rightPressed = false;
  leftPressed = false;
  downPressed = false;
  upPressed = false;

  document.querySelector('.wrap').classList.remove('end');
  document.querySelector('.btn-play').addEventListener('click', start);
}
//-----------------------------------------------------------------------------------------
// 맵 동적으로 생성
//-----------------------------------------------------------------------------------------
function initMap() {
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
}

//-----------------------------------------------------------------------------------------
// 스네이크 초기화
//----------------------------------------------------------------------------------------- 
function initSnake() {
  snake = [];
  snake.push([0, 0]);
  drawSnake();
}
//-----------------------------------------------------------------------------------------
// 스네이크 그리기
//----------------------------------------------------------------------------------------- 
function drawSnake() {
  state = '';
  // 기존 스네이크 픽셀 지우기 위한 소스
  var block = document.querySelectorAll('.snake');
  for (var i = 0; i <block.length; i++) { //전체 스네이크 지우기
    block[i].classList.remove("snake");
  }

  for(var i=0; i<snake.length; i++) {
    var bgRow = document.querySelector('#bg-row'+snake[i][0]+'_'+snake[i][1]);
    if(bgRow.classList.contains('snake')) { //몸에 부딪힐 때
      gameOverSound.currentTime = 0;
      gameOverSound.play();
      document.querySelector('.wrap').classList.add('end');
      document.querySelector('.restart').addEventListener('click', initAll);
      end();
    }
    bgRow.classList.add("snake");
    
    if(bgRow.classList.contains('apple')) { //apple먹을 때
      score++; //점수 추가
      eatSound.currentTime = 0;
      eatSound.play();
      speed = speed - score; //속도 증가
      end(); //인터벌 클리어
      start(); //재시작
      initApple(); //apple 초기화
      state = 'eat'; //state반영 
      scoreText.innerText="SCORE : " + score; //점수반영
    }
  }
  return state;
}
//-----------------------------------------------------------------------------------------
// 애플 초기화
//----------------------------------------------------------------------------------------- 
function initApple() {
  var snakeP = new Array(); //현재 스네이크의 위치를 배열에 담아 새로 생성될 애플의 위치에서 제외
  snakeP[0] = snake[0][0];
  snakeP[1] = snake[0][1];

  var x = '';
  var y = '';

  x = generateRandom(0,mapSize-1); //난수생성 
  y = generateRandom(0,mapSize-1);

  apple = [];
  apple.push([x, y]);
  drawApple();
}
//-----------------------------------------------------------------------------------------
// 애플 그리기
//----------------------------------------------------------------------------------------- 
function drawApple() {
  // 움직일 때 기존 애플 픽셀 지우기 위한 소스
  var block = document.querySelectorAll('.apple');
  if(block.length > 0) {
    block[0].classList.remove("apple");
  }

  for(var i=0; i<apple.length; i++) {
    var bgRow = document.querySelector('#bg-row'+apple[i][0]+'_'+apple[i][1]);
    if(bgRow.classList.contains('snake')){ //현재 스네이크 위치에 애플이 생성되었다면 초기화 후 다시 생성
      initApple();
    } else{
      bgRow.classList.add("apple");
    }
    
  }
}
//-----------------------------------------------------------------------------------------
// 클릭 이벤트
//----------------------------------------------------------------------------------------- 
function keyDownHandler(event) {
  switch (event.keyCode){
    case 39: //right
      if(leftPressed == false){ 
        right();
      }
      break;
    case 37: //left
      if(rightPressed == false){
        left();
      }
      break;
    case 40: //down
     if(upPressed == false){
        down();
      }
      break;
    case 38: //up
      if(downPressed == false){
        up();
      }
      break;
  }
}
//-----------------------------------------------------------------------------------------
// 터치 이벤트
//----------------------------------------------------------------------------------------- 
function touchStart(e) {
  startX = e.changedTouches[0].clientX;
  startY = e.changedTouches[0].clientY; 
  /*var restH = document.querySelector('.header-wrap').offsetHeight + document.querySelector('.footer-wrap').offsetHeight;
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight - restH;
  console.log('startX' + startX );
  console.log('startY' + startY );
 
  if(
    startX > windowWidth*2/3 
    && windowHeight/3 < startY < windowHeight*2/3 
    && leftPressed == false
    ) { //right
      rightPressed = true; 
      LR = 1;
      TB = 0;
      move();
      downPressed = false;
      upPressed = false;
  } else if(
    startX < windowWidth/3 
    && windowHeight/3 < startY < windowHeight*2/3 
    && rightPressed == false
    ) { //left
      leftPressed = true;
      LR = -1;
      TB = 0;
      move();
      downPressed = false;
      upPressed = false;
  } else if (
    startY > windowHeight*2/3 
    && windowWidth/3 < startX < windowWidth*2/3 
    && upPressed == false
    ) { //down
      downPressed = true;
      LR = 0;
      TB = 1;
      move();
      rightPressed = false;
      leftPressed = false;
  } else if (
    startY < windowHeight/3 + 90 //스코어 영역만큼 범위 추가
    && windowWidth/3 < startX < windowWidth*2/3 
    && downPressed == false) { //up
      upPressed = true;
      LR = 0;
      TB = -1;
      move();
      rightPressed = false;
      leftPressed = false;
  }*/
}
function touchEnd(e) {
  endX = e.changedTouches[0].clientX - startX;
  endY = e.changedTouches[0].clientY - startY;

  if(endX > 0 && endX > endY && leftPressed == false) {//right
    right();
  } else if(endX < 0 && endX < endY && rightPressed == false){ //left
    left();
  } else if(endY > 0 && endY > endX && upPressed == false) { //down
    down();
  } else if(endY < 0 && endY < endX && downPressed == false) {
    up();
  }
}
//-----------------------------------------------------------------------------------------
// 방향
//-----------------------------------------------------------------------------------------
function right() {
  rightPressed = true; 
  LR = 1;
  TB = 0;
  move();
  downPressed = false;
  upPressed = false;
}
function left() {
  leftPressed = true;
  LR = -1;
  TB = 0;
  move();
  downPressed = false;
  upPressed = false;
}
function down() {
  downPressed = true;
  LR = 0;
  TB = 1;
  move();
  rightPressed = false;
  leftPressed = false;
}
function up() {
  upPressed = true;
  LR = 0;
  TB = -1;
  move();
  rightPressed = false;
  leftPressed = false;
}
//-----------------------------------------------------------------------------------------
// 움직이기
//----------------------------------------------------------------------------------------- 
function move() {
  var head = new Array();
  head[0] = snake[0][0];
  head[1] = snake[0][1];

  var x = head[0]+1*TB;
  if(x >= 0 && x < mapSize) {
      head[0] = x;
  }else {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
      document.querySelector('.wrap').classList.add('end');
      end();
      document.querySelector('.restart').addEventListener('click', initAll);
      return;
  }

  var y = head[1]+1*LR;
  
  if(y >= 0 && y < mapSize) {
    head[1] = y;
  } else {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    document.querySelector('.wrap').classList.add('end');
    end();
    document.querySelector('.restart').addEventListener('click', initAll);
    return;
  }
  snake.unshift(head);
  if(state != 'eat') { //애플을 먹은 상태가 아니면 스네이크 배열 팝
    snake.pop();
  }
  drawSnake();
}
//-----------------------------------------------------------------------------------------
// 인터벌 시작과 끝
//----------------------------------------------------------------------------------------- 
function start() {
  gameInterval = setInterval(move, speed);
  scoreText.innerText="SCORE : 0"; //점수초기화
  document.addEventListener('keydown', keyDownHandler, false); //클릭이벤트
  document.addEventListener('touchstart', touchStart, false); //터치시작이벤트
  document.addEventListener('touchend', touchEnd, false); //터치종료이벤트
  document.querySelector('.btn-play').removeEventListener('click', start); //시작버튼
}
function end() {
  clearInterval(gameInterval);
  document.removeEventListener('keydown', keyDownHandler, false); //클릭이벤트
  document.removeEventListener('touchstart', touchStart, false); //터치시작이벤트
  document.removeEventListener('touchend', touchEnd, false); //터치종료이벤트
}
