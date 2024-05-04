class Shooter extends Phaser.Scene{

    constructor(){
        super("Gallery");
        this.my = {sprite: {}};
        this.my.sprite.bullet = [];
        this.my.sprite.enemyBullet = [];
        this.my.sprite.yellowDucks = [];
        this.my.sprite.brownDucks = [];
        this.my.sprite.targets = [];
        this.maxBullets = 1;
        this.score = 0;
        this.scoreboard;
        this.timer = 60;
        this.timerOn = true;
        this.timeLimit = 60;
        this.timeboard;
        this.timeout = 0;
        this.finishText1;
        this.finishText2;
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.image("player", "ship_0005.png");
        this.load.image("duckBrown", "duck_outline_brown.png");
        this.load.image("duckYellow", "duck_outline_yellow.png");
        this.load.image("target", "target_red2_outline.png");
        this.load.image("bulletGold", "icon_bullet_gold_long.png");
        this.load.image("bulletSilver", "icon_bullet_silver_long.png");
        this.load.image("blast01", "shot_blue_small.png");
        this.load.image("blast02", "shot_blue_large.png");
        this.load.audio("hitSound", "impactPunch_medium_004.ogg");
        this.load.audio("gotHit", "impactPlate_medium_004.ogg");
    }

    create(){
        let my = this.my;

        my.sprite.player = this.add.sprite(game.config.width/2, game.config.height-40, "player");
        my.sprite.player.setScale(2);

        this.anims.create({
            key: "hit",
            frames: [
                {key: "blast01"},
                {key: "blast02"},
            ],
            framerate:15,
            hideOnComplete: true,
        });
        
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 10;
        this.bulletSpeed = 10;
        this.targetSpeed = 1.5;
        this.brownDuckSpeed = 2;
        this.yellowDuckSpeed = 2.5;

        this.scoreboard = this.add.text(10, 450, "Score: " + this.score,
        {
            fontSize: 32,
            fontFamily: 'Patrick Hand SC',
        });
        this.scoreboard.setText("Score: " + this.score);
        this.timeboard = this.add.text(10, 500, "Time: " + this.timeLimit + "s",
        {
            fontSize: 32,
            fontFamily: 'Patrick Hand SC',
        });
        this.finishText1 = this.add.text(game.config.width/2, game.config.height/2 - 50, "Time's Up!",
        {
            fontSize: 64,
            fontFamily: 'Patrick Hand SC',
        });
        this.finishText2 = this.add.text(game.config.width/2, game.config.height/2 + 50, "Final Score: " ,
        {
            fontSize: 40,
            fontFamily: 'Patrick Hand SC',
        });
        this.finishText1.setOrigin(.5, .5);
        this.finishText2.setOrigin(.5, .5);
        this.finishText1.visible = false;
        this.finishText2.visible = false;

        this.init_game();
        

        document.getElementById('description').innterHTML = '<h2>Shooter.js</h2><br>A: left, D: right, Space: shoot'
    }

    update(){
        let my = this.my;

        //pause game and show score when times up
        if(this.timeLimit <= 0){
            this.timeout++;
            this.timerOn = false;
            this.scoreboard.visible = false;
            this.timeboard.visible = false;
            this.finishText1.visible = true;
            this.finishText2.visible = true;
            this.finishText2.setText("Final Score: " + this.score);
            for (let duck of my.sprite.targets){
                duck.x = game.config.width + 50;
            }
            for (let duck of my.sprite.brownDucks){
                duck.x = -50;
            }
            for (let duck of my.sprite.yellowDucks){
                duck.x = game.config.width + 50;
            }
            for (let bullet of my.sprite.bullet) {
                bullet.y = -50;
            }
            for (let bullet of my.sprite.enemyBullet) {
                bullet.y = game.config.height + 50;
            }
        }

        if(this.timerOn == false && this.timeout > 60 && Phaser.Input.Keyboard.JustDown(this.space)){
            this.scene.start("TitleScreen");
        }

        //Movement
        if(this.left.isDown && this.timerOn == true){
            if(my.sprite.player.x > (my.sprite.player.displayWidth/2)){
                my.sprite.player.x -= this.playerSpeed;
            }
        }
        if(this.right.isDown && this.timerOn == true){
            if(my.sprite.player.x < (game.config.width - (my.sprite.player.displayWidth/2))){
                my.sprite.player.x += this.playerSpeed;
            }
            
        }

        if(this.timeout == 0 && Phaser.Input.Keyboard.JustDown(this.space)){
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "bulletGold")
                );
            }
        }

        //Move bullets
        for (let bullet of my.sprite.bullet) {
            bullet.setScale(.5);
            bullet.y -= this.bulletSpeed;
        }
        for (let bullet of my.sprite.enemyBullet) {
            bullet.setScale(.5);
            bullet.flipY = true;
            bullet.y += this.bulletSpeed;
        }


        //clear bullets
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));
        my.sprite.enemyBullet = my.sprite.enemyBullet.filter(
            (bullet) => bullet.y < game.config.height + (bullet.displayHeight/2)
        );

        //create targets on a timer
        this.timer++;
        if(this.timer >= 60 && this.timerOn == true){
            my.sprite.targets.push(this.add.sprite(-50, 50, "target"));
            my.sprite.brownDucks.push(this.add.sprite(game.config.width+50, 100, "duckBrown"));
            my.sprite.yellowDucks.push(this.add.sprite(-50, 150, "duckYellow"));
            this.timer = 0;
            this.timeLimit -= 1;
            // this.score++;
        }
        //make ducks fire bullets
        if(this.timer % 10 == 0){
            for(let duck of my.sprite.yellowDucks){
                if(Math.random() < .1){
                    my.sprite.enemyBullet.push(this.add.sprite(duck.x, duck.y + duck.displayHeight/2, "bulletSilver"));
                }
            }
        }

        // //move all targets
        for(let duck of my.sprite.targets){
            duck.setScale(.4);
            duck.x += this.targetSpeed;
        }
        for(let duck of my.sprite.brownDucks){
            duck.setScale(.4);
            duck.x -= this.brownDuckSpeed;
            duck.flipX = true;
        }
        for(let duck of my.sprite.yellowDucks){
            duck.setScale(.4);
            duck.x += this.yellowDuckSpeed;
        }

        //clear targets
        // my.sprite.targets = my.sprite.targets.filter((target) => target.x > (game.config.width + target.displayWidth));
        // my.sprite.brownDucks = my.sprite.brownDucks.filter((duck) => duck.x < -duck.displayWidth);
        // my.sprite.yellowDucks = my.sprite.yellowDucks.filter((duck) => duck.x > (game.config.width + duck.displayWidth));


        //handle collisions for player bullet
        //I think this is o(n^2) but I don't know how to optimize it
        for (let bullet of my.sprite.bullet) {
            for (let duck of my.sprite.yellowDucks){
                if (this.collides(duck, bullet)){
                    this.sound.play("hitSound");
                    this.hit = this.add.sprite(duck.x, duck.y, "blast01").setScale(1.5).play("hit");
                    bullet.y = -100;
                    duck.x = game.config.width + 100;
                    this.score += 50;
                }
            }
            for (let duck of my.sprite.brownDucks){
                if (this.collides(duck, bullet)){
                    this.sound.play("hitSound");
                    this.hit = this.add.sprite(duck.x, duck.y, "blast01").setScale(1.5).play("hit");
                    bullet.y = -100;
                    duck.x = -100;
                    this.score += 75;
                }
            }
            for (let duck of my.sprite.targets){
                if (this.collides(duck, bullet)){
                    this.sound.play("hitSound");
                    this.hit = this.add.sprite(duck.x, duck.y, "blast01").setScale(1.5).play("hit");
                    bullet.y = -100;
                    duck.x = game.config.width + 100;
                    this.score += 125;
                }
            }
        }

        for (let bullet of my.sprite.enemyBullet){
            if (this.collides(bullet, my.sprite.player)){
                this.sound.play("gotHit");
                this.hit = this.add.sprite(bullet.x, bullet.y, "blast01").setScale(1.5).play("hit");
                bullet.y = game.config.height + 100;
                this.score -= 150;
            }
        }

        this.scoreboard.setText("Score: " + this.score);
        this.timeboard.setText("Time: " + this.timeLimit + "s");
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    init_game(){
        this.score = 0;
        this.timer = 60;
        this.timerOn = true;
        this.timeLimit = 60;
        this.timeout = 0;
        this.scoreboard.visible = true;
        this.timeboard.visible = true;
        this.finishText1.visible = false;
        this.finishText2.visible = false;
    }
}