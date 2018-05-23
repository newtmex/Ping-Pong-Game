var canvasContext, ball, player1, player2, frameRate = 1000 / 7;

function random(start,end){//Returns a random number from start to end, both included
    return Math.floor(Math.random() * end) + start;
}


var Ball = function (name,color){
    this.color = color;
    this.name = name;
    this.position = {
        x: Math.floor(Math.random() * 790),
        y: Math.floor(Math.random() * 590),
        rad: 176,
    }

    this.directions = [,'pos','neg'];
    //Set directions randomly
    this.direction = {
        x: this.directions[Math.floor(Math.random() * 2) + 1],
        y: this.directions[Math.floor(Math.random() * 2) + 1]
    }    

    this.speed = Math.floor(Math.random() * 5) + 3
    this.show = function (position){
        if(position){
            this.position = position;//Update

            canvasContext.fillStyle = this.color;
            canvasContext.beginPath()
            canvasContext.arc(this.position.x,this.position.y,this.position.rad,0,Math.PI*2,true)
            canvasContext.fill()
            return
        }
        canvasContext.fillStyle = this.color;
        canvasContext.beginPath()
        canvasContext.arc(this.position.x,this.position.y,this.position.rad,0,Math.PI*2,true)
        canvasContext.fill()
    }

    this.move = function (direction){//Direction will be an object with x and y properties be either neg or pos
        var displacement = 4;
        var position = this.position;//Clone the position property, this is done since the show() method will still use the previous value
        //Chose the direction
        if(direction){
            switch(direction.x){//For x
                case 'pos': position.x += displacement;
                    break;
                case 'neg': position.x -= displacement;
                    break;
                case 0: //Change nothing
                    break;
                default://Use the previous case
                    (this.direction.x === 'pos') ? position.x += displacement : position.x -= displacement;
            }
            switch(direction.y){//For y
                case 'pos': position.y += displacement;
                    break;
                case 'neg': position.y -= displacement;
                    break;
                case 0: //Change nothing
                    break;
                default://Use the previous case
                    (this.direction.y === 'pos') ? position.y += displacement : position.y -= displacement;
            }
        }else{
            (this.direction.x === 'pos') ? position.x += displacement : position.x -= displacement;
            (this.direction.y === 'pos') ? position.y += displacement : position.y -= displacement;            
        }

        //Ensure that the position is not off canvas
        //Update the position
        this.show(position)
    }

    this.autoMove = function (){//Direction will be an object with x and y properties be either neg or pos
        var displacement = this.speed;
        var position = this.position;//Clone the position property, this is done since the show() method will still use the previous value
        //Choose the direction
            switch(this.direction.x){//For x
                case 'pos': position.x += displacement;
                    if(position.x + this.position.rad >= 800) this.direction.x = 'neg';//toggle direction
                    break;
                case 'neg': position.x -= displacement;
                    if(position.x - this.position.rad <= 0) this.direction.x = 'pos';//toggle direction
                    break;
                default://Use the previous case
                    (this.direction.x === 'pos') ? position.x += displacement : position.x -= displacement;
            }
            switch(this.direction.y){//For y
                case 'pos': position.y += displacement;
                    if(position.y + this.position.rad >= 600) this.direction.y = 'neg';//toggle direction
                    break;
                case 'neg': position.y -= displacement;
                    if(position.y - this.position.rad <= 0) this.direction.y = 'pos';//toggle direction
                    break;
                default://Use the previous case
                    (this.direction.y === 'pos') ? position.y += displacement : position.y -= displacement;
            }
        //Update the position
        this.show(position)
    }
}

Ball.instances = {};//This will hold all the balls formed
Object.defineProperties(Ball.instances,{
    length: {
        value: 0,
        writable: true
    },
    forEach: {
        value: function(f){
            for(var ball in this) f.call(this,this[ball])
        },
    },
})

function addBall(name,color){
    Ball.instances[name] = new Ball(name,color);//Add the member
    Ball.instances.length++;//Increase the length
}


//Init Balls
const colors = [,'white','blue','green','yellow','pink']
var totalBalls = 1;
for(var i = 1;i <= totalBalls; i++){
    let ballName = 'ball' + i;
   addBall(ballName,colors[random(1,colors.length - 1)]);
}

window.onload = function(){

    const canvas = document.getElementById('gameMain');
    canvasContext = canvas.getContext('2d');

    //Object to hold players behaviours and state
    var Player = function(id){

        this.size = {
            height: 190,
            width: 19
        }

        if(id === 2) {
            this.position = {
                x: canvas.width - this.size.width,
                y: 210
            }
        }

        if(id === 1) {
            this.position = {
                x: 0,
                y: 210
            }
        }

        this.directions = [,'up','down']
        this.direction = this.directions[random(1,2)];

        this.show = function (){
            canvasContext.fillStyle = 'red';
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height)
        }

        this.move = function (direction){
            var y = 4;
            //Change the color of the previous draw to the background
            canvasContext.fillStyle = 'black';
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height);

            if(direction === 'up') y *= -1;//Reverse the direction

            //Update the position
            this.position.y += y;//Change the y coordinate
            canvasContext.fillStyle = 'red';
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height)
        }

        this.autoMove = function (y){
            var y = y || 20;

            if(this.position.y <= 0) this.direction = 'down';//Reverse the direction
            if(this.position.y >= canvas.height - this.size.height) this.direction = 'up';//Reverse the direction

            if(this.direction === 'up') this.position.y -= y;
            if(this.direction === 'down') this.position.y += y;
            //Update the position
            canvasContext.fillStyle = 'red';
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height)
        }

        Player.instances.push(this)
    }
    Player.instances = [];

    //Init Players
    player1 = new Player(1);
    player2 = new Player(2);

    function drawAll (){
        /** Place the show() method and every draw instance here, so that they can
         *  overwrite their previous state
         */
    
        //Draw the screen
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0,0,canvas.width,canvas.height);

        //Draw the balls˝
        Ball.instances.forEach((ball)=>{
            ball.autoMove()
        });
            
        //Draw the players
        function playerSpeed(){
            return random(1,20);
        }
        Player.instances.forEach((player)=>{
            player.autoMove(playerSpeed())
        })
        
    }
    
    function moveBalls(direction){
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0,0,canvas.width,canvas.height);
    
        //Draw the balls˝
       if(direction){
            Ball.instances.forEach((ball)=>{
                ball.move(direction)
            });
       }else{ 
            Ball.instances.forEach((ball)=>{
                ball.autoMove()
            });
        }
            
        //Draw the players
        Player.instances.forEach((player)=>{
            player.show()
        })
    }
/*
    var direction = [,'up','down'];

    player1.direction = direction[Math.floor(Math.random() * 2) + 1]
    player2.direction = direction[Math.floor(Math.random() * 2) + 1]
*/
    var draw = setInterval(function(){
        drawAll();          
    },frameRate)

    document.getElementById('moveBalls').addEventListener('click',()=>moveBalls(),true);
    document.getElementById('moveBallsUp').addEventListener('click',()=>moveBalls({x:0,y:'pos'}),true);
    document.getElementById('moveBallsDown').addEventListener('click',()=>moveBalls({x:0,y:'neg'}));
}

    
function addRandomBall(){
    var ballIndex = Ball.instances.length + 1;
    var ballName = 'ball' + ballIndex;
    addBall(ballName,colors[random(1,colors.length - 1)]); 
}

