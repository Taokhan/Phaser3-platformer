import Phaser from "phaser";
import sky from "./assets/sky.png";
import platfroms from "./assets/Terrain/platform.png";
import star from "./assets/star.png";
import bomb from "./assets/Enemy/bomb.png";
import bullet from "./assets/bullet.png";
import dude from "./assets/player/Idle.png";
import dudeRight from "./assets/player/Right.png";
import dudeLeft from "./assets/player/Left.png";
import dudeJump from "./assets/player/Jump.png";
import dudeHit from "./assets/player/Hit.png";
import ground from "./assets/Terrain/ground.png";
import bombOn from "./assets/Enemy/bomb-on.png";

class MyGame extends Phaser.Scene {
  constructor() {
    super();
    this.lastShotTime = 0; // time of the last shot
    this.bombs = null;
    this.stars = null;
    this.platforms = null;
    this.ground = null;
    this.bullet = null;
  }

  preload() {
    this.load.image("sky", sky);
    this.load.image("platfroms", platfroms);
    this.load.image("star", star);
    this.load.image("bomb", bomb);
    this.load.image("bullet", bullet);
    this.load.image("jump", dudeJump);
    this.load.image("ground", ground);
    this.load.spritesheet("bombOn", bombOn, {
      frameWidth: 38,
      frameHeight: 38,
    });

    this.load.spritesheet("dude", dude, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("right", dudeRight, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("left", dudeLeft, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("hit", dudeHit, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.add.image(400, 300, "sky");
    this.platforms = this.physics.add.staticGroup();
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 590, "ground").refreshBody();
    this.player = this.physics.add.sprite(100, 550, "dude");
    this.player.setBounce(0.2);
    this.player.setBodySize(20, 32, true);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.ground);
    
    
    this.bombs = this.physics.add.group();
    this.stars = this.physics.add.group();
    generatePlatforms(this.platforms, 15);
    generateStars(this.stars,1);
    generateEnemy(this.bombs,5);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.stars, this.ground);
    this.physics.add.overlap(this.player, this.stars, collect, null, this);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.bombs, this.ground);
    this.physics.add.collider(this.stars, this.bombs);

    this.physics.add.collider(this.player, this.bombs, bombTouched, null, this);
    //animation
    this.anims.remove("right");
    this.anims.remove("left");
    this.anims.remove("hit");
    this.anims.remove("bombOn");
    this.anims.remove("turn");
    this.anims.remove("jump");
    this.anims.create({
      key: "turn",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 10 }),
      frameRate: 20,
    });
    this.anims.create({
      key: "jump",
      frames: [{ key: "jump", frame: 0 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("right", { start: 0, end: 11 }),
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("left", { start: 0, end: 11 }),
    });
    this.anims.create({
      key: "hit",
      frames: this.anims.generateFrameNumbers("hit", { start: 0, end: 6 }),
    });
    this.anims.create({
      key: "bombOn",
      frames: this.anims.generateFrameNumbers("bombOn", { start: 0, end: 7 }),
      frameRate: 120,
      repeat: -1,
    });
    this.bombs.children.iterate(function (child) {
      child.setVelocityX(Phaser.Math.FloatBetween(-50, 50));
      child.setBounce(1);
      child.setCollideWorldBounds(true);
      child.anims.play("bombOn", true);
    });
    // animation end
    
    // generate bombs
    function generateEnemy(bombs,count) {
      const stepX = 750/count;
      bombs.clear(true, true);
      bombs.createMultiple({
        key: "bomb",
        repeat: count,
        setXY: { x: 12, y: 0, stepX: stepX },
      });
      
    }
    
    // generate stars
    function generateStars(stars,count) {
      const stepX = 750/count;
      stars.clear(true, true);
      stars.createMultiple({
        key: "star",
        repeat: count,
        setXY: { x: 12, y: 0, stepX: stepX },
      });
      stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });
    }

    // platform generator
    function generatePlatforms(platforms, count) {
      platforms.clear(true, true);
      const canvasWidth = 800;
      const canvasHeight = 600;
      const groundWidth = 64;
      const groundHeight = 64;

      for (let i = 0; i < count; i++) {
        let randomX, randomY;
        let overlapping;

        do {
          randomX = Phaser.Math.RND.between(
            groundWidth / 2,
            canvasWidth - groundWidth / 2
          );
          randomY = Phaser.Math.RND.between(
            120 + groundHeight / 2,
            canvasHeight - groundHeight
          );

          overlapping = false;

          platforms.children.each(function (platform) {
            if (
              Phaser.Math.Distance.Between(
                randomX,
                randomY,
                platform.x,
                platform.y
              ) < groundWidth
            ) {
              overlapping = true;
            }
          });
        } while (overlapping);

        platforms.create(randomX, randomY, "platfroms");
      }
    }

    function bombTouched(player, bomb) {
      player.anims.play("hit", true);

      this.time.addEvent({
        delay: 100,
        callback: () => {
          this.player.setTint(0xff000);
          this.physics.pause();
          this.add.text(250, 300, "GAME OVER", {
            fontSize: "50px",
            fill: "red",
            fontFamily: "Arial",
          });
          this.time.addEvent({
            delay: 200,
            callback: () => {
              
              this.scene.stop();
              this.scene.start(this)
            },
          });
        },
      });
    }

    //score text
    const scoreText = this.add.text(15, 15, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
    let score = 0;
    //stars collision
    function collect(player, star) {
      star.disableBody(true, true);
      score += 1;
      scoreText.setText("Score: " + score);

      if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });

        // var x =
        //   player.x < 400
        //     ? Phaser.Math.Between(400, 800)
        //     : Phaser.Math.Between(0, 400);
        //need to implement new enemys and upgrades
        // this.bombs.create(x, 16, "bomb");
        // this.bombs.setBounce(1);
        // this.bombs.setCollideWorldBounds(true);
        // this.bombs.setVelocity(Phaser.Math.Between(100, 200), 100);
      }
    }
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn", true);
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
      this.player.anims.play("jump", true);
    }

    if (cursors.space.isDown && this.time.now > this.lastShotTime + 1000) {
      this.bullet = this.physics.add.sprite(
        this.player.x,
        this.player.y,
        "bullet",
        0
      );
      this.bullet.setScale(0.03);
      this.lastShotTime = this.time.now;

      if (cursors.left.isDown) {
        this.bullet.setData("direction", -1); // Set bullet direction to left
        this.bullet.body.velocity.x = -800;
      } else if (cursors.right.isDown) {
        this.bullet.setData("direction", 1); // Set bullet direction to right
        this.bullet.body.velocity.x = 800;
      } else {
        this.bullet.setData("direction", 1); // Set bullet direction to right
        this.bullet.body.velocity.x = 800;

        // Set bullet direction to stationary
      }
      this.physics.add.collider(this.bullet, this.bombs, (bullet, bomb) => {
        this.bullet.destroy();
        this.bombs.getChildren().find((b) => b === bomb).destroy();
        // Add logic here for any additional actions when a bullet hits a bomb
      });

      // set timer to destroy bullet
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.bullet.destroy();
        },
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 450 },
      debug: false,
    },
  },
  scene: MyGame,
};

const game = new Phaser.Game(config);
