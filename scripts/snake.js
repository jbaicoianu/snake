/** 
 * A simple game of Snake to demonstrate Elation Engine
 */

elation.require([
    'engine.engine', 'engine.things.light', 'engine.things.label',
    'snake.level', 'snake.camera', 'snake.player', 'snake.target'
  ], function() {
  elation.component.add('snake.main', function() {
    this.initWorld = function() {
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
              position: [-10, 12, 25]
            }
          },
          'lamp': {
            name: 'lamp',
            type: 'light',
            properties: {
              type: 'point',
              position: [10, -5, 50],
              intensity: 0.3
            }
          },
          'camera': {
            name: 'camera',
            type: 'snake_camera',
            properties: {
              position: [0, 0, 60]
            }
          },
          'player': {
            name: 'player',
            type: 'snake_player',
          },
          'level': {
            name: 'level',
            type: 'snake_level',
            properties: {
              collidable: false // temporary
            }
          },
          'target': {
            name: 'target',
            type: 'snake_target',
          }
        }
      });

      // Retain references for later use
      this.camera = things.children.world.children.camera;
      this.player = things.children.world.children.player;
      this.level = things.children.world.children.level;
      this.target = things.children.world.children.target;

      elation.events.add(this.target, 'collide', elation.bind(this, this.advance));

      // Activate the camera
      this.engine.systems.render.views.main.setactivething(this.camera);

      this.controls = this.engine.systems.controls.addContext('world', {
        'reset': ['keyboard_r', elation.bind(this, this.reset)],
      });
      this.engine.systems.controls.activateContext('world');
      // Start it up!
      this.reset();
      this.tick();
    }
    this.reset = function(ev) {
      // Put the game board back in its starting state
      if (!ev || ev.value === 0) {
        console.log('reset!');
        this.player.reset();
        this.setSpeed(1);
        var offset = this.getMapOffset();
        this.target.properties.position.set(Math.floor(Math.random() * (this.level.map[0].length - 2)) - offset[0] + 1, Math.floor(Math.random() * (this.level.map.length - 2)) - offset[1] + 1, 0);
        this.currentlevel = 1;
        this.target.setLabel(this.currentlevel);
      }
    }
    this.advance = function() {
      // Increase the difficulty by one level
      this.currentlevel++;
      var offset = this.getMapOffset();
      //this.target.properties.position.set(Math.floor(Math.random() * (this.level.map[0].length - 2)) - offset[0] + 1, Math.floor(Math.random() * (this.level.map.length - 2)) - offset[1] + 1, 0);
      var newtargetpos = false;
      while (!newtargetpos || this.player.isTouching(newtargetpos[0], newtargetpos[1])) {
        newtargetpos = [Math.floor(Math.random() * (this.level.map[0].length - 2)) - offset[0] + 1, Math.floor(Math.random() * (this.level.map.length - 2)) - offset[0] + 1];
      }
      this.target.properties.position.set(newtargetpos[0], newtargetpos[1], 0);
      this.target.setLabel(this.currentlevel);
      //this.setSpeed(this.currentlevel);
      this.player.setLength(this.currentlevel);
    }
    this.setSpeed = function(speed) {
      // Determine speed from a formula based on the current level
      var realspeed = 10 + Math.pow(Math.log(speed + 1), 2);
      this.gamespeed = realspeed;
      this.player.properties.speed = realspeed;
    }
    this.tick = function() {
      // Main game loop
      this.checkCollisions(this.player.movedir);
      this.player.update();
      setTimeout(elation.bind(this, this.tick), 1000 / this.gamespeed);
    }
    this.getMapOffset = function() {
      return [(this.level.map[0].length) / 2, (this.level.map.length) / 2];
    }
    this.checkCollisions = function(move) {
      // Who's touching who?
      var offset = this.getMapOffset();
      var ppos = [Math.round(this.player.properties.position.x + offset[0]) + move[0], Math.round(this.player.properties.position.y + offset[1]) + move[1]];
      try {
        var block = this.level.map[ppos[1]][ppos[0]];
      } catch(e) {
        block = true;
      }
      block = block || this.player.isCollidingWithSelf();
      if (ppos[0] == this.target.properties.position.x + offset[0] && ppos[1] == this.target.properties.position.y + offset[1]) {
        console.log('got it!');
        //this.advance();
      } else if (block) {
        console.log('crashed!');
        this.reset();
      }
    }
  }, elation.engine.client);
});
