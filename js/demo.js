// Wait for DOM to be ready before starting
if (window.addEventListener) {
    window.addEventListener('load', setup);
} else if (window.attachEvent) {
    window.attachEvent('load', setup);
}

// Matter aliases, syntactic sugar
var Engine = Matter.Engine,
World = Matter.World,
Bodies = Matter.Bodies,
Composites = Matter.Composites,
MouseConstraint = Matter.MouseConstraint;

// Preload all 28 images, this really slows down the start time
var ims = [];
for(var ij = 1; ij<=28; ij++){
    var im = new Image();
    im.src = "images/"+ij+".jpg";
    ims.push(im);
}

// Global vars
var stack; // This holds the movable image objects
var _engine;
var _world;
var width = window.innerWidth-20;
var height = window.innerHeight-20;
var cursorBody;


// Setup Matter engine
function setup(){
    var container = document.getElementById('canvas-container');

    // some example engine options
    var options = {
        positionIterations: 6,
        velocityIterations: 4,
        enableSleeping: false,
        metrics: {extended: true},
        render: {options:{ width: width , height: height}},
        world:  {
            bounds: {
                min: {x: 0, y: 0},
                max: {x: width, y: height}
            }
        }
    };

    // create a Matter engine
    // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
    _engine = Engine.create(container, options);

    var renderOptions = _engine.render.options;
    renderOptions.background = '#222';
    renderOptions.wireframes = false;


    // add a mouse controlled constraint
    var _mouseConstraint = MouseConstraint.create(_engine);
    World.add(_engine.world, _mouseConstraint);

    // run the engine
    Engine.run(_engine);

    go();
}

// Add things to scene
function go(){
    var w = getWorld();
    var s = getObjects();
    World.add(w,s);

    startCursor();
    startPointCheck();
    startGrabTest();
    addLeapMouse();
};

function addLeapMouse(){
    var options = {
        isStatic: true,
        groupId: 1
    }
    cursorBody = Bodies.circle(100,100,10,options);
    World.add(_world, cursorBody);
}

function startGrabTest(){
    Leap.loop({background: true}, {

        hand: function(hand){
            console.log(hand.grabStrength * 100 + '%');

        }
    });
}

function startPointCheck(){
    var controller = Leap.loop({enableGestures: true}, function(frame){
        if(frame.valid && frame.gestures.length > 0){
            frame.gestures.forEach(function(gesture){
                switch (gesture.type){
                    case "circle":
                    console.log("Circle Gesture");
                    break;
                    case "keyTap":
                    console.log("Key Tap Gesture");
                    break;
                    case "screenTap":
                    console.log("Screen Tap Gesture");
                    break;
                    case "swipe":
                    console.log("Swipe Gesture");
                    break;
                }
            });
        }
    });
}

function startCursor(){
    window.cursor = $('#cursor');

    Leap.loop({hand: function(hand){

        var screenPosition = hand.screenPosition(hand.palmPosition);

        cursor.css({
            left: screenPosition[0] + 'px',
            top:  screenPosition[1] + 'px'
        });

        cursorBody.position.x = screenPosition[0];
        cursorBody.position.y = screenPosition[1];

    }})
    .use('screenPosition', {
        verticalOffset: 1200
    });
}


// Prep borders
function getWorld(){
    _world = _engine.world,
    offset = 10,
    options = {
        isStatic: true
    };

    _world.bodies = [];

    World.add(_world, [
        Bodies.rectangle(width/2, -offset, width , 50.5, options),
        Bodies.rectangle(width/2, height + offset, width, 50.5, options),
        Bodies.rectangle(width + offset, height/2, 50.5, height , options),
        Bodies.rectangle(-offset, height/2, 50.5, height, options)
        ]);

    return _world;
}

// Prep image objects
function getObjects(){
    stack = Composites.stack(20, 20, 3, 1, 0, 0, function(x, y, column, row) {
        var image = ims[Math.floor(Math.random() * 28)];
        var ratio = image.height/image.width;
        var xScale = 200/image.width;
        var yScale = (200*ratio)/image.height;

        return Bodies.rectangle(x, y, 200, 200*ratio, {
            render: {
                sprite: {
                    texture: image.src,
                    xScale: xScale,
                    yScale: yScale
                }
            },
            groupId: 1
        });
    });

    return stack;
}