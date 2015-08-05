var App = function () {

    // Global vars
    var detect = new LeapDetector();
    //var test = new LeapTester();
    var mainImages = [];
    var listImages = [];
    var selectedImages = [];
    var selectedImage = null; //selected image in main display
    var selecting = false;
    var yOffsetTotal = 10;

    /* Helper variables - set in uiInit() */
    var page, pageContent, sidebar, imageDisplay;

    /* Initialisation Leap Motion Code */
    var leapInit = function () {

        var leapController = Leap.loop({
            enableGestures: true
        }, function (frame) {

            //left hand, solely for indicating whether we are selecting
            var leftHand = detect.getHand("left", frame.hands);

            //TODO: maybe have a timer instead
            //keep updating whether we are selecting
            detectSelection(leftHand);
            
            if (frame.hands.length > 0) {

                //right hand, solely for manipulating/adding selected images
                var rightHand = detect.getHand("right", frame.hands);
                
                if (rightHand != null) {
                    var handPosition = rightHand.screenPosition();
                    var xValue = handPosition[0] + "px";
                    var yValue = handPosition[1] + "px";

                    $("#cursor").css("left", xValue);
                    $("#cursor").css("top", yValue);
                }

                if (selecting && rightHand != null) {
                    //Selecting multiples that will be moved to main display
                    selectMultipleImagesGesture(rightHand);
                } else if (!selecting) {
                    //release all selections, if any
                    deselectMainImage();
                    deselectListImages();
                }

                //Select or deselect image in main display
                manipulateMainImageGesture(frame);

            }

        }).use('screenPosition', {
            verticalOffset: 1200
        });

        //Recognize built-in gestures
        leapController.on("gesture", function (gesture, frame) {
            //Moving and manipulating an image in main display
            manipulateMainImageGesture(frame, gesture);
            moveToMainDisplayGesture(gesture);
        });

        // This is fairly important - it prevents the framerate from dropping while there are no hands in the frame.
        Leap.loopController.loopWhileDisconnected = true;

    };


    /* Gesture actions for selection and manipulating an image in the main display */
    var manipulateMainImageGesture = function (frame, gesture) {
        if (mainImages.length == 0) {
            return;
        }

        //Retrieve, the right hand which is for gesturing manipulation
        var rightHand = detect.getHand("right", frame.hands);
        
        //We (attempt to) manipulate when we are selecting and the right hand is on screen
        if (selecting && rightHand != null) {

            if (gesture != null) {
                //detect active manipulation gestures
                
                if (gesture.type == "circle") {
                    zoomMainImage(frame, gesture);
                }
                //TODO must detect if it's a pinching gesture
                //bringBackwardMainImage(rightHand);
                //bringForwardMainImage(rightHand);
                
            } else {
                //detect passive manipulation gestures
                
                if (selectedImage == null) {
                    //try and pick up main image if none already selected
                    selectMainImage(rightHand);
                } else {
                    //given we have an image selected
                    moveMainImage(rightHand);
                    rotateMainImage(rightHand);
                    bringForwardMainImage(rightHand);
                    bringBackwardMainImage(rightHand);
                }
               
            }
        }

    };
    
    /* check whether we are signalling selection */
    var detectSelection = function (hand) {

        if (hand != null) { //HEY GUYS: I'm just checking whether the left hand is present rather than clenched
            if(selecting === false){
                //it's a change, update cursor state
                $("#cursor").addClass("selecting");
            }
            selecting = true;
        } else {
            if(selecting === true){
                //it's a change, update cursor state
                $("#cursor").removeClass("selecting");
            }
            selecting = false;
        }

    };

    /* Selects image within coords of hand from the main display. Sets image as the SelectedImage. */
    var selectMainImage = function (hand) {
        if (selectedImage != null || selectedImages.length != 0) {
            return;
        }

        var handPosition = hand.screenPosition();
        var index = 0;
        for (; index < mainImages.length; index++) {
            var currentImage = mainImages[index];
            //Check if image is under hand
            if (currentImage.isInBounds(handPosition[0], handPosition[1])) {
                selectedImage = currentImage;
                selectedImage.tap();
                return;
            }
        }
    };

    /* Deselects the image from the main display. Sets selectedImage to null. */
    var deselectMainImage = function (hand) {
        if (selectedImage == null) {
            return;
        }
        selectedImage.tap();
        selectedImage = null;
    };

    /* Moves the selectedImage on the main display.  */
    var moveMainImage = function (hand) {
        if (selectedImage != null) {

            var handPosition = hand.screenPosition();
            //Align cursor in middle of image
            var x = handPosition[0] - selectedImage.IMAGE.width / 2;
            var y = handPosition[1] - selectedImage.IMAGE.height / 2;

            selectedImage.moveTo(x, y);
        }
    };

    /* Rotates the selectedImage on the main display. */
    var rotateMainImage = function (hand) {
        if (selectedImage == null) {
            return;
        }
        selectedImage.rotate(hand.roll());
    };

    /* Bring forward the main image. */
    var bringForwardMainImage = function (hand) {
        if (selectedImage == null) {
            return;
        }

        if (detect.handIsPinchingOut(hand)) {
            selectedImage.bringForward();
        }
    };
    
    /* Bring backward the main image. */
    var bringBackwardMainImage = function (hand) {
        if (selectedImage == null) {
            return;
        }

        if (detect.handIsPinchingIn(hand)) {
            selectedImage.bringBackward()
        }
    };

    /* Scale the selectedImage on the main display. */
    var zoomMainImage = function (frame, gesture) {
        if (selectedImage == null) {
            return;
        }
        
        if (detect.gestureIsClockwiseCircle(frame, gesture)) {
            selectedImage.scaleUp();
        } else if (detect.gestureIsCounterClockwiseCircle(frame, gesture)) {
            selectedImage.scaleDown();
        }
    };

    /* Gesture action for selecting multiples images in the side display. */
    var selectMultipleImagesGesture = function (hand, gesture) {
        if (listImages.length == 0 || selectedImage != null) {
            return;
        }

        if (selecting) {
            addToSelectedImages(hand);
        }
    };

    /* Gesture action for moving multiples selected images in the side display to the main display. */
    var moveToMainDisplayGesture = function (gesture) {
        if (selectedImages.length == 0) {
            return;
        }

        if (detect.gestureIsRightSwipe(gesture)) {
            moveToMainDisplay(gesture);
        }
    };

    /* Moves selected images from side-display into main display */
    var moveToMainDisplay = function (gesture) {
        addToMainImages();

        var index = 0; var offset = 10;
        for (; index < mainImages.length; index++) {
            var currentImage = mainImages[index];
            var imageHeight = currentImage.IMAGE.clientHeight;

            //only move images from side-display
            if (!currentImage._isInMainDisplay()) {
                currentImage.addToDisplay("MAIN");

                currentImage.moveTo(0, offset + yOffsetTotal);
                yOffsetTotal += imageHeight+offset;
            }
        }
    };

    /* Adds all images from selectedImages list into mainImages List. Deselects and removes all images in selectedImages list. */
    var addToMainImages = function () {
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
    var addToSelectedImages = function (hand) {
        var handPosition = hand.screenPosition();
        var index = 0;

        for (; index < listImages.length; index++) {
            var currentImage = listImages[index];
               
            //Check if image is under hand
            if (currentImage.isInBounds(handPosition[0], handPosition[1])) {
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
    var removeFromSelectedImages = function (hand) {
        var handPosition = hand.screenPosition();
        var index = 0;

        for (; index < selectedImages.length; index++) {
            var currentImage = selectedImages[index];
            //Check if image is under hand
            if (currentImage.isInBounds(handPosition[0], handPosition[1])) {
                //Add image back to side-display
                listImages.push(currentImage);
                //Remove from selected images
                selectedImages.splice(index, 1);
                return;
            }
        }
    };

    /* Unselect all selected list images */
    var deselectListImages = function () {
        
        var index = 0;
        for (; index < selectedImages.length; index++) {
            var currentImage = selectedImages[index];
            //Add image back to side-display
            listImages.push(currentImage);
            //Remove from selected images
            selectedImages.splice(index, 1);
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
        imageDisplay.css('min-height', windowH - 30 + 'px');

    };

    return {
        init: function () {
            uiInit();       // Initialise UI Code
            imagesInit();   // Initialise Images Code
            leapInit();     // Initialise LeapMotion Code
            //testInit();   // Initialise Test Code
        }
    };
}();

/* Initialise app when page loads */
$(function () {
    App.init();
});