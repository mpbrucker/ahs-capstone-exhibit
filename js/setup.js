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
                this.el.setAttribute('light', {intensity: 1});
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
