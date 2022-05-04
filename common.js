
document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
  
  initAll();
  contentHeightSet();
  window.onresize = function() {
    contentHeightSet();
  };
  document.querySelector('.btn-play').addEventListener('click', start);
});
  
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

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

// snake 
var snake = new Array();
var prevSnake = new Array();
//apple 
var apple = new Array();

// init snake 
function initSnake() {
  snake = [];
  snake.push([0, 0]);
  drawSnake();
}

// draw snake
function drawSnake() {
  state = '';
  // 기존 스네이크 픽셀 지우기 위한 소스
  var block = document.querySelectorAll('.snake');
  for (var i = 0; i <block.length; i++) {
    block[i].classList.remove("snake");
  }
  //$('span').removeClass('snake');

  for(var i=0; i<snake.length; i++) {
    //console.log(snake + '/' + snake.length);
    var bgRow = document.querySelector('#bg-row'+snake[i][0]+'_'+snake[i][1]);
    bgRow.classList.add("snake");
    
    if(bgRow.classList.contains('apple')) { //apple먹을 때
      score++; //점수 추가
      initApple(); //apple 초기화
      state = 'eat'; //state반영 
    }
  }
  return state;
}

// init apple 
function initApple() {
  var snakeP = new Array(); //현재 스네이크의 위치를 배열에 담아 새로 생성될 애플의 위치에서 제외
  snakeP[0] = snake[0][0];
  snakeP[1] = snake[0][1];

  var x = '';
  var y = '';

  x = generateRandom(0,mapSize-1); //난수생성 
  y = generateRandom(0,mapSize-1);

  if (x == snakeP[0] && y == snakeP[1]) { //현재 스네이크의 위치와 같다면
    x = generateRandom(0,mapSize-1); //난수생성 
    y = generateRandom(0,mapSize-1);
  } else {
    apple = [];
    apple.push([x, y]);
    drawApple();
  }
}

// draw apple
function drawApple() {
  // 움직일 때 기존 애플 픽셀 지우기 위한 소스
  var block = document.querySelectorAll('.apple');
  if(block.length > 0) {
    block[0].classList.remove("apple");
  }

  for(var i=0; i<apple.length; i++) {
    var bgRow = document.querySelector('#bg-row'+apple[i][0]+'_'+apple[i][1]);
    bgRow.classList.add("apple");
  }
}

function keyDownHandler(event) {
  if(event.keyCode == 39) { //right
      rightPressed = true; 
      LR = 1;
      TB = 0;
      move();
  }
  else if(event.keyCode == 37) { //left
      leftPressed = true;
      LR = -1;
      TB = 0;
      move();
  }
  if(event.keyCode == 40) { //down
    downPressed = true;
    LR = 0;
    TB = 1;
    move();
  }
  else if(event.keyCode == 38) { //up
    upPressed = true;
    LR = 0;
    TB = -1;
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
      alert('띠용');
      end();
      initAll();
      return;
  }

  var y = head[1]+1*LR;
  
  if(y >= 0 && y < mapSize) {
    head[1] = y;
  } else {
    alert('띠용');
    end();
    initAll();
    return;
  }
  snake.unshift(head);
  if(state == 'eat') {
    //initApple();
    //snake.push([x, y]);
    drawSnake();
    //console.log(snake + '/' + snake.length + '/' + state);
  } else {
    snake.pop();
    drawSnake();
    //console.log(snake + '/' + snake.length + '/' + state);
  }
}

function start() {
  gameInterval = setInterval(move, 150);
}

function end() {
  clearInterval(gameInterval);
}
// 초기화
function initAll() {
  score = 0; // 점수 초기화
  initMap(); // 맵 초기화
  initSnake(); // init snake
  initApple(); // init apple
  LR = 0; // 좌우 방향 초기화
  TB = 1; // 위아래 방향 초기화
}