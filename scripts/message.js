elation.require(['engine.things.label'], function() {
  elation.component.add('engine.things.snake_message', function() {
    this.setText = function(text) {
      this.setMultilineText(text);
      this.setBackground();
      this.refresh();
    }
    this.setBackground = function() {
      this.objects['3d'].geometry.computeBoundingBox();
      var textsize = this.objects['3d'].geometry.boundingBox;
      var diff = new THREE.Vector3().subVectors(textsize.max, textsize.min);
      var marginVert = 1;
      var marginHoriz = 4;
      var cube = new THREE.BoxGeometry(diff.x + marginHoriz*2 + 2, diff.y + marginVert*2 + 2, .5);
      var translate = new THREE.Vector3(0, 1, 0);
      if (this.properties.align == 'left') {
        translate.x += diff.x/2;
      } else if (this.properties.align == 'right') {
        translate.x -= diff.x/2;
      }
      //translate.y -= diff.y/4;
      translate.y -= .5 + diff.y/2;
      cube.applyMatrix(new THREE.Matrix4().makeTranslation(translate.x, translate.y, translate.z));

      if (!this.background) {
        var bgmat = new THREE.MeshPhongMaterial({color: 0x990000, opacity: 1 });
        var bordermat = new THREE.MeshPhongMaterial({color: 0xffffff, opacity: 1});
        var bordermat2 = new THREE.MeshPhongMaterial({color: 0x00ffff, opacity: 1});
        var facemat = new THREE.MeshFaceMaterial([
          bgmat, bgmat, bgmat, bgmat, bgmat, bgmat, 
          bordermat, bordermat, bordermat, bordermat, bordermat, bordermat,
          bordermat2, bordermat2, bordermat2, bordermat2, bordermat2, bordermat2
        ]);
        this.background = new THREE.Mesh(cube, facemat);
        this.objects['3d'].add(this.background);
      } else {
        this.background.geometry = cube;
      }

      var bordergeo = new THREE.CubeGeometry(diff.x + marginHoriz * 2 + 2, 1, 1);
      var borderoffset = new THREE.Matrix4();
      //borderoffset.makeTranslation(translate.x, (diff.y + marginVert*2) / 2 + 1, 1);
      borderoffset.makeTranslation(translate.x, (marginVert*2) / 2 + 1, 1);
      cube.merge(bordergeo, borderoffset, 6);
      borderoffset.makeTranslation(translate.x, -(diff.y + marginVert) , 1);
      cube.merge(bordergeo, borderoffset, 6);

      var bordergeo = new THREE.CubeGeometry(1, diff.y + marginVert * 2, 1);
      borderoffset.makeTranslation(translate.x - (diff.x + marginHoriz*2) / 2 - .5, -diff.y/2 + .5, 1);
      cube.merge(bordergeo, borderoffset, 6);
      borderoffset.makeTranslation(translate.x + (diff.x + marginHoriz*2) / 2 + .5, -diff.y/2 + .5, 1);
      cube.merge(bordergeo, borderoffset, 6);

    }
    this.enableControls = function() {
      if (!this.controls) {
        this.controls = this.engine.systems.controls.addContext('messagebox', {
          'accept': ['keyboard_space,keyboard_y', elation.bind(this, this.updateControls)],
          'deny': ['keyboard_n', elation.bind(this, this.updateControls)],
        });
      }
      this.engine.systems.controls.activateContext('messagebox');
    }
    this.disableControls = function() {
      this.engine.systems.controls.deactivateContext('messagebox');
    }
    this.showMessage = function(text) {
      this.setText(text);
      this.show();
      // FIXME - oh god, what have I done
      this.promise = new Promise(elation.bind(this, function(resolve, reject) { this.callbacks = [resolve, reject];}));
      return this.promise;
    }
    this.showPrompt = function(text) {
      this.setText(text);
      this.promise = new Promise(elation.bind(this, function(resolve, reject) { this.callbacks = [resolve, reject];}));

      var input = elation.ui.input({append: document.body});
      elation.events.add(input, 'ui_input_change', elation.bind(this, function(ev) {
        this.setText(text + ' ' + ev.target.value);
      }));
      elation.events.add(input, 'ui_input_accept', elation.bind(this, function(ev) {
        this.callbacks[0](ev.target.value);
        input.destroy();
      }));
      input.focus();
      this.show();
      return this.promise;
    }
    this.show = function() {
      if (this.objects['3d']) this.objects['3d'].visible = true;
      if (this.background) this.background.visible = true;
      this.visible = true;
      this.enableControls();
      this.refresh();
    }
    this.hide = function() {
      if (this.objects['3d']) this.objects['3d'].visible = false;
      if (this.background) this.background.visible = false;
      this.visible = false;
      this.disableControls();
      this.refresh();
    }
    this.updateControls = function(ev) {
      if (ev.value == 1) {
        this.hide();
        if (this.promise && this.callbacks) {
          this.callbacks[0](ev.type);
        }
      }
    }
  }, elation.engine.things.label);
});
