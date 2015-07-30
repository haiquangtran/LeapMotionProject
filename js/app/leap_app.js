var App = function() {

  // Global vars
  var mainImages = [];
  var listImages = [];
  var selectedImages = [];

  /* Initialisation Leap Motion Code */
  var leapInit = function() {

    Leap.loop(function(frame) {

      if (frame.hands.length > 0) {
        var hand = frame.hands[0];
        var palmPosition = hand.palmPosition;
        var velocity = hand.palmVelocity;
        var direction = hand.direction;
        var handPosition = hand.screenPosition()
        console.log(handPosition);
        var xValue = parseInt(handPosition[0], 10) + "px";
        var yValue = parseInt(handPosition[1], 10) + "px";

        console.log(xValue)
        console.log(yValue);
        $("#cursor").css("top", xValue);
        $("#cursor").css("right", yValue);
      }
      // frame.hands.forEach(function(hand, index) {
      //
      //
      //
      // });

    }).use('screenPosition', {scale :0.25});

    // This is fairly important - it prevents the framerate from dropping while there are no hands in the frame.
    // Should probably default to true in LeapJS.
    Leap.loopController.loopWhileDisconnected = true;

  };

  /* Initialisation Images Code */
  var imagesInit = function() {

    // add all images
    var imageLength = 5;
    var index = 0;

    for (; index < imageLength; index++) {

      /** instantiate the new image **/
      var image = new LeapImage();
      //add the image to the list-panel
      image.addToPanel("list-panel");
      //add the image to the array of list images
      listImages.push(image);

    }

  };

  return {
    init: function() {
      imagesInit(); // Initialise UI Code
      leapInit(); // Initialise UI Code
    }
  };
}();

/* Initialise app when page loads */
$(function(){ App.init(); });
