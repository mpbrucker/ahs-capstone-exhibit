var el = document.querySelector('a-box');
var scene = document.querySelector('a-scene').object3D;
var camera = document.querySelector('a-camera');

var text = document.querySelector('a-text');

console.log(scene);
console.log(camera.children[1]);

el.addEventListener('click', function (e) {
    console.log('clicked');
});

