var App = function () {

    // Global vars
    var mainImages = [];
    var listImages = [];
    var selectedImages = [];

    /* Helper variables - set in uiInit() */
    var page, pageContent, sidebar, imageDisplay;

    /* Initialisation Leap Motion Code */
    var leapInit = function () {

        var leapController = Leap.loop({enableGestures: true}, function (frame) {

            if (frame.hands.length > 0) {
                var hand = frame.hands[0];
                var palmPosition = hand.palmPosition;
                var velocity = hand.palmVelocity;
                var direction = hand.direction;
                var handPosition = hand.screenPosition();
                var xValue = handPosition[0] + "px";
                var yValue = handPosition[1] + "px";
  
                $("#cursor").css("left", xValue);
                $("#cursor").css("top", yValue);

                selectImages(hand);
                // printGestures(frame);
                // printHandGestures(frame);
            }

        }).use('screenPosition', {
            // scale: 0.25, 
            verticalOffset: 1200
        });

        // This is fairly important - it prevents the framerate from dropping while there are no hands in the frame.
        // Should probably default to true in LeapJS.
        Leap.loopController.loopWhileDisconnected = true;

    };


   var selectImages = function(hand) {

      if (hand.grabStrength == 1) {
        var handPosition = hand.screenPosition();
        var index = 0;

        for (; index < listImages.length; index++) {
          var currentImage = listImages[index];
          //Select image
          if (listImages[index].isInBounds(handPosition[0], handPosition[1])) {
            currentImage.tap();
            return;
          }
        }
      } 
    };

    /* Identifies the types of in-built gestures and prints the gesture to console */
    var printGestures = function(frame) {
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

                  //Classify swipe as either horizontal or vertical
                  var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

                  //Classify as right-left or up-down
                  if(isHorizontal){
                      if(gesture.direction[0] > 0){
                          swipeDirection = "right";
                      } else {
                          swipeDirection = "left";
                      }
                  } else { //vertical
                      if(gesture.direction[1] > 0){
                          swipeDirection = "up";
                      } else {
                          swipeDirection = "down";
                      }                  
                  }
                  console.log(swipeDirection);

                  break;
            }
        });
      }
    }

    /* Identifies the types of hand gestures and prints the gesture to console */
    var printHandGestures = function(frame) {
      if (frame.hands.length > 0) {
          var hand = frame.hands[0];
          var position = hand.palmPosition;
          var velocity = hand.palmVelocity;
          var direction = hand.direction;
          var handRollRadians = hand.roll();  
          var handGrab = hand.grabStrength;
          var handPinchStrength = hand.pinchStrength;

          switch (hand.grabStrength) {
            case 1:
                console.log("closed");
                break;
            case 0: 
                console.log("open");
                break;
          }
          console.log("hand roll radians: " + handRollRadians);
          console.log("pinch strength: " + handPinchStrength);

          // // Finger index test
          // var indexFinger = hand.indexFinger;
          // var indexFingerPos = indexFinger.dipPosition;
          // console.log(indexFingerPos);
        }
    };

    /* Initialisation Images Code */
    var imagesInit = function () {

        // add all images
        var imageLength = 4;
        var index = 0;

        for (; index < imageLength; index++) {

            /** instantiate the new image **/
            var image = new LeapImage();
            //add the image to the
            image.addToDisplay("THUMBNAIL");
            //add the image to the array of list images
            listImages.push(image);

        }

    };

    /* Initialisation UI Code */
    var uiInit = function () {

        // Set variables - Cache some often used jQuery objects in variables */
        page            = $('#page-container');
        pageContent     = $('#page-content');
        sidebar         = $('#sidebar');
        imageDisplay    = $('#image-display');

        // Resize #page-content to fill empty space if exists (also add it to resize and orientationchange events)
        resizePageContent();
        $(window).resize(function () {
            resizePageContent();
        });
        
        $(window).bind('orientationchange', resizePageContent);

    };
    
    /* Initialisation Test Code */
    var testInit = function () {

        // add all images
        var imageLength = 4;
        var index = 0;

        for (; index < imageLength; index++) {

            /** instantiate the new image **/
            var image = new LeapImage();
            //add the image to the
            image.addToDisplay("MAIN");
            //add the image to the array of list images
            mainImages.push(image);

        }

    };

    /* Gets window width cross browser */
    var getWindowWidth = function () {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    };

    /* Resize #page-content to fill empty space if exists */
    var resizePageContent = function () {

        var windowH = $(window).height();
        pageContent.css('min-height', windowH + 'px');
        sidebar.css('min-height', windowH + 'px');
        imageDisplay.css('min-height', windowH-30 + 'px');

    };

    return {
        init: function () {
            uiInit();       // Initialise UI Code
            imagesInit();   // Initialise Images Code
            leapInit();     // Initialise LeapMotion Code
            //testInit();     // Initialise Test Code
        }
    };
}();

/* Initialise app when page loads */
$(function () {
    App.init();
});