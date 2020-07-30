function buildVisitorRepr(id, el) {
    console.log('adding person');
    var headEl = document.createElement('a-cone');
    headEl.setAttribute('height', 0.5);
    headEl.setAttribute('radius-bottom', 0.25);
    // rotate to point towards camera direction
    headEl.object3D.rotation.x = Math.PI / 2;
    el.appendChild(headEl);

    // line for pointing
    var lineEl = document.createElement('a-entity');
    lineEl.setAttribute('line', {
        start: { x: 0, y: 0, z: 0 }, 
        end: {x: 0, y: 0, z: -5},
        color: 'red',
        visible: true,
    });
    el.appendChild(lineEl);

    // name text
    var textEl = document.createElement('a-text');
    textEl.setAttribute('value', id);
    textEl.setAttribute('align', 'center');
    textEl.getAttribute('position').y = 0.5;
    textEl.object3D.rotation.y = Math.PI;
    el.appendChild(textEl);
    // make a second to point backwards
    var textEl2 = textEl.cloneNode();
    textEl2.getAttribute('position').y = 0.5;
    el.appendChild(textEl2);
}

AFRAME.registerComponent('proxtext', {
    init: function() {
        this.cam = document.querySelector('#rig');
        this.inProx = false;
        this.textId = 'link-text-' + this.el.id.split('-')[2];
        this.textElem = document.getElementById(this.textId);

        this.intersected = function(e) {
            this.textElem.object3D.visible = true;
        }
        this.intersectedLeave = function(e) {
            this.textElem.object3D.visible = false;
        }

        this.intersected = this.intersected.bind(this);
        this.intersectedLeave = this.intersectedLeave.bind(this);
        this.el.addEventListener('raycaster-intersected', this.intersected);
        this.el.addEventListener('raycaster-intersected-cleared', this.intersectedLeave);
    },

});

AFRAME.registerComponent('textured', {
    init: function() {
        var loader = new THREE.TextureLoader();
        var texturePath  = document.querySelector("#texture").getAttribute('src');
        var texture = loader.load(texturePath);
        console.log(texture);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 400, 400 );        
        texture.needsUpdate = true;
        console.log(texture)
        this.material = new THREE.MeshStandardMaterial({
            map: texture
        });
        this.el.addEventListener('model-loaded', () => this.update());
    },
    update: function() {
        const object = this.el.getObject3D('mesh');
        const material = this.material;
        console.log(material);
        console.log(object);

        if (object) {
            console.log(texture);
            object.traverse(function (node) {
                if (node.isMesh) {
                    console.log('test');
                    node.material = material;
                } 
                // node.material = material;
            });    
        }        
    }
  })

// AFRAME.registerComponent('textured', {
//     init: function() {
//         this.el.addEventListener('model-loaded', (e) => {
//             var loader = new THREE.TextureLoader();
//             var texture = document.querySelector("#texture").getAttribute('src')
//             var mesh = this.el.getObject3D('mesh');
//             console.log(mesh.children);
//             console.log(this);
//             if (!mesh)
//                 return;
//             // load a resource
//             loader.load( texture,
//                 // onLoad callback
//                 (texture) => {
//                     mesh.children.forEach(function(child) {
//                         child.material.map = texture;
//                         // child.material.color = 'FF0000';
//                         console.log(child.material);
//                     })
//                     // const material = new THREE.MeshPhongMaterial({
//                     //     color: 0xFF0000,    // red (can also use a CSS color string here)
//                     //     flatShading: true,
//                     //   });
//                     // mesh.material = material;
//                 }
//             )
//           })
//     }
//   })

AFRAME.registerComponent('clicklink', {
    schema: {
        href: {type: 'string', default: '/'}
    },

    init: function() {
        this.onClick = function(e) {
            this.el.emit('clicklink', {href: this.data.href}, true);
        };
        this.onClick = this.onClick.bind(this);
        this.el.addEventListener('click', this.onClick);
    }
});

AFRAME.registerComponent('hover', {
    dependencies: ['raycaster'],
  
    init: function () {
        this.numIntersect = 0;
        this.pointer = document.getElementById('click');
        this.onIntersect = function(e) { 
            this.numIntersect += 1;
            this.pointer.object3D.visible = true;
            this.el.emit('textvisible', {}, false);
        }
        this.onIntersectLeave = function(e) {
            this.numIntersect -= 1;
            if (this.numIntersect < 1) {
                this.numIntersect = 0;
                this.pointer.object3D.visible = false;
            }
            this.el.emit('textinvisible');
        }

        this.onIntersect = this.onIntersect.bind(this);
        this.onIntersectLeave = this.onIntersectLeave.bind(this);

        this.el.addEventListener('raycaster-intersection', this.onIntersect);
        this.el.addEventListener('raycaster-intersection-cleared', this.onIntersectLeave);

    }
  });

AFRAME.registerComponent('strobe', {
    dependencies: ['light'],

    init: function() {
        this.slider = document.getElementById('strobe-slider');
        this.ambient = document.getElementById('ambient-light');
        this.lightState = true;
        this.lastSwitch = 0;
    },

    tick: function(t, dt) {
        var sliderVal = this.slider.value;
        if (sliderVal == 0) {
            if (!this.lightState) {
                this.ambient.setAttribute('light', {intensity: 0.5});
                this.el.setAttribute('light', {intensity: 0.5});
                this.lightState = true;
            }
        } else {
            var timeScale = 1000 / sliderVal;
            var timeDiff = t - this.lastSwitch;
            if (!this.lightState) {
                if (timeDiff > (timeScale * .9)) {
                    this.ambient.setAttribute('light', {intensity: 0.05});
                    this.el.setAttribute('light', {intensity: 1});
                    this.lightState = true;
                    this.lastSwitch = t;
                }
            } else {
                if (timeDiff > (timeScale * .1)) {
                    this.ambient.setAttribute('light', {intensity: 0.05});
                    this.el.setAttribute('light', {intensity: 0.08});
                    this.lightState = false;
                    this.lastSwitch = t;
                }
            }
        }
    }
})
