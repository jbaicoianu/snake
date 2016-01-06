/** 
 * A simple game of Snake to demonstrate Elation Engine
 */

elation.require([
    'engine.engine', 'engine.things.light', 'engine.things.label',
    'snake.level', 'snake.camera', 'snake.snake', 'snake.target', 'snake.message',
    'engine.external.three.three',
  ], function() {
  // load font separately
  elation.require('snake.fonts.Graph 35+ pix_Regular');

  elation.component.add('snake.game', function() {
    this.initWorld = function() {
      this.currentlevel = 0;
      this.currenttarget = 1;
      this.lives = 5;

      // Create all the different things which make up the world
      var things = this.world.load({
        name: 'world',
        type: 'generic',
        things: {
          'sun': {
            name: 'sun',
            type: 'light',
            properties: {
              type: 'directional',
              intensity: .5,
              position: [-10, 12, 25],
              collidable: false
            }
          },
          'lamp': {
            name: 'lamp',
            type: 'light',
            properties: {
              type: 'point',
              position: [10, -5, 50],
              intensity: 0.3,
              collidable: false
            }
          },
          'camera': {
            name: 'camera',
            type: 'snake_camera',
            properties: {
              position: [0, 0, 50],
              collidable: false
            }
          },
          'level': {
            name: 'level',
            type: 'snake_level',
            properties: {
              collidable: false, // temporary
              level: this.currentlevel,
              position: [-40,-25,0]
            },
            things: {
              'player': {
                name: 'player',
                type: 'snake_snake',
                properties: {
                  position: [0, 0, 0]
                }
              },
              'target': {
                name: 'target',
                type: 'snake_target',
              }
            }
          },
          'score': {
            name: 'score',
            type: 'label',
            properties: {
              position: [-30, 26, 0],
              text: '0',
              size: 1.5,
              thickness: 1,
              //font: 'Repetition Scrolling'
              font: 'Graph 35+ pix',
              collidable: false
            }
          },
          'lives': {
            name: 'lives',
            type: 'label',
            properties: {
              position: [30, 26, 0],
              text: 'Sammy--> Lives: ' + this.lives,
              size: 1.5,
              thickness: 1,
              //font: 'Repetition Scrolling',
              font: 'Graph 35+ pix',
              align: 'right',
              collidable: false
            }
          },
          'highscore': {
            name: 'highscore',
            type: 'label',
            properties: {
              position: [30, -29, 0],
              text: 'High Score: 0',
              size: 1.5,
              thickness: 1,
              //font: 'Repetition Scrolling',
              font: 'Graph 35+ pix',
              align: 'right',
              collidable: false
            }
          },
          'lastscore': {
            name: 'lastscore',
            type: 'label',
            properties: {
              position: [30, -32, 0],
              text: 'Last Score: 0',
              size: 1.5,
              thickness: 1,
              //font: 'Repetition Scrolling',
              font: 'Graph 35+ pix',
              align: 'right',
              collidable: false
            }
          },
          'messagebox': {
            name: 'messagebox',
            type: 'snake_message',
            properties: {
              position: [0, 0, 2],
              text: "Level 1, Push Space",
              size: 1,
              thickness: 1,
              border: 1,
              //font: 'Repetition Scrolling',
              font: 'Graph 35+ pix',
              align: 'center',
              verticalalign: 'middle',
              collidable: false
            }
          }
        }
      });

      // Retain references for later use
      this.camera = things.children.world.children.camera;
      this.level = things.children.world.children.level;
      this.player = this.level.children.player;
      this.target = this.level.children.target;
      this.scorelabel = things.children.world.children.score;
      this.highscorelabel = things.children.world.children.highscore;
      this.lastscorelabel = things.children.world.children.lastscore;
      this.liveslabel = things.children.world.children.lives;
      this.messagebox = things.children.world.children.messagebox;

      // Set up scores
      this.score = 0;
      this.highscore = 0;
      this.lastscore = 0;
      if (localStorage['snake.lastscore']) {
        this.setLastScore(localStorage['snake.lastscore']);
      }
      if (localStorage['snake.highscore']) {
        this.setHighScore(localStorage['snake.highscore']);
      }

      elation.events.add(this.level, 'level_load', elation.bind(this, this.reset));
      elation.events.add(this.target, 'collide', elation.bind(this, this.advance));

      // Activate the camera
      this.engine.systems.render.views.main.setactivething(this.camera);

      this.controls = this.engine.systems.controls.addContext('world', {
        'pause': ['keyboard_p', elation.bind(this, this.pause)],
      });
      this.engine.systems.controls.activateContext('world');
      // Start it up!
      this.messagebox.showPrompt("Difficulty (1-99)?").then(elation.bind(this, function(difficulty) { 
        this.setSpeed(difficulty);
        this.advanceLevel();
        this.tick();
      }));
    }
    this.reset = function(ev) {
      // Put the game board back in its starting state
      if (!ev || ev.value === undefined || ev.value === 0) {
        this.player.properties.startpos.set(this.level.properties.startpos.x, this.level.properties.startpos.y, 0);
        this.player.reset();
        //this.setSpeed(1);
        var newtargetpos = this.getNewTargetPosition();
        this.target.properties.position.set(newtargetpos[0], newtargetpos[1], 0);
        this.currenttarget = 1;
        this.target.setLabel(this.currenttarget);
      }
    }
    this.pause = function(ev) {
      if (!ev || ev.value == 1) {
        this.player.disable();
        this.messagebox.showMessage("Game Paused ... Push Space").then(elation.bind(this, function() { this.player.enable(); }));
      }
    }
    this.die = function() {
      this.player.stop();
      this.player.disable();

      this.setLives(this.lives - 1);
      this.setScore(this.score - 1000);

      this.messagebox.showMessage("Sammy Dies! Push Space! --->").then(elation.bind(this, function() { 
        if (this.lives <= 0) {
          if (this.score > this.highscore) {
            this.setHighScore(this.score);
          }
          this.setLastScore(this.score);
          this.messagebox.showMessage("G A M E   O V E R\n\nPlay Again?   (Y/N)").then(elation.bind(this, function() {
            this.currentlevel = 0;
            this.setLives(5);
            this.setScore(0);
            this.reset(); 
            this.advanceLevel();
          }));
        } else {
          this.reset(); 
          this.player.enable();
          this.player.begin(this.level.properties.startdir);
        }
      }));
    }
    this.advance = function() {
      // Update score display
      this.setScore(this.score + this.currenttarget * 100);
      // Increase the difficulty by one level
      this.currenttarget++;

      if (this.currenttarget < 10) {
        var newtargetpos = this.getNewTargetPosition();
        this.target.properties.position.set(newtargetpos[0], newtargetpos[1], 0);
        this.target.setLabel(this.currenttarget);
        //this.setSpeed(this.currenttarget);
        this.player.setLength(this.currenttarget);
      } else {
        this.player.stop();
        this.player.dissolve();
        this.advanceLevel();
      }
    }
    this.advanceLevel = function() {
      this.currentlevel++;
      this.currenttarget = 1;
      this.level.loadLevel(this.currentlevel);
      this.player.disable();
      this.messagebox.showMessage("Level " + this.currentlevel + ", Push Space").then(elation.bind(this, function() { 
        this.player.enable();
        this.player.begin(this.level.properties.startdir);
      }));
    }
    this.getNewTargetPosition = function() {
      // Pick a new spot for the target which isn't touching the snake or the walls
      var newtargetpos = false;
      while (!newtargetpos || this.player.isTouching(newtargetpos[0], newtargetpos[1]) || this.level.getBlock(newtargetpos[0], this.level.map.length - 1 - newtargetpos[1]) == 'W') {
        newtargetpos = [Math.floor(Math.random() * (this.level.map[0].length - 2)) + 1, Math.floor(Math.random() * (this.level.map.length - 2)) + 1];
      }
      return newtargetpos;
    }
    this.setSpeed = function(speed) {
      // Determine speed from a formula based on the current level
      //var realspeed = 20 + Math.pow(Math.log(speed + 1), 2);
      var realspeed = speed;
      this.gamespeed = realspeed;
      this.player.properties.speed = realspeed;
    }
    this.setScore = function(score) {
      this.score = score;
      this.scorelabel.setText(score);
    }
    this.setLives = function(lives) {
      this.lives = lives;
      this.liveslabel.setText("Sammy--> Lives: " + lives);
    }
    this.setLastScore = function(score) {
      this.lastscore = score;
      this.lastscorelabel.setText('Last Score: ' + score);
      localStorage['snake.lastscore'] = this.lastscore;
    }
    this.setHighScore = function(score) {
      this.highscore = score;
      this.highscorelabel.setText('High Score: ' + score);
      if (!localStorage['snake.highscore'] || this.highscore > localStorage['snake.highscore']) {
        localStorage['snake.highscore'] = this.highscore;
      }
    }
    this.tick = function() {
      // Main game loop
      this.checkCollisions(this.player.lastmovedir);
      this.player.update();

      setTimeout(elation.bind(this, this.tick), 1000 / (this.gamespeed * this.player.properties.speedmultiplier));
    }
    this.checkCollisions = function(move) {
      // Who's touching who?
      var ppos = [Math.round(this.player.properties.position.x), Math.round(this.level.map.length - 1 - this.player.properties.position.y)];
      var block = this.level.getBlock(ppos[0], ppos[1]);
      var colliding = (this.player.isMoving() && block == 'W') || this.player.isCollidingWithSelf();
      if (colliding) {
        this.die();
      }
    }
  }, elation.engine.client);
});
