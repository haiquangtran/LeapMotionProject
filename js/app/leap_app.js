var App = function () {

    // Global vars
    var mainImages = [];
    var listImages = [];
    var selectedImages = [];

    /* Helper variables - set in uiInit() */
    var page, pageContent, sidebar, imageDisplay;

    /* Initialisation Leap Motion Code */
    var leapInit = function () {

        Leap.loop(function (frame) {

            if (frame.hands.length > 0) {
                var hand = frame.hands[0];
                var palmPosition = hand.palmPosition;
                var velocity = hand.palmVelocity;
                var direction = hand.direction;
                var handPosition = hand.screenPosition();
                var xValue = parseInt(handPosition[0], 10) + "px";
                var yValue = parseInt(handPosition[1], 10) + "px";
                $("#cursor").css("top", xValue);
                $("#cursor").css("left", yValue);
            }

        }).use('screenPosition', {
            scale: 0.25
        });

        // This is fairly important - it prevents the framerate from dropping while there are no hands in the frame.
        // Should probably default to true in LeapJS.
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
            //testInit();     // Initialise Test Code
            //leapInit();     // Initialise LeapMotion Code
        }
    };
}();

/* Initialise app when page loads */
$(function () {
    App.init();
});