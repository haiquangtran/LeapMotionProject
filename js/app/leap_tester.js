//class LeapTester
function LeapTester() {
    //PLACE ANY CONSTANTS HERE
}

/* (USED FOR TESTING GESTURES) - Identifies the types of in-built gestures and prints the gesture to console */
LeapTester.prototype.printGestures = function(frame) {
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
LeapTester.prototype.printHandGestures = function(frame) {
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