var canvasContext, ball, player1, player2, framesPerSec = 11122.31;

// Convert [x,y] coordinates to [r,theta] polar coordinates
function polar(x,y) {
    return [Math.sqrt(x*x+y*y), Math.atan2(y,x)];
}
// Convert polar to Cartesian coordinates
function cartesian(r,theta) {
    return [r*Math.cos(theta), r*Math.sin(theta)];
}
function random(start,end){//Returns a random number from start to end, both included
    return Math.floor(Math.random() * (end - start + 1)) + start;
}
Array.prototype.randItem = function (){
    return this[random(0,this.length - 1)]
}


    const canvas = document.getElementById('gameMain');
    canvasContext = canvas.getContext('2d');
    var gameOn = true
    function calculateMousePos(evt) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        var mouseX = evt.clientX - rect.left - root.scrollLeft;
        var mouseY = evt.clientY - rect.top - root.scrollTop;
        return {
            x:mouseX,
            y:mouseY
        };
    }
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
            height: 195,
            width: 19
        }
        this.speed = 2;
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
        this.directions = ['up','down']
        this.direction = this.directions.randItem();//either up or down
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
                this.speed = 0;//Reset speed
                this.direction = 'down';//Adjust the direction
            }else if(this.position.y >= canvas.height - this.size.height){
                this.position.y = canvas.height - this.size.height;//Adjust position
                this.speed = 0;//Reset speed
                this.direction = 'up';//Adjust the direction
            }

            canvasContext.fillStyle = this.color;
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height);
        }

        this.move = function (args){
            if(args && typeof args == 'object'){
                if(args.position && typeof args.position == 'object'){
                    if(args.position.y > this.position.y){//Told it to move up
                        if(this.direction == 'down') this.direction = 'up';//Change the direction, if necessary
                    }else{//Told it to move down
                        if(this.direction == 'up') this.direction = 'down';//Change the direction, if necessary
                    }
                    //Clear his former location
                    this.disappear()
                    //Update speed
                    this.speed = args.position.y - this.position.y;
                    (this.speed < 0) ? this.direction = 'up' : this.direction = 'down';
                }else{
                    if(args.speed && typeof args.speed == 'number' && speed > 0){
                        this.speed += args.speed;
                    }
                    if(args.direction && typeof args.direction == 'string' && args.direction != this.direction){
                        this.direction = args.direction;//Reverse the direction
                    }
                }
            }

            //Update the position based on the direction
            if(this.direction === 'up') this.position.y -= Math.abs(this.speed);
            if(this.direction === 'down') this.position.y += Math.abs(this.speed);

            this.show();
            console.log(this.speed)
        }

        this.disappear = function (){
            canvasContext.fillStyle = 'black';
            canvasContext.fillRect(this.position.x,this.position.y,this.size.width,this.size.height);
            console.log(this.speed)
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
        this.rad = random(10,15);
        this.position = {
            x: canvas.width / 2,
            dx: 0,
            y: canvas.height / 2,
            dy: 0,
        }
        //Perception
        this.touched = {
            bool: false,//This records the state if he has touched anything...wall or balls
            objects: [],//Array of all the objects this player has touched
        }
        this.directions = ['inc','red'];//increase or reduce
        //Set directions randomly
        this.direction = {
            theta: random(0,360) * Math.PI / 180,//Random angle less between 0 and 360 degrees converted to radians
            x: this.directions.randItem(),
            y: this.directions.randItem()
        }    
        this.calcTheta = function (){
            this.direction.theta = Math.atan(this.position.dy,this.position.dx);
        }
        this.speed = random(19,19);
        this.decelerate = function(){
            if(this.speed > 0){
                this.speed -= 9;
                this.speed = (this.speed < 0) ? 0 : this.speed;//Ensure that it will not be negative
            }
        }
        this.accelerate = function (speed){
            if(speed && typeof speed == 'number' && speed > 0){
                this.speed += speed;
            }
        }
        this.show = function (position){
            if(this.position.x === null || this.position.y === null){
                //Set the positions
                this.position.x = random(this.rad, canvas.width - this.rad);
                this.position.y = random(this.rad, canvas.height - this.rad);

                //Show the ball
                canvasContext.fillStyle = this.color;
                canvasContext.beginPath();
                canvasContext.arc(this.position.x,this.position.y,this.rad,0,Math.PI*2,true);
                canvasContext.fill();
                return
            }
            
            if(position && typeof position == 'object'){
                this.position = position;//Update
            }

            /**
             * Choose the direction, and the change in speed
             * based on the object this ball interacts
             */
            var directionChanged = false;
            //Relative to players
            if(!directionChanged){
                var player;
                var suposedX = this.position.x, suposedY = this.position.y;//initialize the suposed values on both cordinates, needed for speed change calculation
                //Determine player to check interaction with
                if(this.position.x > canvas.width / 2){//Right player
                    player = Player.instances[1];
                    if(this.position.y < player.position.y){//If above height range of player
                        if(this.rad >= Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2)){//Touched player
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x))
                            this.position.x = (canvas.width - player.size.width) - this.rad;//Adjust position
                            //Change direction
                            if(this.direction.theta < (Math.PI / 2)){
                                this.direction.theta = Math.PI - this.direction.theta;
                            }else if(this.direction.theta > ((3 * Math.PI) / 2)){
                                this.direction.theta = (3 * Math.PI) - this.direction.theta;
                            }
                            //Using parallelogram law of vectors, Adjust direction and speed
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x)),
                                thetaChange = (thetaS - this.direction.theta) / 2,
                                thetaResultant = thetaS - thetaChange,//The direction inmpacted on the ball by the player, based on the rSpeed below following parallelogram law of vectors
                                lineVC = Math.sqrt((player.position.y - this.position.y)**2 + (player.position.x - this.position.x)**2),//The speed inmpacted on the ball by the player
                                rSpeed = Math.sqrt(
                                    this.speed**2 + lineVC**2 - (
                                        2 * this.speed * lineVC * Math.cos(
                                            Math.PI - thetaChange
                                        )
                                    )
                                );
                            this.speed = rSpeed;
                            this.direction.theta = thetaResultant;

                           // console.log('above right player @ ' + thetaS, Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2) )
                        }
                    }else if(player.position.y <= this.position.y && this.position.y <= (player.position.y + player.size.height)){//If within the height rnage of player
                        if(this.position.x >= (canvas.width - player.size.width) - this.rad){//Touched player
                            this.position.x = (canvas.width - player.size.width) - this.rad;//Adjust position
                            if(this.direction.theta < (Math.PI / 2)){
                                this.direction.theta = Math.PI - this.direction.theta;
                            }else if(this.direction.theta > ((3 * Math.PI) / 2)){
                                this.direction.theta = (3 * Math.PI) - this.direction.theta;
                            }
                        }
                        // console.log('within range of right player')
                    }else if(this.position.y > (player.position.y + player.size.height)){//If below it
                        if(this.rad >= Math.sqrt((player.position.x - this.position.x)**2 + ((player.position.y + player.size.height) - this.position.y)**2)){//Touched player
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x))
                            this.position.x = (canvas.width - player.size.width) - this.rad;//Adjust position
                            //Change direction
                            if(this.direction.theta < (Math.PI / 2)){
                                this.direction.theta = Math.PI - this.direction.theta;
                            }else if(this.direction.theta > ((3 * Math.PI) / 2)){
                                this.direction.theta = (3 * Math.PI) - this.direction.theta;
                            }
                            //Using parallelogram law of vectors, Adjust direction and speed
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x)),
                                thetaChange = (thetaS - this.direction.theta) / 2,
                                thetaResultant = thetaS - thetaChange,//The direction inmpacted on the ball by the player, based on the rSpeed below following parallelogram law of vectors
                                lineVC = Math.sqrt((player.position.y - this.position.y)**2 + (player.position.x - this.position.x)**2),//The speed inmpacted on the ball by the player
                                rSpeed = Math.sqrt(
                                    this.speed**2 + lineVC**2 - (
                                        2 * this.speed * lineVC * Math.cos(
                                            Math.PI - thetaChange
                                        )
                                    )
                                );
                            this.speed = rSpeed;
                            this.direction.theta = thetaResultant;
                            
                           // console.log('below right player @ ' + thetaS, Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2) )
                        }
                    }
                }else{//Left player
                    player = Player.instances[0];
                    if(this.position.y < player.position.y){//If above height range of player
                        if(this.rad >= Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2)){//Touched player
                            this.position.x = this.rad + player.size.width;//Adjust position
                            //Change direction
                            if(this.direction.theta <= Math.PI){
                                this.direction.theta = Math.PI - this.direction.theta;
                            }else if(this.direction.theta > Math.PI){
                                this.direction.theta = (3 * Math.PI) - this.direction.theta;
                            }
                            //Using parallelogram law of vectors, Adjust direction and speed
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x)),
                                thetaChange = (thetaS - this.direction.theta) / 2,
                                thetaResultant = thetaS - thetaChange,//The direction inmpacted on the ball by the player, based on the rSpeed below following parallelogram law of vectors
                                lineVC = Math.sqrt((player.position.y - this.position.y)**2 + (player.position.x - this.position.x)**2),//The speed inmpacted on the ball by the player
                                rSpeed = Math.sqrt(
                                    this.speed**2 + lineVC**2 - (
                                        2 * this.speed * lineVC * Math.cos(
                                            Math.PI - thetaChange
                                        )
                                    )
                                );
                            this.speed = rSpeed;
                            this.direction.theta = thetaResultant;
                            
                           // console.log('above left player @ ' + thetaS, Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2) )
                        }
                    }else if(player.position.y <= this.position.y && this.position.y <= (player.position.y + player.size.height)){//If within the height rnage of player
                        if(this.position.x <= this.rad + player.size.width){//Touched player
                            this.position.x = this.rad + player.size.width;//Adjust position
                            if(this.direction.theta <= Math.PI){
                                this.direction.theta = Math.PI - this.direction.theta;
                            }else if(this.direction.theta > Math.PI){
                                this.direction.theta = (3 * Math.PI) - this.direction.theta;
                            }
                        }
                        // console.log('within range of left player')
                    }else{//If below it
                        if(this.rad >= Math.sqrt((player.position.x - this.position.x)**2 + ((player.position.y + player.size.height) - this.position.y)**2)){//Touched player
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x))
                            this.position.x = this.rad + player.size.width;//Adjust position
                            //Change direction
                            if(this.direction.theta <= Math.PI){
                                this.direction.theta = Math.PI - this.direction.theta;
                            }else if(this.direction.theta > Math.PI){
                                this.direction.theta = (3 * Math.PI) - this.direction.theta;
                            }
                            //Using parallelogram law of vectors, Adjust direction and speed
                            var thetaS = Math.atan((player.position.y - this.position.y) / (player.position.x - this.position.x)),
                                thetaChange = (thetaS - this.direction.theta) / 2,
                                thetaResultant = thetaS - thetaChange,//The direction inmpacted on the ball by the player, based on the rSpeed below following parallelogram law of vectors
                                lineVC = Math.sqrt((player.position.y - this.position.y)**2 + (player.position.x - this.position.x)**2),//The speed inmpacted on the ball by the player
                                rSpeed = Math.sqrt(
                                    this.speed**2 + lineVC**2 - (
                                        2 * this.speed * lineVC * Math.cos(
                                            Math.PI - thetaChange
                                        )
                                    )
                                );
                            this.speed = rSpeed;
                            this.direction.theta = thetaResultant;
                            
                           // console.log('below left player @ ' + thetaS, Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2) )
                        }
                    }
                }
                //Moving at what direction
                if(this.position.dx < 0){//Moving left
                    player = Player.instances[0];
                    //console.log(this.position.dx, Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2))                
                }else{//moing right
                    player = Player.instances[1];
                    //console.log(this.position.dx, Math.sqrt((player.position.x - this.position.x)**2 + (player.position.y - this.position.y)**2))                    
                }
            }
            //Relative to screen
            if(!directionChanged){//Adjust the postion so the player will not go off the screen, and change his direction if necessary
                //Moving side-ways
                var suposedX = this.position.x, suposedY = this.position.y;//initialize the suposed values on both cordinates
                if(this.position.x <= this.rad){//Left wall
                    /*
                    if(this.direction.theta <= Math.PI){
                        this.direction.theta = Math.PI - this.direction.theta;
                    }else if(this.direction.theta > Math.PI){
                        this.direction.theta = (3 * Math.PI) - this.direction.theta;
                    }*/
                    this.position.x = this.rad;//Adjust position
                    gameOn = false
                }else if(this.position.x >= canvas.width - this.rad){//Right wall
                    /*
                    if(this.direction.theta < (Math.PI / 2)){
                        this.direction.theta = Math.PI - this.direction.theta;
                    }else if(this.direction.theta > ((3 * Math.PI) / 2)){
                        this.direction.theta = (3 * Math.PI) - this.direction.theta;
                    }*/
                    gameOn = false
                }
                //Moving up or down
                if(this.position.y <= this.rad){//Up wall
                    this.position.y = this.rad;//Adjust position
                    this.direction.theta = (2 * Math.PI) - this.direction.theta;
                }else if(this.position.y >= canvas.height - this.rad){//Down wall
                    this.position.y = canvas.height - this.rad;//Adjust position
                    this.direction.theta = (2 * Math.PI) - this.direction.theta;
                }
                ///** Calculate speed change*/ and update the speed based on it's larger side
                var awaySpeed = Math.sqrt(
                    (suposedX - this.position.x)**2 + (suposedY - this.position.y)**2
                ),
                withinSpeed = this.speed - awaySpeed;
                //this.speed = (awaySpeed > withinSpeed) ? awaySpeed : withinSpeed;
            }      

            canvasContext.fillStyle = this.color;
            canvasContext.beginPath()
            canvasContext.arc(this.position.x,this.position.y,this.rad,0,Math.PI*2)
            canvasContext.fill();

            /*
            console.log((function(d){
                if(d.dx > 0 && d.dy > 0) return 'rightDown'
                if(d.dx > 0 && d.dy < 0) return 'rightUp'
                if(d.dx < 0 && d.dy < 0) return 'leftUp'
                if(d.dx < 0 && d.dy > 0) return 'leftDown'
                if(d.dx < 0) return 'left'
                if(d.dx > 0) return 'right'
                if(d.dy > 0) return 'Down'
                if(d.dy < 0) return 'Up'
            }(this.position)))*/
        }

        this.move = function (direction){//Direction will be an object with x and y properties be either neg or pos
            if(this.position.x === null || this.position.y === null){
                this.show();//Call show so it will decide the position
                return;
            }
            var [dispX,dispY] = cartesian(this.speed, this.direction.theta);//Calculate how far it should move on both cordinate based on the three variablesv
            
            var [posX,posY] = [this.position.x,this.position.y];//Clone the position x and y property,.. we need this to calc dx and dy... this is done since the show() method will still use the previous value
            //Chose the direction
            if(direction){
                
            }
            //Set the positions and the changes on the x and y cordinate
            this.position.x += dispX;//Update current x cordinate
            this.position.dx = this.position.x - posX ;//Update change on the x cordinate

            this.position.y += dispY;//Update current y cordinate
            this.position.dy = this.position.y - posY ;//Update change on the x cordinate

            //Update the position
            this.show()
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
        Ball.instances.push(this);

        /*
        Ball.instances[this.name] = this;
        Ball.instances.length++;//Increase the length
        */
    }
    Ball.instances = [];//This will hold all the balls formed
    /*
    Ball.instances = {};//This will hold all the balls formed
    Object.defineProperties(Ball.instances,{
        length: {
            value: 0,
        },
        forEach: {
            value: function(f){
                for(var ball in this) f.call(this,this[ball])
            },
        },
    })
    */

    function addBall(name,color){
        new Ball(name,color);//Add the member
    }

    //Init Balls
    const colors = ['white','blue','green','yellow','pink']
    var totalBalls = 1;
    for(var i = 1;i <= totalBalls; i++){
        let ballName = 'ball' + i;
        addBall(ballName,colors.randItem());
    }
   
    function addRandomBall(){
        var ballIndex = Ball.instances.length + 1;
        var ballName = 'ball' + ballIndex;
        addBall(ballName,colors.randItem()); 
    }

    function drawAll (){
        /** Place the show() method and every draw instance here, so that they can
         *  overwrite their previous state
         */
        //Draw the screen
        drawCanvas()
        if(gameOn){
            //Draw the balls˝
            Ball.instances.forEach((ball)=>{
                ball.move()
            });
            //Show the players
            Player.instances.forEach((player)=>{
                player.show()
            })
        }else{
            //Draw the balls˝
            Ball.instances.forEach((ball)=>{
                ball.show()
            });
            //Show the players with different color
            Player.instances.forEach((player)=>{
                player.color = 'pink'
                player.show()
            })
        }
       // console.log(Ball.instances.ball1.position.y - yer.position.y)
    }
    
	canvas.addEventListener('mousemove', (evt) => {
        var mousePos = calculateMousePos(evt);
        var player;
        //Player to move
        if(mousePos.x > canvas.width / 2){//Right player
            player = Player.instances[1]

        }else{//Left player
            player = Player.instances[0]
        }

        var newPosition = {y: mousePos.y - (player.size.height / 2), }
        player.move({position: newPosition})
    });

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
    var draw = setInterval(drawAll,1000 / framesPerSec)

    document.getElementById('moveBalls').addEventListener('click',()=>moveBalls(),true);
    document.getElementById('moveBallsUp').addEventListener('click',()=>moveBalls({x:0,y:'red'}),true);
    document.getElementById('moveBallsDown').addEventListener('click',()=>moveBalls({x:0,y:'inc'}));

    document.getElementById('addRandomBall').addEventListener('click',()=>addRandomBall(),true);

