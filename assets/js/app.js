// select canvas element
const canvas = document.getElementById("myCanvas");
const start = document.getElementById("start");
const startPre = document.getElementById("start-pre");

var comp_score;
var user_score;

start.addEventListener('click', function(){
    user.score = 0;
    com.score = 0;
    localStorage.setItem('user score', user.score);
    localStorage.setItem('computer score', com.score);

    game();
    let loop = setInterval(game,1000/framePerSecond);//FPS is used to measure frame rate – the number of consecutive full-screen images that are displayed each second.
     // 50 times every one second
});
startPre.addEventListener('click',function(){
    comp_score = JSON.parse(localStorage.getItem('computer score'));
    user_score = JSON.parse(localStorage.getItem('user score'));
    user.score = user_score;
    com.score = comp_score;
    game();
    let loop = setInterval(game,1000/framePerSecond);

});

// getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
const ctx = canvas.getContext('2d');

// load sounds
let hit = new Audio(); //paddel
let wall = new Audio();  // top and bottom
let userScore = new Audio(); // for comp side score
let comScore = new Audio();  // for user side score

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// User Paddle
class Layout{
    constructor(x,y,color,width,height,score){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.score= score;
        this.color=color;
    }
}
const user = new Layout(0,(canvas.height - 100)/2,"WHITE",10,100,0);

// COM Paddle
const com = new Layout(canvas.width - 10,(canvas.height - 100)/2,"WHITE",10,100,0);

// NET
const net = new Layout((canvas.width - 2)/2,0,"WHITE",2,10,null);

// Ball object
class Ball extends Layout{
    constructor(x,y,color, radius, velocityX, velocityY, speed){
        super(x, y, color);
        this.radius= radius;
        this.velocityX=velocityX;
        this.velocityY=velocityY;
        this.speed=speed;
    }
    
} 
const ball = new Ball(canvas.width/2, canvas.height/2, "WHITE", 10, 5, 5, 7);

// draw a rectangle, will be used to draw paddles
function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// draw circle, will be used to draw the ball
function drawArc(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);// boolean if for the direction of drawing if true counter clockwise //oposite of clock direction
    ctx.closePath();
    ctx.fill();
}

// listening to the mouse
canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt){
    let rect = canvas.getBoundingClientRect();
    
    user.y = evt.clientY - rect.top - user.height/2; // clientY tells the vertical position of the mouse
}

// when COM or USER scores, we reset the ball
function resetBall(){
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 12;
}

// draw the net
function drawNet(){
    for(let i = 0; i <= canvas.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// draw text
function drawText(text,x,y){
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

// collision detection
function collision(b,p){
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// update function, the function that does all calculations
function update(){//the game start its direction will be in the positive direction
     
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
    if( ball.x - ball.radius < 0 ){
        com.score++;
        localStorage.setItem('computer score', com.score);
        comScore.play();
        resetBall();

    }else if( ball.x + ball.radius > canvas.width){
        user.score++;
        localStorage.setItem('user score', user.score);
        userScore.play();
        resetBall();
    }
    
    // the ball has a velocity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // computer plays for itself, and we must be able to beat it
    // simple AI
    com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    
    // when the ball collides with bottom and top walls we inverse the y velocity.
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
        ball.velocityY = -ball.velocityY;
        wall.play();
    }
    
    // we check if the paddle hit the user or the com paddle
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com; // if else
    
    // if the ball hits a paddle
    if(collision(ball,player)){ // player is paddel
        // play sound
        hit.play();// with paddel
        // we check where the ball hits the paddle
        let collidePoint = (ball.y - (player.y + player.height/2));
        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        // -player.height/2 < collide Point < player.height/2
        collidePoint = collidePoint / (player.height/2);
        
        // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
        // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
        // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
        // Math.PI/4 = 45degrees
        let angleRad = (Math.PI/4) * collidePoint; //range -1 -1 times 45deg
        
        // change the X and Y velocity direction
        let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad); //if ball hit the user paddel dirextion +ve else -ve
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // speed up the ball everytime a paddle hits it.
        ball.speed += 0.1;
    }
}

// render function, the function that does al the drawing
function render(){
     //when we call render screen clear and start from the updated position
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    
    // draw the user score to the left
    drawText(user.score,canvas.width/4,canvas.height/5);
    
    // draw the COM score to the right
    drawText(com.score,3*canvas.width/4,canvas.height/5);
    
    // draw the net
    drawNet();
    
    // draw the user's paddle
    drawRect(user.x, user.y, user.width, user.height, user.color);
    
    // draw the COM's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}
function game(){
    update();
    render();
}
// number of frames per second
let framePerSecond = 50;

//call the game function 50 times every 1 Sec

render();
