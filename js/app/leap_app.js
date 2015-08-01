var App = function () {

    // Global vars
    var mainImages = [];
    var listImages = [];
    var selectedImages = [];
    var selectedImage = null;  //selected image in main display

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

                //Selecting multiples that will be moved to main display
                selectMultipleImagesGesture(hand);
                //Selecting and moving an image in main display
                manipulateMainImageGesture(hand);
            }

        }).use('screenPosition', {
            verticalOffset: 1200
        });

        //Recognize built-in gestures
        leapController.on("gesture", function(gesture, frame) {
          if (frame.hands.length > 0) {
            var hand = frame.hands[0];
            //Selecting and moving an image in main display
            manipulateMainImageGesture(hand, gesture);
          }
          moveToMainDisplayGesture(gesture);
        });

        // This is fairly important - it prevents the framerate from dropping while there are no hands in the frame.
        // Should probably default to true in LeapJS.
        Leap.loopController.loopWhileDisconnected = true;

    };

    /* Gesture actions for selection and manipulating an image in the main display */
    var manipulateMainImageGesture = function(hand, gesture) {
      if (mainImages.length == 0) { return; }

      if (gesture != null) {
        if (gesture.type == "screenTap") {
              console.log("Screentapping");
              if (selectedImage == null) {
                selectMainImage(hand);
              } else {
                deselectMainImage(hand);
              }
            }
      } else {
        moveMainImage(hand);
        rotateMainImage(hand);
        scaleMainImage(hand);
      }

    };

    /* Selects image within coords of hand from the main display. Sets image as the SelectedImage. */
    var selectMainImage = function(hand) {
      if (selectedImage != null || selectedImages.length != 0) { return; }

      var handPosition = hand.screenPosition();
      var index = 0;
      for (; index < mainImages.length; index++) {
        var currentImage = mainImages[index];
        //Check if image is under hand
        if (currentImage.isInBounds(handPosition[0], handPosition[1])) {
          selectedImage = currentImage;
          return;
        }
      }
    };

    /* Deselects the image from the main display. Sets selectedImage to null. */
    var deselectMainImage = function(hand) {
      if (selectedImage == null) { return; }
      selectedImage = null;
    }

    /* Moves the selectedImage on the main display.  */
    var moveMainImage = function(hand) {
      if (selectedImage != null) {

        var handPosition = hand.screenPosition();
        //Align cursor in middle of image
        var x = handPosition[0] - selectedImage.IMAGE.width / 2;
        var y = handPosition[1] - selectedImage.IMAGE.height / 2;

        selectedImage.moveTo(x, y);
      }
    }

    /* Rotates the selectedImage on the main display. */
    var rotateMainImage = function(hand) {
      if (selectedImage == null) { return; }
      selectedImage.rotate(hand.roll());
    }

     /* Scale the selectedImage on the main display. */
    var scaleMainImage = function(hand) {
      if (selectedImage == null) { return; }

      if (hand.pinchStrength < 0.5) {
        selectedImage.scaleUp();
      } else if (hand.pinchStrength >= 0.5) {
        selectedImage.scaleDown();
      }
    }

    /* Gesture action for selecting multiples images in the side display. */
    var selectMultipleImagesGesture = function(hand, gesture) {
      if (listImages.length == 0 || selectedImage != null) { return; }

      //Select on grab
      if (hand.grabStrength == 1) {
        addToSelectedImages(hand);
      }
    };

    /* Gesture action for moving multiples selected images in the side display to the main display. */
    var moveToMainDisplayGesture = function(gesture) {
      if (selectedImages.length == 0) { return; }

      if (gesture.type == "swipe") {
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

        if (isHorizontal) {
          //Right swipe
          if (gesture.direction[0] > 0) {
            moveToMainDisplay(gesture);
          }
        }
      }
    }

    /* Moves selected images from side-display into main display */
    var moveToMainDisplay = function(gesture) {
      addToMainImages();

      var index = 0;
      for (; index < mainImages.length; index++) {
        var currentImage = mainImages[index];
        var imageHeight = currentImage.IMAGE.height;
        var offset = 10;
        //only move images from side-display
        if (!currentImage._isInMainDisplay()){
          currentImage.addToDisplay("MAIN");
          //TODO: figure out where to put the images on main display
          currentImage.moveTo(0, offset + (imageHeight + offset) * (index));
        }
      }
    }

    /* Adds all images from selectedImages list into mainImages List. Deselects and removes all images in selectedImages list. */
    var addToMainImages = function() {
      var index = 0;
      //Add all selected images to main images list
      for (; index < selectedImages.length; index++) {
        var currentImage = selectedImages[index];
        mainImages.push(currentImage);
        //deselects and remove all images from selected images list
        selectedImages[index].tap();
        selectedImages.splice(index, 1);
      }
    };

    /* Adds an image within the coordinates of your hand to the selected images list. Removes it from side-display. */
    var addToSelectedImages = function(hand) {
      var handPosition = hand.screenPosition();
      var index = 0;

      for (; index < listImages.length; index++) {
        var currentImage = listImages[index];
        //Check if image is under hand
        if (listImages[index].isInBounds(handPosition[0], handPosition[1])) {
          selectedImages.push(currentImage);
          //Select image
          currentImage.tap();
          //Remove from side-display
          listImages.splice(index, 1);
          return;
        }
      }
    };

    // TODO: deselect images from side-display
    /* Removes an image within the coordinates of your hand from the selected images list. Adds it to side-display */
    var removeFromSelectedImages = function(hand) {
      var handPosition = hand.screenPosition();
      var index = 0;

      for (; index < selectedImages.length; index++) {
        var currentImage = selectedImages[index];
        //Check if image is under hand
        if (selectedImages[index].isInBounds(handPosition[0], handPosition[1])) {
          //Add image back to side-display
          listImages.push(currentImage);
          //Remove from selected images
          selectedImages.splice(index, 1);
          return;
        }
      }
    }

    /* (USED FOR TESTING GESTURES) - Identifies the types of in-built gestures and prints the gesture to console */
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

    /* (USED FOR TESTING GESTURES) - Identifies the types of hand gestures and prints the gesture to console */
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