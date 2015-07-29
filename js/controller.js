// Wait for DOM to be ready before starting
if (window.addEventListener) {
    window.addEventListener('load', setup);
} else if (window.attachEvent) {
    window.attachEvent('load', setup);
}

// Preload all images, this really slows down the start time
var images = [];
var imageLength = 13;
for(var i = 1; i <= imageLength; i++){
    var image = new Image(190, 170);
    image.src = "images/" + i + ".jpg";
    images.push(image);
}

// Setup images
function setup(){
    for (var i = 0; i < images.length; i++) {
      document.getElementById("image-display").appendChild(images[i]);
    }
}

var cats = {};

Leap.loop(function(frame) {

  frame.hands.forEach(function(hand, index) {
    var cat = ( cats[index] || (cats[index] = new Cat()) );    
    cat.setTransform(hand.screenPosition(), hand.roll());
  });
  
}).use('screenPosition', {scale: 0.5});


var Cat = function() {
  var cat = this;
  var img = document.createElement('img');
  img.src = 'images/1.jpg';
  img.style.position = 'absolute';

  img.onload = function () {
    cat.setTransform([window.innerWidth/2,window.innerHeight/2], 0);
    document.getElementById("main-display").appendChild(img);
  }
  
  cat.setTransform = function(position, rotation) {

    img.style.left = position[0] - img.width  / 2 + 'px';
    img.style.top  = position[1] - img.height / 2 + 'px';

    img.style.transform = 'rotate(' + -rotation + 'rad)';
    
    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
    img.style.OTransform = img.style.transform;

  };
};

cats[0] = new Cat();


// var controller = new Leap.Controller({enableGestures: true})
//   .use('screenPosition')
//   .connect()
//   .on('frame', function(frame){
//     // Try making some circles
//   })

// This allows us to move the cat even whilst in an iFrame.
Leap.loopController.setBackground(true)

