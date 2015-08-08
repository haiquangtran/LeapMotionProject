function LeapDetector() {

    //PLACE ANY CONSTANTS HERE
    
}

/* GESTURE DETECTION */

/* HAND IS GRABBING */
LeapDetector.prototype.handIsGrabbing = function (hand) {

    if (hand.grabStrength == 1) {
        return true;
    }

    return false;

};

/* HAND TOWARDS SCREEN */
LeapDetector.prototype.handIsForward = function (hand) {
    var zIndex = hand.palmPosition[2];
    var threshold = 50;

    if (zIndex < -threshold) {
        return true;
    }

    return false; 

}

/* HAND AWAY FROM SCREEN */
LeapDetector.prototype.handIsBackward = function (hand) {
    var zIndex = hand.palmPosition[2];
    var threshold = 50;

    if (zIndex > threshold) {
        return true;
    }

    return false; 

}

/* RIGHT SWIPE */
LeapDetector.prototype.gestureIsRightSwipe = function (gesture) {

    if (gesture.type == "swipe") {
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

        if (isHorizontal) {
            //Right swipe
            if (gesture.direction[0] > 0) {

                return true;

            }
        }
    }

    return false;

};

/* LEFT SWIPE */
LeapDetector.prototype.gestureIsLeftSwipe = function (gesture) {

    if (gesture.type == "swipe") {
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

        if (isHorizontal) {
            //LEFT swipe
            if (gesture.direction[0] <= 0) {

                return true;

            }
        }
    }

    return false;

};

/* SCREEN TAP */
LeapDetector.prototype.gestureIsScreenTap = function (gesture){
   return (gesture.type == "screenTap");
};

/* CLOCKWISE CIRCLE */
LeapDetector.prototype.gestureIsClockwiseCircle = function (frame, gesture) {
    var circleProgress = gesture.progress;
    var clockwise = false;
    var pointableID = gesture.pointableIds[0];
    var direction = frame.pointable(pointableID).direction;
    var dotProduct = Leap.vec3.dot(direction, gesture.normal);

    if (dotProduct > 0) clockwise = true;

    if (clockwise) {
        return true;
    } else {
        return false;
    }

};

/* COUNTERCLOCKWISE CIRCLE */
LeapDetector.prototype.gestureIsCounterClockwiseCircle = function (frame, gesture) {
    //flip clockwise result
    return !this.gestureIsClockwiseCircle(frame, gesture);
};

/* PINCH IN */
LeapDetector.prototype.handIsPinchingIn = function (hand) {
    
    if (hand.pinchStrength > 0.8) {
        return true;
    }

};

/* PINCH OUT */
LeapDetector.prototype.handIsPinchingOut = function (hand) {
    
    if (hand.pinchStrength < 0.2) {
        return true;
    }
    
};


/* HELPER METHODS */

/* Get the specified hand from the hands detected (if present) */
/* NB: we expect hand to be "left" or "right" */
LeapDetector.prototype.getHand = function (hand, detectedHands) {

    var index = 0;
    for (; index < detectedHands.length; index++) {
        if (hand === detectedHands[index].type) {
            return detectedHands[index];
        }
    }

    //Unsuccessful
    return null;

};