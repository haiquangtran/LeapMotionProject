// Wait for DOM to be ready before starting
if (window.addEventListener) {
    window.addEventListener('load', setup);
} else if (window.attachEvent) {
    window.attachEvent('load', setup);
}

// Preload all 28 images, this really slows down the start time
var ims = [];
for(var ij = 1; ij<=28; ij++){
    var im = new Image();
    im.cs
    im.src = "images/"+ij+".jpg";
    ims.push(im);
}

var screenPosition;
var activeImage;

function setup(){
    startCursor();
    startGrabTest();
    document.body.appendChild(ims[Math.floor(Math.random() * 28)]);
}

function startCursor(){
    window.cursor = $('#cursor');

    Leap.loop({hand: function(hand){

        screenPosition = hand.screenPosition(hand.palmPosition);

        cursor.css({
            left: screenPosition[0] + 'px',
            top:  screenPosition[1] + 'px'
        });

        if(activeImage==null)return;

        activeImage.css({
            left: screenPosition[0] + 'px',
            top:  screenPosition[1] + 'px'
        })

    }})
    .use('screenPosition', {
        verticalOffset: 1200
    });
}

function startGrabTest(){
    Leap.loop({background: true}, {

        hand: function(hand){
            if(hand.grabStrength < 0.9) {activeImage = null; return;}
            var under = document.elementFromPoint(screenPosition[0],screenPosition[1]);
            if(under==null) return;
            console.log(under.tagName);
            if(under.tagName==="IMG") activeImage = $(under);
            else activeImage = null;
        }
    });
}
