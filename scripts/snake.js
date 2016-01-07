elation.require([], function() {
  elation.component.add('engine.things.snake_snake', function() {
    this.postinit = function() {
      this.controlmappings = {
        player1: {
          'move_up': ['keyboard_up,gamepad_0_button_12', elation.bind(this, this.updateControls)],
          'move_down': ['keyboard_down,gamepad_0_axis_1,gamepad_0_button_13', elation.bind(this, this.updateControls)],
          'move_left': ['keyboard_left,gamepad_0_button_14', elation.bind(this, this.updateControls)],
          'move_right': ['keyboard_right,gamepad_0_axis_0,gamepad_0_button_15', elation.bind(this, this.updateControls)],
        },
        player2: {
          'move_up': ['keyboard_w', elation.bind(this, this.updateControls)],
          'move_down': ['keyboard_s,gamepad_0_axis_3', elation.bind(this, this.updateControls)],
          'move_left': ['keyboard_a', elation.bind(this, this.updateControls)],
          'move_right': ['keyboard_d,gamepad_0_axis_2', elation.bind(this, this.updateControls)],
        }
      };
      this.defineProperties({
        startpos: { type: 'vector2', default: [0,0] },
        speed: { type: 'float', default: 2 },
        speedmultiplier: { type: 'float', default: 1 },
        name: { type: 'string', default: 'Sammy' },
        lives: { type: 'integer', default: 5 },
        controls: { type: 'string', default: 'player1' },
        color: { type: 'color', default: 0xffff00 }
      });
      var controls = this.properties.controls;

      this.controls = this.engine.systems.controls.addContext(controls, this.controlmappings[controls]);

      this.engine.systems.controls.activateContext(controls);
      this.moves = [];
      this.lastmovedir = [0,0];
      this.segments = [];
    }
    this.createObject3D = function() {
      return new THREE.Object3D();
    }
    this.createChildren = function() {
      this.head = this.parent.spawn('snake_segment', this.id + '_segment_head', {
        position: this.properties.position.toArray(),
        color: this.properties.color,
        player: this
      });
      this.tail = this.parent.spawn('snake_segment', this.id + '_segment_tail', {
        position: this.properties.position.toArray(),
        collidable: false,
        color: this.properties.color,
        player: this
      });
    }
    this.createSegment = function(id) {
      if (!id) id = this.segments.length;
      var pos = (this.segments.length > 0 ? this.segments[this.segments.length - 1].position : this.properties.position).clone();
      pos.x = Math.round(pos.x);
      pos.y = Math.round(pos.y);
      pos.z = Math.round(pos.z);

      var segment = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshPhongMaterial({color: this.properties.color}));
      this.parent.objects['3d'].add(segment);
      segment.position.copy(pos);
      
      return segment;
    }
    this.addSegment = function() {
      var segment = this.createSegment();
      this.segments.push(segment);
      return segment;
    }
    this.addSegments = function(num) {
      for (var i = 0; i < num; i++) {
        this.addSegment();
      }
    }
    this.updateControls = function(ev) {
      var threshold = 1;
      if (ev.value >= threshold) {
        this.move(ev.type);
      } else if (ev.value <= -threshold) {
        var reversemove = false;
        if (ev.type == 'move_right') reversemove = 'move_left';
        else if (ev.type == 'move_down') reversemove = 'move_up';

        if (reversemove) {
          this.move(reversemove);
        }
      }
    }
    this.move = function(dir) {
      if (!this.lastmove || 
          ((dir == 'move_up' && this.lastmove != 'move_down') ||
           (dir == 'move_down' && this.lastmove != 'move_up') ||
           (dir == 'move_left' && this.lastmove != 'move_right') ||
           (dir == 'move_right' && this.lastmove != 'move_left'))) {
        this.moves.push(dir);
        this.lastmove = dir;
      }
    }
    this.moveRandom = function() {
      var moves = ['move_up', 'move_down', 'move_left', 'move_right'];
      this.move(moves[Math.floor(Math.random() * moves.length)]);
    }
    this.setLength = function(length) {
      this.addSegments(10);
    }
    this.stop = function() {
      this.properties.velocity.set(0,0,0);
      if (this.head && this.tail) {
        this.head.properties.velocity.set(0,0,0);
        this.tail.properties.velocity.set(0,0,0);
      }
      this.moves = [];
    }
    this.dissolve = function() {
    }
    this.update = function() {
      var moves = {
        'move_up': [0, 1],
        'move_down': [0, -1],
        'move_left': [-1, 0],
        'move_right': [1, 0]
      };
      if (this.moves.length > 0) {
        var move = this.moves.shift();
        this.lastmovedir = moves[move];
        var speed = this.properties.speed * this.properties.speedmultiplier;
        this.properties.velocity.set(moves[move][0] * speed, moves[move][1] * speed, 0);
      }
      this.snapPosition();
    }
    this.snapPosition = function() {
      var pos = this.properties.position;
      pos.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
      if (!this.isMoving()) {
        return;
      }

      if (this.head && this.tail) {
        this.head.properties.position.copy(pos);
        this.head.properties.velocity.copy(this.properties.velocity);
        this.tail.properties.position.copy(this.properties.position);
        this.tail.properties.velocity.copy(this.properties.velocity);

        if (this.segments.length > 1) {
          this.segments[0].position.copy(pos);
          this.tail.properties.position.copy(this.segments[this.segments.length - 1].position);
          this.tail.properties.velocity.subVectors(this.segments[this.segments.length - 2].position, this.segments[this.segments.length - 1].position).multiplyScalar(this.properties.speed);
          for (var i = this.segments.length-1; i > 0; i--) {
            this.segments[i].position.copy(this.segments[i-1].position);
          }
        } else {
          this.segments[0].position.copy(pos);
        }
      }

    }
    this.speedup = function(ev) {
      this.properties.speedmultiplier = (ev.value ? 2 : 1);
    }
    this.reset = function() {
      this.properties.position.x = this.properties.startpos.x;
      this.properties.position.y = this.properties.startpos.y;
      this.properties.velocity.set(0,0,0);

      if (this.head && this.tail) {
        this.head.properties.position.x = this.properties.startpos.x;
        this.head.properties.position.y = this.properties.startpos.y;
        this.head.properties.velocity.set(0,0,0);

        this.tail.properties.position.x = this.properties.startpos.x;
        this.tail.properties.position.y = this.properties.startpos.y;
        this.tail.properties.velocity.set(0,0,0);
      }

      this.lastmovedir = [0,0];
      this.lastmove = false;
      this.refresh();
      for (var i = 0; i < this.segments.length; i++) {
        this.parent.objects['3d'].remove(this.segments[i]);
      }
      this.segments = [];
      this.addSegments(5);
    }

    this.isMoving = function() {
      return (this.properties.velocity.lengthSq() > 1e-6);
    }
    this.isTouching = function(x, y) {
      var yoffset = this.parent.map.length - 1;
      for (var i = 1; i < this.segments.length; i++) {
        var segpos = this.segments[i].position;
        if (segpos.x == x && yoffset - segpos.y == y) {
          return true;
        }
      }
      return false;
    }
    this.isCollidingWithSelf = function() {
      if (!this.isMoving()) {
        return false;
      }
      var pos = new THREE.Vector3(
        Math.round(this.properties.position.x),
        Math.round(this.properties.position.y),
        Math.round(this.properties.position.z)
      );
      
      for (var i = 1; i < this.segments.length; i++) {
        var segpos = this.segments[i].position;
        if (pos.equals(segpos)) {
          return true;
        }
      }
      return false;
    }
    this.setStartpos = function(x, y) {
      this.properties.startpos.x = x;
      this.properties.startpos.y = y;
    }
    this.pause = function() {
      this.pausedvelocity = this.properties.velocity.clone();
      this.properties.velocity.set(0,0,0);
      if (this.head && this.tail) {
        this.head.properties.velocity.set(0,0,0);
        this.tail.properties.velocity.set(0,0,0);
      }
    }
    this.resume = function() {
      if (this.pausedvelocity) {
        //this.properties.velocity.copy(this.pausedvelocity);
      }
    }
    this.begin = function(startdir) {
      this.moves = [];
      this.enable();
      if (startdir) {
        this.move(startdir);
      } else {
        this.moveRandom();
      }
    }
    this.enable = function() {
      this.engine.systems.controls.activateContext(this.properties.controls);
      this.resume();
      this.show();
    }
    this.disable = function() {
      this.engine.systems.controls.deactivateContext(this.properties.controls);
      this.pause();
      this.hide();
    }
    this.show = function() {
      this.objects['3d'].visible = true;
    }
    this.hide = function() {
      this.objects['3d'].visible = false;
    }
    this.crash = function() {
      this.properties.lives--;
      this.stop();
      elation.events.fire({type: 'die', element: this, data: this.properties.lives});
    }
    this.die = function() {
      this.head.die();
      this.tail.die();
      for (var i = 0; i < this.segments.length; i++) {
        this.parent.objects['3d'].remove(this.segments[i]);
      }
      elation.engine.things.snake_snake.extendclass.die.call(this);
    }
  }, elation.engine.things.generic);
  elation.component.add('engine.things.snake_segment', function() {
    this.postinit = function() {
      this.defineProperties({
        player: { type: 'object' },
        color: { type: 'color', default: 0xffff00 }
      });
    }
    this.createObject3D = function() {
      var segment = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshPhongMaterial({color: this.properties.color}));
      return segment;
    }
  }, elation.engine.things.generic);
});
