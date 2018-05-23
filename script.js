var canvasContext, ball, player1, player2;

//Object to hold players behaviours and state
var Player = function(id){

    if(id === 2) {
        this.position = {
            x: 790,
            y: 210
        }
    }

    if(id === 1) {
        this.position = {
            x: 0,
            y: 210
        }
    }

    this.size = {
        height: 100,
        width: 10
    }

    this.direction = 'down';

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
        //Change the color of the previous draw to the background
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height);

        if(this.position.y <= 0) this.direction = 'down';//Reverse the direction
        if(this.position.y >= 500) this.direction = 'up';//Reverse the direction

        if(this.direction === 'up') this.position.y -= y;
        if(this.direction === 'down') this.position.y += y;
        //Update the position
        canvasContext.fillStyle = 'red';
        canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height)
    }
}

var Ball = function (color){
    this.color = color;
    this.position = {
        x: Math.floor(Math.random() * 790),
        y: Math.floor(Math.random() * 590),
        rad: 7,
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
        //Change the color of the previous draw to the background
            canvasContext.fillStyle = 'white';
            canvasContext.beginPath()
            canvasContext.arc(this.position.x,this.position.y,this.position.rad,0,Math.PI*2,true)
            canvasContext.fill()

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
                default://Use the previous case
                    (this.direction.x === 'pos') ? position.x += displacement : position.x -= displacement;
            }
            switch(direction.y){//For y
                case 'pos': position.y += displacement;
                    break;
                case 'neg': position.y -= displacement;
                    break;
                default://Use the previous case
                    (this.direction.y === 'pos') ? position.y += displacement : position.y -= displacement;
            }
        }else{
            (this.direction.x === 'pos') ? position.x += displacement : position.x -= displacement;
            (this.direction.y === 'pos') ? position.y += displacement : position.y -= displacement;            
        }
        //Update the position
        this.show(position)
    }

    this.autoMove = function (){//Direction will be an object with x and y properties be either neg or pos
        var displacement = this.speed;
        var position = this.position;//Clone the position property, this is done since the show() method will still use the previous value
        //Choose the direction
            switch(this.direction.x){//For x
                case 'pos': position.x += displacement;
                    if(position.x + displacement >= 800) this.direction.x = 'neg';//toggle direction
                    break;
                case 'neg': position.x -= displacement;
                    if(position.x + displacement <= 0) this.direction.x = 'pos';//toggle direction
                    break;
                default://Use the previous case
                    (this.direction.x === 'pos') ? position.x += displacement : position.x -= displacement;
            }
            switch(this.direction.y){//For y
                case 'pos': position.y += displacement;
                    if(position.y + displacement >= 600) this.direction.y = 'neg';//toggle direction
                    break;
                case 'neg': position.y -= displacement;
                    if(position.y + displacement <= 0) this.direction.y = 'pos';//toggle direction
                    break;
                default://Use the previous case
                    (this.direction.y === 'pos') ? position.y += displacement : position.y -= displacement;
            }
        //Update the position
        this.show(position)
    }
}

//Init Players
player1 = new Player(1);
player2 = new Player(2);

//Init Balls
ball1 = new Ball('white');
ball2 = new Ball('blue');
ball3 = new Ball('green');
ball4 = new Ball('yellow');
ball5 = new Ball('pink');
ball6 = new Ball('white');
ball7 = new Ball('blue');
ball8 = new Ball('green');
ball9 = new Ball('yellow');
ball11 = new Ball('pink');

window.onload = function(){
    const canvas = document.getElementById('gameMain');
    canvasContext = canvas.getContext('2d');

    //Draw the screen
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0,0,canvas.width,canvas.height);

    player1.show();
    player2.show();
    
    ball1.show();
    ball2.show();
    ball3.show();
    ball5.show();
    ball4.show();ball6.show();
    ball7.show();
    ball8.show();
    ball9.show();
    ball11.show();

    var direction = [,'up','down'];

    player1.direction = direction[Math.floor(Math.random() * 2) + 1]
    player2.direction = direction[Math.floor(Math.random() * 2) + 1]
    setInterval(function(){
        var rand1 = Math.floor(Math.random() * 20) + 1;
        var rand2 = Math.floor(Math.random() * 20) + 1;
        rand1 -= rand1 % 2;
        rand2 -= rand2 % 2;
        player1.autoMove(rand1);
        player2.autoMove(rand2);

        ball1.autoMove();        
        ball2.autoMove();        
        ball3.autoMove();        
        ball4.autoMove();        
        ball5.autoMove();ball6.autoMove();        
        ball7.autoMove();        
        ball8.autoMove();        
        ball9.autoMove();        
        ball11.autoMove();          
        console.log(ball1.speed)
    },1110)
}