var scene = document.querySelector('a-scene');
var bgMusic = document.querySelector('audio');
var enterButton = document.getElementById('enter');
var splash = document.getElementById('splash');
var slider = document.getElementById('strobe-slider');
var slider_val = document.getElementById('strobe-amount');
var isLoaded = false;
var numLocks = -1;

slider.oninput = function() {
    slider_val.innerHTML = this.value;
}

scene.addEventListener('loaded', function (e) {
    isLoaded = true;
    enterButton.classList.add('Exhibit__link--ready');
    enterButton.innerText = 'ENTER';
})

enterButton.onclick = function(e) {
    if (isLoaded) {
        bgMusic.play();
        splash.style.visibility = 'hidden';    
    }
}

pointerLockChange = function(e) {
    numLocks += 1;
}

onClick = function(e) {
    if (numLocks == 0) {
        window.open(e.detail.href, '_blank');
    } else {
        numLocks = 0;
    }
}

document.addEventListener('pointerlockchange', pointerLockChange);
document.addEventListener('clicklink', onClick);

const DEFAULT_EMOJI = 0;
var selected_emoji = DEFAULT_EMOJI;

// modifiers for aframe-copresence
function buildVisitorRepr(id, el) {
    // const choice = Math.floor(Math.random() * 7);
    el.setAttribute('shadow', {'receive': false});
    for (let i = 0; i < 7; i++) {
        var headEl = document.createElement('a-entity');
        headEl.className = 'head-' + i;
        if (i == DEFAULT_EMOJI) {
            headEl.setAttribute('visible', true);
        } else {
            headEl.setAttribute('visible', false);
        }
        // in a-frame.html emojis are loaded as emoji_{0..6} (inclusive)
        headEl.setAttribute('gltf-model', '#emoji_' + i);
        el.appendChild(headEl);
    }
}


// Change the client's emoji, updating UI and sending updates to others
function changeEmoji(emojiNum) {
    if (!(emojiNum >=0 && emojiNum <= 6)) {
        console.error('invalid emoji number');
        return;
    }
    if (emojiNum == selected_emoji) {
        return;
    }
    socket.emit('update-data', {
        emoji: emojiNum,
    });
    const oldEmoji = document.getElementById('emoji-selector-' + selected_emoji);
    const newEmoji = document.getElementById('emoji-selector-' + emojiNum);
    oldEmoji.classList.remove('selected');
    newEmoji.classList.add('selected');
    selected_emoji = emojiNum;
}

// only show controls if socket.io managed to connect
socket.on('connect', function () {
    const controls = document.getElementById('controls');
    controls.style.visibility = 'inherit';

    // attach listener for keys for emoji selector
    document.addEventListener('keydown', function(event) {
        if (!event.repeat && event.key >= '1' && event.key <= '7') {
    	console.debug("Key event:", event);
    	const selected = Number(event.key) - 1;
    	changeEmoji(selected);
        }
    });
});

socket.on('visitor-update-data', function (msg) {
    const id = msg.id;
    const data = msg.data;
    handleVisitorUpdate(id, data);
});

function handleVisitorUpdate(id, data) {
    const el = findVisitorRepr(id);
    if (el == null) {
        console.warn("Couldn't find user " + id);
        return;
    }
    if (data.emoji != undefined) {
        const emoji = data.emoji;
        el.childNodes.forEach(function (c) {
            c.setAttribute('visible', false);
        })
        let newHeadEl = el.getElementsByClassName('head-' + emoji)[0];
        newHeadEl.setAttribute('visible', true);
    }
    if (data.name != undefined) {
        const name = data.name;
        // TODO
    }
}

// // Add a fake user for debugging
// window.addEventListener('load', () => {
//     let el = createVisitorRepr('debug');
//     el.setAttribute('position', {x: 0, y: 1.6, z: 0});
//     console.log('Added debug visitor ', el);
// });
