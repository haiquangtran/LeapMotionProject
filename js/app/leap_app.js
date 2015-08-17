// The entire application is namespaced behind this App variable
var App = function () {

    /*
    =================================================================
    APP VARIABLES
    =================================================================
    */

    // detect is provides detection for abstracted leap motion gestures
    var detect = new LeapDetector();

    // Uncomment LeapTester when testing is desired
    // var test = new LeapTester();

    // utility helps with general resizing and width measuring
    var utility = new LeapUtility();

    // The array of images currently in the main display
    var mainImages = [];

    // The array of images currently in the list display
    var listImages = [];

    // The array of selected images (if any) in the list display
    var selectedImages = [];

    // The selected image (if any) in the main display
    var selectedImage = null; //selected image in main display

    // Signifies whether the user is currently selecting or not
    var selecting = false;

    // Aesthetic value, so that images added to the main display are not hugging the border
    var yOffsetTotal = 10;

    /*
    =================================================================
    INTERACTION BUSINESS LOGIC
    =================================================================
    */

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
                scaleMainImage(frame, gesture);

            } else {
                //detect passive manipulation gestures
                if (selectedImage == null) {
                    //try and pick up main image if none already selected
                    selectMainImage(rightHand);
                } else {
                    //given we have an image selected...
                    // update the image's position
                    moveMainImage(rightHand);
                    // update the image's rotation
                    rotateMainImage(rightHand);
                    // update the image's z-index
                    bringForwardMainImage(rightHand);
                    bringBackwardMainImage(rightHand);
                    // update z-index if there is occlusion, to brind selected image on top
                    changeZIndex(rightHand);
                }

            }
        }

    };

    /* Handles the case where selectedImage and another image have the same z index */
    var changeZIndex = function (hand) {
        if (selectedImage == null) {
            return;
        }

        // get the currently selected image's z-index
        var zIndex = $(selectedImage.IMAGE).css("z-index");
        var handPosition = hand.screenPosition();
        var index = 0;
        // iterate through the main images
        for (; index < mainImages.length; index++) {
            var currentImage = mainImages[index];
            //the z index of the image below
            var belowZIndex = $(currentImage.IMAGE).css("z-index");

            // if the image being inspected is not the selected image,
            // and it is in the bounds of where we are currently selecting
            // and the images are at the same zIndex....
            if (selectedImage != currentImage
                && currentImage.isInBounds(handPosition[0], handPosition[1])
                && zIndex == belowZIndex) {

                // Move the images along the z-index accordingly
                if (zIndex == selectedImage.MIN_Z) {
                    // if they are at the bottom
                    currentImage.bringForward();
                    selectedImage.bringBackward();
                } else if (zIndex == selectedImage.MAX_Z) {
                    // if they are at the top
                    currentImage.bringBackward();
                    selectedImage.bringForward();
                }
            }
        }

    }

    /* check whether we are signalling selection */
    var detectSelection = function (hand) {
        // if the hand is present, and it is grabbing ...
        if (hand != null && detect.handIsGrabbing(hand)) {
            // check if it was previously not selecting
            if (selecting === false) {
                //it's a change, update cursor state to selecting
                $("#cursor").addClass("selecting");
            }
            // update the current state, as hand grabbing signifies selection
            selecting = true;
        } else {
        // if the hand is not present or it is not grabbing...
            if (selecting == true) {
                //release all images if hand opens
                if (!detect.handIsGrabbing(hand)) {
                    // iterate through and update the slected image state to 'not selected'
                    var index = 0;
                    for (; index < selectedImages.length; index++) {
                        var currentImage = selectedImages[index];
                        $(currentImage.IMAGE).removeClass("selected");
                    }
                }
                //it's a change, update cursor state
                $("#cursor").removeClass("selecting");
            }
            // update the current state, as the user is not inidicating selectopn
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

        // Check if the hand is backward relative to the leap motion...
        // if so, move the selected image forward
        if (detect.handIsBackward(hand)) {
            selectedImage.bringForward();
        }
    };

    /* Bring backward the main image. */
    var bringBackwardMainImage = function (hand) {
        if (selectedImage == null) {
            return;
        }

        // Check if the hand is forward relative to the leap motion...
        // if so, move the selected image backward
        if (detect.handIsForward(hand)) {
            selectedImage.bringBackward();
        }
    };

    /* Scale the selectedImage on the main display. */
    var scaleMainImage = function (frame, gesture) {
        if (selectedImage == null) {
            return;
        }
        
        // check if we can recognise circle gestures...
        if (detect.gestureIsCircle(gesture)) {
            var circleRadius = gesture.radius;
            var completeCircles = Math.floor(gesture.progress);
            var minRadius = 5;
            var maxRadius = 30;
            var numCircles = 1; 
            
            // circle constraints
            if (completeCircles >= numCircles 
                && circleRadius >= minRadius && circleRadius <= maxRadius) {
                // scale accordingly
                if (detect.gestureIsClockwiseCircle(frame, gesture)) {
                    selectedImage.scaleUp();
                } else if (detect.gestureIsCounterClockwiseCircle(frame, gesture)) {
                    selectedImage.scaleDown();
                }
            }
        }
    };

    /* Gesture action for selecting multiples images in the side display. */
    var selectMultipleImagesGesture = function (hand, gesture) {
        if (listImages.length == 0 || selectedImage != null) {
            return;
        }

        // if we are selecting, check if the hand is over an image and add it to the selected array
        if (selecting) {
            addToSelectedImages(hand);
        }
    };

    /* Gesture action for moving multiples selected images in the side display to the main display. */
    var moveToMainDisplayGesture = function (gesture) {
        if (selectedImages.length == 0) {
            return;
        }

        // if we detect a left swipe, move the selected images to the main display
        if (detect.gestureIsLeftSwipe(gesture)) {
            moveToMainDisplay(gesture);
        }
    };

    /* Moves selected images from side-display into main display */
    var moveToMainDisplay = function (gesture) {
        addToMainImages();

        var index = 0; var offset = 10; var startX = document.getElementById("image-display").offsetWidth;
        for (; index < mainImages.length; index++) {
            var currentImage = mainImages[index];
            var imageHeight = currentImage.IMAGE.clientHeight;

            //only move images from side-display
            if (!currentImage._isInMainDisplay()) {
                currentImage.addToDisplay("MAIN");

                currentImage.moveTo(startX - currentImage.IMAGE.clientWidth, offset + yOffsetTotal);
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

    /*
    =================================================================
    APP BUSINESS LOGIC INITIALISATION
    =================================================================
    */

    /* Initialisation Leap Motion Code */
    var leapInit = function () {

        var leapController = Leap.loop({
            enableGestures: true
        }, function (frame) {

            //left hand, solely for indicating whether we are selecting
            var leftHand = detect.getHand("left", frame.hands);

            //keep updating whether we are selecting
            detectSelection(leftHand);

            // given we can detect hands...
            if (frame.hands.length > 0) {

                //right hand, solely for manipulating/adding selected images
                var rightHand = detect.getHand("right", frame.hands);

                // given we can see a right hand update the cursor's position
                if (rightHand != null) {
                    var handPosition = rightHand.screenPosition();
                    var xValue = handPosition[0] + "px";
                    var yValue = handPosition[1] + "px";
                    // position update
                    $("#cursor").css("left", xValue);
                    $("#cursor").css("top", yValue);
                }

                // given we can see a right hand, and we are trying to select...
                if (selecting && rightHand != null) {
                    // try selecting multiples that will be moved to main display
                    selectMultipleImagesGesture(rightHand);
                } else if (!selecting) {
                    // otherwise, if we are not selecting release all selections, if any
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
        // Resize #page-content to fill empty space if exists (also add it to resize and orientationchange events)
        // Do initial fit
        utility.resizePageContent();
        // Bind window resize/orientation events to the resize function
        $(window).resize(function () {
            utility.resizePageContent();
        });
        $(window).bind('orientationchange', utility.resizePageContent);
    };

    return {
        init: function () {
            uiInit();       // Initialise UI Code
            imagesInit();   // Initialise Images Code
            leapInit();     // Initialise LeapMotion Code
        }
    };
}();

/* Initialise app when page loads */
$(function () {
    App.init();
});
