
document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
  
  initAll();
  contentHeightSet();
  window.onresize = function() {
    contentHeightSet();
  };
});
  
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// 난수 생성 함수 
function generateRandom (min, max) {
  var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
  return ranNum;
}

// 뱀게임 전역변수
var score = 0;
var state = '';
var LR = 0; // 좌우 방향
var TB = 1; // 위아래 방향

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

var mapSize = 17; 

var gameInterval;


// 맵 동적으로 생성
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

// 헤더 푸터 콘텐츠 크기 
function contentHeightSet() {
	var windowH = window.innerHeight;
  var restH = document.querySelector('.header-wrap').offsetHeight + document.querySelector('.footer-wrap').offsetHeight + document.querySelector('.controller').offsetHeight;
  var gameBox = document.querySelector('.game');
  var innerBoxH = gameBox.offsetHeight;
  var wrap = document.querySelector('.wrap');

  if(restH + innerBoxH > windowH) { //콘텐츠 + 헤더 + 푸터 높이가 브라우저 크기보다 넓어질 때
    wrap.classList.add("off");
  } else { 
    if(!wrap.classList.contains('off')){
      return;
    }
    wrap.classList.remove("off");
  } 
}

// snake 
var snake = new Array();

//food 

var food = new Array();

// init snake 
function initSnake() {
  var x = '';
  var y = '';

  x = generateRandom(0,mapSize-1);
  y = generateRandom(0,mapSize-1);
  snake = [];
  snake.push([x, y]);
  drawSnake();
}

// draw snake
function drawSnake() {
  // 움직일 때 기존 스네이크 픽셀 지우기 위한 소스
  var block = document.querySelectorAll('.snake');
  if(block.length > 0) {
    block[0].classList.remove("snake");
  }

  for(var i=0; i<snake.length; i++) {
    var bgRow = document.querySelector('#bg-row'+snake[i][0]+'_'+snake[i][1]);
    bgRow.classList.add("snake");

  }
}

// 뱀 움직이기
function left() {
  LR = -1;
  TB = 0;
}
function right() {
  LR = 1;
  TB = 0;
}
function up() {
  LR = 0;
  TB = -1;
}
function down() {
  LR = 0;
  TB = 1;
}

function keyDownHandler(event) {
  if(event.keyCode == 39) {
      rightPressed = true;
      right();
      move();
  }
  else if(event.keyCode == 37) {
      leftPressed = true;
      left();
      move();
  }
  if(event.keyCode == 40) {
    downPressed = true;
    down();
    move();
  }
  else if(event.keyCode == 38) {
    upPressed = true;
    up();
    move();
  }
}

function keyUpHandler() {
  rightPressed = false;
  leftPressed = false;
  downPressed = false;
  upPressed = false;
}

function move() {
  var head = new Array();
  head[0] = snake[0][0];
  head[1] = snake[0][1];

  var x = head[0]+1*TB;
  if(x >= 0 && x < mapSize) {
      head[0] = x;
  }else {
      alert('벽입니다.');
      initAll();
      return;
  }

  var y = head[1]+1*LR;
  
  if(y >= 0 && y < mapSize) {
    head[1] = y;
  } else {
    alert('벽입니다.');
    initAll();
    return;
  }
  snake = [];
  snake.push([x, y]);
  drawSnake();
}

// 초기화
function initAll() {
  score = 0; // 점수 초기화
  initMap(); // 맵 초기화
  //initFood(); // 먹이 초기화
  initSnake(); // init snake
  LR = 0; // 좌우 방향 초기화
  TB = 1; // 위아래 방향 초기화
}