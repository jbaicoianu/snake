/** 
 * A simple game of Snake to demonstrate Elation Engine
 */

elation.require([
    'engine.engine', 'engine.things.light', 'engine.things.label',
    'snake.level', 'snake.camera', 'snake.snake', 'snake.target', 'snake.message', 'snake.indicator',
    'engine.external.three.three',
  ], function() {
  // load font separately
  elation.require('snake.fonts.Graph 35+ pix_Regular');

  elation.component.add('snake.game', function() {
    this.initWorld = function() {
      this.currentlevel = 0;
      this.currenttarget = 1;
      this.gamespeed = localStorage['snake.settings.difficulty'] || 16;
      this.numplayers = 1;
      this.player = [];

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
              position: [30, 27, 0],
              text: ' ',
              size: 1.5,
              thickness: 1,
              //font: 'Repetition Scrolling',
              font: 'Graph 35+ pix',
              align: 'right',
              verticalalign: 'bottom',
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
      //this.player = this.level.children.player;
      //this.target = this.level.children.target;
      this.scorelabel = things.children.world.children.score;
      this.highscorelabel = things.children.world.children.highscore;
      this.lastscorelabel = things.children.world.children.lastscore;
      this.liveslabel = things.children.world.children.lives;
      this.messagebox = things.children.world.children.messagebox;

      elation.events.add(this.level, 'level_load', elation.bind(this, this.reset));

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

      // Activate the camera
      this.engine.systems.render.views.main.setactivething(this.camera);

      this.controls = this.engine.systems.controls.addContext('world', {
        'pause': ['keyboard_p', elation.bind(this, this.pause)],
      });
      this.engine.systems.controls.activateContext('world');
      // Start it up!
      this.messagebox.showMessage( "Elation Snake!\n \n Navigate your snake around the game board trying\n to eat up numbers while avoiding running into walls\n or other snakes.  The more numbers you eat up, the\n more points you gain and the longer your snake becomes.\n\n\n\n\n\n\n\n\nPush Space to play!").then(elation.bind(this, function() { 
        this.player[0] = this.level.spawn('snake_snake', 'player1', { controls: 'player1' });
        if (this.numplayers > 1) {
          this.player[1] = this.level.spawn('snake_snake', 'player2', { controls: 'player2', color: 0xff00ff, name: 'Jake'});
        }
        this.target = this.level.spawn('snake_target', 'target', { position: [0,0,0] });

        elation.events.add(this.target, 'collide', elation.bind(this, this.advance));
        elation.events.add(this.player, 'die', elation.bind(this, this.die));

        this.advanceLevel();
        this.tick();
      }));
      this.messagebox.spawn('snake_indicator', 'music', {
              position: [-30, -10, 1],
              icon: "music",
              label: "Music",
              values: {
                0: "Music disabled",
                1: "Music enabled",
              },
              value: 1,
              size: 2.5,
              thickness: 0.5,
              color: 0x33dd33,
              font: 'FontAwesome',
              align: 'left',
      });
      this.messagebox.spawn('snake_indicator', 'gamepad', {
              position: [-30, -15, 1],
              icon: "gamepad",
              label: "Gamepads",
              values: {
                0: "No gamepads detected",
                1: "Gamepads detected",
              },
              value: (this.engine.systems.controls.getGamepads().length > 0 ? 1 : 0),
              size: 2.5,
              thickness: 0.5,
              color: 0x33dd33,
              font: 'FontAwesome',
              align: 'left',
      });
      var diffsetting = this.messagebox.spawn('snake_indicator', 'difficulty', {
              position: [0, -10, 1],
              icon: "sort-amount-asc",
              label: "Difficulty",
              values: {
                8: "Very easy",
                12: "Easy",
                16: "Medium",
                20: "Hard",
                25: "Very Hard",
                30: "Impossible",
              },
              value: localStorage['snake.settings.difficulty'] || this.gamespeed,
              size: 2.5,
              thickness: 0.5,
              color: 0x33dd33,
              font: 'FontAwesome',
              align: 'left',
      });
      var playersetting = this.messagebox.spawn('snake_indicator', 'players', {
              position: [0, -15, 1],
              icon: "users",
              label: "Players",
              values: {
                1: "One player",
                2: "Two players",
              },
              value: 1,
              size: 2.5,
              thickness: 0.5,
              color: 0x33dd33,
              font: 'FontAwesome',
              align: 'left',
      });
      elation.events.add(diffsetting, 'change', elation.bind(this, function(ev) { localStorage['snake.settings.difficulty'] = ev.data; this.setSpeed(ev.data); }));
      elation.events.add(playersetting, 'change', elation.bind(this, function(ev) { this.numplayers = ev.data; }));
      this.controlbox = 1;
      /*
  [ ] Players     [ ] Difficulty
  [ ] Music       [ ] Sound Effects
  [ ] Keyboard    [ ] Gamepads    
  [ ] Full Screen [ ] VR
      */
    }
    this.reset = function(ev) {
      // Put the game board back in its starting state
      if (!ev || ev.value === undefined || ev.value === 0) {
        this.resetplayers();
        this.updateLives();
        this.setSpeed(this.gamespeed);
        var newtargetpos = this.getNewTargetPosition();
        this.target.properties.position.set(newtargetpos[0], newtargetpos[1], 0);
        this.currenttarget = 1;
        this.target.setLabel(this.currenttarget);
      }
    }
    this.pause = function(ev) {
      if (!ev || ev.value == 1) {
        this.disableplayers();
        this.messagebox.showMessage("Game Paused ... Push Space").then(elation.bind(this, this.enablePlayers));

      }
    }
    this.die = function(ev) {
      this.disableplayers();

      var deadplayer = ev.target;
      var name = deadplayer.properties.name || 'Player';

      this.updateLives();
      this.setScore(this.score - 1000);
      this.messagebox.showMessage(name + " Dies! Push Space! --->").then(elation.bind(this, function() { 
        if (deadplayer.properties.lives <= 0) {
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
          this.enableplayers();
          if (this.player[0]) {
            this.player[0].begin(this.level.properties.startdir);
          }
          if (this.player[1]) {
            this.player[1].begin(this.level.properties.startdir2);
          }
        }
      }));
    }
    this.enableplayers = function() { 
      for (var i = 0; i < this.player.length; i++) {
        this.player[i].enable();
      }
    }
    this.disableplayers = function() { 
      for (var i = 0; i < this.player.length; i++) {
        this.player[i].disable();
        this.player[i].stop();
      }
    }
    this.resetplayers = function() {
      if (this.numplayers == 1 && this.player[1]) {
        this.player[1].die();
        this.player.pop();
      } else if (this.numplayers == 2 && !this.player[1]) {
        this.player[1] = this.level.spawn('snake_snake', 'player2', { controls: 'player2', color: 0xff00ff, name: 'Jake'});
        elation.events.add(this.player[1], 'die', elation.bind(this, this.die));
      }
      for (var i = 0; i < this.player.length; i++) {
        var startpos = (i == 1 ? this.level.properties.startpos2 : this.level.properties.startpos);
        this.player[i].properties.startpos.set(startpos.x, startpos.y, 0);
        this.player[i].reset();
      }
    }
    this.advance = function(ev) {
      var player = ev.data.other.properties.player;
      // Update score display
      this.setScore(this.score + this.currenttarget * 100);
      // Increase the target by one level
      this.currenttarget++;

      if (this.currenttarget < 10) {
        var newtargetpos = this.getNewTargetPosition();
        this.target.properties.position.set(newtargetpos[0], newtargetpos[1], 0);
        this.target.setLabel(this.currenttarget);
        //this.setSpeed(this.currenttarget);
        player.setLength(this.currenttarget);
      } else {
        this.disableplayers();
        //this.player[0].dissolve();
        //this.player[1].dissolve();
        this.advanceLevel();
      }
    }
    this.advanceLevel = function() {
      this.currentlevel++;
      this.currenttarget = 1;
      this.level.loadLevel(this.currentlevel);
      this.disableplayers();
      this.messagebox.showMessage("Level " + this.currentlevel + ", Push Space").then(elation.bind(this, function() { 
        this.enableplayers();
        if (this.player[0]) {
          this.player[0].begin(this.level.properties.startdir);
        }
        if (this.player[1]) {
          this.player[1].begin(this.level.properties.startdir2);
        }
      }));
    }
    this.getNewTargetPosition = function() {
      // Pick a new spot for the target which isn't touching the snake or the walls
      var newtargetpos = false;
      while (!newtargetpos) {
        newtargetpos = [Math.floor(Math.random() * (this.level.map[0].length - 2)) + 1, Math.floor(Math.random() * (this.level.map.length - 2)) + 1];
        for (var i = 0; i < this.player.length; i++) {
          if (this.player[i].isTouching(newtargetpos[0], newtargetpos[1])) {
            newtargetpos = false;
          } 
        }
        if (this.level.getBlock(newtargetpos[0], this.level.map.length - 1 - newtargetpos[1]) == 'W') {
          newtargetpos = false;
        }
      }
      return newtargetpos;
    }
    this.setSpeed = function(speed) {
      // Determine speed from a formula based on the current level
      //var realspeed = 20 + Math.pow(Math.log(speed + 1), 2);
      var realspeed = speed;
      this.gamespeed = realspeed;
      for (var i = 0; i < this.player.length; i++) {
        this.player[i].properties.speed = realspeed;
      }
    }
    this.setScore = function(score) {
      this.score = score;
      this.scorelabel.setText(score);
    }
    this.updateLives = function() {
      var labeltext = '';
      for (var i = 0; i < this.player.length; i++) {
        labeltext += this.player[i].properties.name + '--> Lives: ' + this.player[i].properties.lives + '\n';
      }
      this.liveslabel.setText(labeltext);
    }
    this.setLives = function(lives) {
      for (var i = 0; i < this.player.length; i++) {
        this.player[i].properties.lives = lives;
      }
      this.updateLives();
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
      this.checkCollisions();
      for (var i = 0; i < this.player.length; i++) {
        this.player[i].update();
      }

      setTimeout(elation.bind(this, this.tick), 1000 / this.gamespeed);
    }
    this.checkCollisions = function(move) {
      // Who's touching who?
      for (var i = 0; i < this.player.length; i++) {
        var ppos = [Math.round(this.player[i].properties.position.x), Math.round(this.level.map.length - 1 - this.player[i].properties.position.y)];
        var block = this.level.getBlock(ppos[0], ppos[1]);
        var colliding = (this.player[i].isMoving() && block == 'W');
        for (var j = 0; j < this.player.length; j++) {
          colliding = colliding || (this.player[i].isMoving() && this.player[j].isTouching(ppos[0], ppos[1]));
        }
        if (colliding) {
          this.player[i].crash();
        }
      }
    }
  }, elation.engine.client);
});
