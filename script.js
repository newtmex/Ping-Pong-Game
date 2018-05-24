var canvasContext, ball, player1, player2, frameRate = 1000 / 17;
// Convert [x,y] coordinates to [r,theta] polar coordinates
function polar(x,y) {
    return [Math.sqrt(x*x+y*y), Math.atan2(y,x)];
}
// Convert polar to Cartesian coordinates
function cartesian(r,theta) {
    return [r*Math.cos(theta), r*Math.sin(theta)];
}
function random(start,end){//Returns a random number from start to end, both included
    return Math.floor(Math.random() * end) + start;
}

window.onload = function(){

    const canvas = document.getElementById('gameMain');
    canvasContext = canvas.getContext('2d');
    const movement = document.getElementById('movement');
    movementContext = movement.getContext('2d');
    movementContext.fillStyle = 'black';
    movementContext.fillRect(0,0,canvas.width,canvas.height);

    function drawCanvas(){
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0,0,canvas.width,canvas.height);
    }
    //Object to hold players behaviours and state
    var Player = function(id){

        //Identification props
        this.id = id;
        this.color = 'red';
        //Physical properties
        this.size = {
            height: 190,
            width: 19
        }
        this.speed = 20;
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
        /*
                this.occupiedArea = {
                    x
                }
        */
        this.directions = [,'up','down']
        this.direction = this.directions[random(1,2)];//either up or down
        //Perception
        this.touched = {
            bool: false,//This records the state if he has touched anything...wall or balls
            object: [],//Array of all the object this player has touched
        }
        //Behaviours
        /** Displays this player on the canvas
         * @param [position] => Object with x and y cordinates
         */
        this.show = function (position){
            if(position && typeof position == 'object'){
                this.position = position;
            }

            //Adjust the postion so the player will not go off the screen, and change his direction if necessary
            if(this.position.y <= 0){
                this.position.y = 0;//Adjust position
                this.direction = 'down';//Adjust the direction
            }
            if(this.position.y >= canvas.height - this.size.height){
                this.position.y = canvas.height - this.size.height;//Adjust position
                this.direction = 'up';//Adjust the direction
            }

            canvasContext.fillStyle = this.color;
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height);
        }

        this.move = function (direction,speed){
            if(speed && typeof speed == 'number' && speed > 0){
                this.speed += speed;
            }
            if(direction && typeof direction == 'string' && direction != this.direction){
                this.direction = direction;//Reverse the direction
            }

            //Update the position based on the direction
            if(this.direction === 'up') this.position.y -= Math.abs(this.speed);
            if(this.direction === 'down') this.position.y += Math.abs(this.speed);

            this.show();
        }

        //Take record of all instances
        Player.instances.push(this)
    }
    Player.instances = [];

    //Init Players
    player1 = new Player(1);
    player2 = new Player(2);

    var Ball = function (name,color){
        this.color = color;
        this.name = name;
        this.position = {
            rad: 13,
            x1: random(0,canvas.width),
            y1: random(0,canvas.height),
            x2: random(0,canvas.width),
            y2: random(0,canvas.height),
        }
        //Perception
        this.touched = {
            bool: false,//This records the state if he has touched anything...wall or balls
            objects: [],//Array of all the object this player has touched
        }
        this.directions = [,'inc','red'];//increase or reduce
        //Set directions randomly
        this.direction = {
            theta: Math.random() * Math.PI * 2,
            x: this.directions[Math.floor(Math.random() * 2) + 1],
            y: this.directions[Math.floor(Math.random() * 2) + 1]
        }    
        this.calcTheta = function (){
            var adj = Math.abs(this.position.x2 - this.position.x1), opp = Math.abs(this.position.y2 - this.position.y1);
            console.log(adj,opp)//this.direction.theta += (Math.PI * Math.tan(opp/adj)) / 180;
        }
        this.speed = Math.floor(Math.random() * 5) + 3;
        this.decelerate = function(){
            if(this.speed > 0){
                this.speed -= Math.random() * 3;
                this.speed = Math.abs(this.speed);//Ensure that it will not be negative
            }
        }
        this.accelerate = function (speed){
            if(speed && typeof speed == 'number' && speed > 0){
                this.speed += speed;
            }
        }
        this.show = function (position){
            if(position && typeof position == 'object'){
                this.position = position;//Update
            }

            //Adjust the postion so the player will not go off the screen, and change his direction if necessary
            if(this.position.x2 <= this.position.rad){
                this.position.x2 = this.position.rad;//Adjust position
                this.direction.x = 'inc';//Adjust the direction
            }
            if(this.position.x2 >= canvas.width - this.position.rad){
                this.position.x2 = canvas.width - this.position.rad;//Adjust position
                this.direction.x = 'red';//Adjust the direction
            }
            if(this.position.y2 <= this.position.rad){
                this.position.y2 = this.position.rad;//Adjust position
                this.direction.y = 'inc';//Adjust the direction
            }
            if(this.position.y2 >= canvas.height - this.position.rad){
                this.position.y2 = canvas.height - this.position.rad;//Adjust position
                this.direction.y = 'red';//Adjust the direction
            }
            
            canvasContext.fillStyle = this.color;
            canvasContext.beginPath()
            canvasContext.arc(this.position.x2,this.position.y2,this.position.rad,0,Math.PI*2,true)
            canvasContext.fill()
            this.calcTheta()
            console.log((function(d){
                if(d.x == 'inc' && d.y == 'inc') return 'rightDown'
                if(d.x == 'inc' && d.y == 'red') return 'rightUp'
                if(d.x == 'red' && d.y == 'red') return 'leftUp'
                if(d.x == 'red' && d.y == 'inc') return 'leftDown'
            }(this.direction)))
        }

        this.move = function (direction){//Direction will be an object with x and y properties be either neg or pos
            var [dispX,dispY] = cartesian(this.position.rad + this.speed, this.direction.theta);//Calculate how far it should move on both cordinate based on the three variablesv
            console.log(dispX,dispY);
            var position = this.position;//Clone the position property, this is done since the show() method will still use the previous value
            //Chose the direction
            if(direction){
                switch(direction.x){//For x
                    case 'inc':
                        position.x1 = position.x2;//Update previous  x cordinate
                        position.x2 += Math.abs(dispX);//Update current x cordinate
                        break;
                    case 'red':
                        position.x1 = position.x2;//Update previous  x cordinate
                        position.x2 -= Math.abs(dispX);//Update current x cordinate
                        break;
                    case 0: //Change nothing
                        break;
                    default://Use the previous case
                        if(this.direction.x === 'inc'){
                            position.x1 = position.x2;//Update previous  x cordinate
                            position.x2 += Math.abs(dispX);//Update current x cordinate
                        }else{
                            position.x1 = position.x2;//Update previous  x cordinate
                            position.x2 -= Math.abs(dispX);//Update current x cordinate
                        }
                }
                switch(direction.y){//For y
                    case 'inc':
                        position.y1 = position.y2;//Update previous  x cordinate
                        position.y2 += Math.abs(dispY);//Update current x cordinate
                        break;
                    case 'red':
                        position.y1 = position.y2;//Update previous  x cordinate
                        position.y2 -= Math.abs(dispY);//Update current x cordinate
                        break;
                    case 0: //Change nothing
                        break;
                    default://Use the previous case
                        if(this.direction.y === 'inc'){
                            position.y1 = position.y2;//Update previous  x cordinate
                            position.y2 += Math.abs(dispY);//Update current x cordinate
                        }else{
                            position.y1 = position.y2;//Update previous  x cordinate
                            position.y2 -= Math.abs(dispY);//Update current x cordinate
                        }
                }
            }else{
                if(this.direction.x === 'inc'){
                    position.x1 = position.x2;//Update previous  x cordinate
                    position.x2 += Math.abs(dispX);//Update current x cordinate
                }else{
                    position.x1 = position.x2;//Update previous  x cordinate
                    position.x2 -= Math.abs(dispX);//Update current x cordinate
                }
                if(this.direction.y === 'inc'){
                    position.y1 = position.y2;//Update previous  x cordinate
                    position.y2 += Math.abs(dispY);//Update current x cordinate
                }else{
                    position.y1 = position.y2;//Update previous  x cordinate
                    position.y2 -= Math.abs(dispY);//Update current x cordinate
                }        
            }

            //Ensure that the position is not off canvas
            //Update the position
            this.show(position)
        }

        this.autoMove = function (){//Direction will be an object with x and y properties be either neg or pos
            var displacement = this.speed;
            var position = this.position;//Clone the position property, this is done since the show() method will still use the previous value
            
            /**
             * Choose the direction
             */
            var directionChanged = false;

            //Relative to players
            if(!directionChanged){
                var player1 = Player.instances[0];
                var player2 = Player.instances[1];
                var touchedPlayer = {
                    bool: false,
                    who: {}
                }
                var closeToPlayer = false
                //Check if this is moving relatively to the right or to the left at this time, to 
                //determine which player it will interact with
                if(this.direction.x === 'inc'){//Moving right
                    //Check if it is close to player
                    var distanceFromPlayer = (canvas.width - player2.size.width) - (this.position.x + this.position.rad);
                    if(distanceFromPlayer <= 0){
                        if(player2.position.y <= this.position.y && this.position.y <= (player2.position.y + player2.size.height)){
                            touchedPlayer.bool = true;
                            touchedPlayer.who = player2;
                        }
                    }
                    if(touchedPlayer.bool){
                        this.direction.x = 'red';//toggle direction   
                        directionChanged = true;
                    }
                }else if(this.direction.x === 'red'){//Moving left
                    //Check if it is close to player
                    var distanceFromPlayer = (this.position.x - this.position.rad) - player1.size.width;
                    if(distanceFromPlayer <= 0){
                        if(player1.position.y <= this.position.y && this.position.y <= (player1.position.y + player1.size.height)){
                            touchedPlayer.bool = true;
                            touchedPlayer.who = player1;
                        }                   
                    }
                    if(touchedPlayer.bool){
                        this.direction.x = 'inc';//toggle direction   
                        directionChanged = true;  
                    }
                }

                if(touchedPlayer.bool){
                    this.accelerate(touchedPlayer.who.speed % this.speed);
                    
                }
            }
            //Relative to screen
            if(!directionChanged){
                switch(this.direction.x){//For x
                    case 'inc': position.x += displacement;
                        if(position.x + this.position.rad >= 800){//If it hits a wall
                            this.direction.x = 'red';//toggle direction
                            this.decelerate()//Any time a ball hits the wall its speed should reduce
                        }
                        break;
                    case 'red': position.x -= displacement;
                        if(position.x - this.position.rad <= 0){//If it hits a wall
                            this.direction.x = 'inc';//toggle direction
                            this.decelerate()//Any time a ball hits the wall its speed should reduce
                        }
                        break;
                    default://Use the previous case
                        (this.direction.x === 'inc') ? position.x += displacement : position.x -= displacement;
                }
                switch(this.direction.y){//For y
                    case 'inc': position.y += displacement;
                        if(position.y + this.position.rad >= 600){//If it hits a wall
                            this.direction.y = 'red';//toggle direction
                            this.decelerate()//Any time a ball hits the wall its speed should reduce
                        }
                        break;
                    case 'red': position.y -= displacement;
                        if(position.y - this.position.rad <= 0){//If it hits a wall
                            this.direction.y = 'inc';//toggle direction
                            this.decelerate()//Any time a ball hits the wall its speed should reduce
                        }
                        break;
                    default://Use the previous case
                        (this.direction.y === 'inc') ? position.y += displacement : position.y -= displacement;
                }
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
   
    function addRandomBall(){
        var ballIndex = Ball.instances.length + 1;
        var ballName = 'ball' + ballIndex;
        addBall(ballName,colors[random(1,colors.length - 1)]); 
    }

    function drawAll (){
        /** Place the show() method and every draw instance here, so that they can
         *  overwrite their previous state
         */
    
        //Draw the screen
        drawCanvas()
        //Draw the balls˝
        Ball.instances.forEach((ball)=>{
            ball.move()
        });
            
        //Draw the players
        function playerSpeed(){
            return 3;
        }
        Player.instances.forEach((player)=>{
            player.move()
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
    document.getElementById('moveBallsUp').addEventListener('click',()=>moveBalls({x:0,y:'red'}),true);
    document.getElementById('moveBallsDown').addEventListener('click',()=>moveBalls({x:0,y:'inc'}));

    document.getElementById('addRandomBall').addEventListener('click',()=>addRandomBall(),true);
}

 

