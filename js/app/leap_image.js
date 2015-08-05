// class LeapImage
function LeapImage() {

    // helper vars
    var imageDir = "img/";
    var imageFormat = ".jpg";
    var random_int = Math.floor(Math.random() * 28) + 1;

    // path to randomly generated image
    var src_path = imageDir + random_int + imageFormat;

    // create new image
    this.IMAGE = new Image();

    // set the image source to the path we created
    this.IMAGE.src = src_path;

    this.IMAGE.width = 260;
    
    // set the z-index
    $(this.IMAGE).css('z-index', 0);
    
    // set temporary bound values
    this.minBoundX = 0;
    this.minBoundY = 0
    this.maxBoundX = 500;
    this.maxBoundY = 500;
    
    // images last modified timestamp
    this.last_modified = Date.now();
    
    //constants    
    this.IMAGE_TYPE = {
        THUMBNAIL: {
            imageClass: 'image-thumbnail',
            imageDestId: 'image-thumbnail-display'
        },
        MAIN: {
            imageClass: 'image movable',
            imageDestId: 'image-display'
        },
    };
    this.MIN_WIDTH = 100;
    this.MIN_Z = 0;
    this.MAX_WIDTH = 500;
    this.MAX_Z = 20;

};


// Add the image given the type specified
LeapImage.prototype.addToDisplay = function (displayType) {

    var foundType = null;

    for (type in this.IMAGE_TYPE) {

        if (type === displayType) {
            foundType = type;
            break;
        }

    }

    if (foundType != null) {

        var imageOptions = this.IMAGE_TYPE[foundType];
        var imageClass = imageOptions.imageClass;
        var imageDestId = imageOptions.imageDestId;

        // remove the element before we add it
        $(this.IMAGE).remove();
        
        $(this.IMAGE).addClass(imageClass);

        // add it
        document.getElementById(imageDestId).appendChild(this.IMAGE);

    } else {
        console.log("Unknown image type: " + displayType);
    }

}

LeapImage.prototype.tap = function () {
    if (this._isSelected()) {
        $(this.IMAGE).removeClass("selected");
    } else {
        $(this.IMAGE).addClass("selected")
    }   
}

LeapImage.prototype.moveTo = function (x, y) {
    
    this._calculateBounds();
    var coords = this._coords();

    this.IMAGE.style.left = Math.min(this.maxBoundX, Math.max(this.minBoundX, x)) + "px";
    this.IMAGE.style.top = Math.min(this.maxBoundY, Math.max(this.minBoundY, y)) + "px";
}


LeapImage.prototype.scaleUp = function () {
    this._scale(1.025);
}

LeapImage.prototype.scaleDown = function () {
    this._scale(0.975);
}

LeapImage.prototype.bringForward = function(){
    this._updateZIndex(1.0);
}

LeapImage.prototype.bringBackward = function(){
    this._updateZIndex(-1.0);
}

LeapImage.prototype.rotate = function(rotation){
    this._rotate(rotation);
}

LeapImage.prototype.isInBounds = function (x, y) {
    
    var coords = this._coords();
    
    var top = coords.top,
        bottom = coords.top + coords.height,
        left = coords.left,
        right = coords.left + coords.width;
    
    var satisfiesVerticalBounds = y > top && bottom > y;
    var satisfiesHorizontalBounds = x > left && right > x;
    
    return satisfiesHorizontalBounds && satisfiesVerticalBounds;
    
}

// Helper methods

LeapImage.prototype._isSelected = function () {
    return $(this.IMAGE).hasClass("selected");
}

LeapImage.prototype._isInMainDisplay = function () {
    var mainImageClass = this.IMAGE_TYPE["MAIN"].imageClass;
    return $(this.IMAGE).hasClass(mainImageClass);
}

LeapImage.prototype._scale = function (scale) {
    
    var width = $(this.IMAGE).css("width").replace(/[^-\d\.]/g, ''),
        newWidth = Math.floor(width * scale);
    
    if (newWidth > this.MIN_WIDTH && newWidth < this.MAX_WIDTH) {
        $(this.IMAGE).css("width", newWidth);
    }
}

LeapImage.prototype._rotate = function (rotation) {

    this.IMAGE.style.transform = 'rotate(' + -rotation + 'rad)';
    this.IMAGE.style.webkitTransform = this.IMAGE.style.MozTransform = this.IMAGE.style.msTransform =
    this.IMAGE.style.OTransform = this.IMAGE.style.transform;
    
}

LeapImage.prototype._updateZIndex = function (modZ) {
    var curZ = $(this.IMAGE).css('z-index').replace(/[^-\d\.]/g, ''),
        newZ = Number(curZ) + modZ;

    if (newZ > this.MIN_Z && newZ < this.MAX_Z) {
        $(this.IMAGE).css('z-index', newZ);
    }
}

LeapImage.prototype._coords = function () {
    
    var result = new Object();
    
    result.left = $(this.IMAGE).offset().left;
    result.top = $(this.IMAGE).offset().top;
    result.width = this.IMAGE.offsetWidth;
    result.height = this.IMAGE.offsetHeight;
    
    return result;
    
}

LeapImage.prototype._calculateBounds = function () {
    
    var parentElement = this._isInMainDisplay ? this.IMAGE_TYPE["MAIN"].imageDestId : this.IMAGE_TYPE["THUMBNAIL"].imageDestId,
        parentElement = $('#'+parentElement);
    
    var parentOffset = parentElement.offset();
    
    var parentOffsetTop = parentOffset.top,
        parentOffsetLeft = parentOffset.left,
        parentOffsetWidth = parentElement.outerWidth(),
        parentOffsetHeight = parentElement.outerHeight();
    
    var thisOffsetWidth = this.IMAGE.offsetWidth,
        thisOffsetHeight = this.IMAGE.offsetHeight;
    
    this.minBoundX = parentOffsetLeft;
    this.minBoundY = parentOffsetTop;
    this.maxBoundX = parentOffsetLeft + parentOffsetWidth - thisOffsetWidth;
    this.maxBoundY = parentOffsetTop + parentOffsetHeight - thisOffsetHeight;
    
    // for testing purposes
    this._setHelperBoxPos();
    
}

LeapImage.prototype._setHelperBoxPos = function () {
    var minBox = document.getElementById('min');
    minBox.style.left = this.minBoundX + 'px';
    minBox.style.top = this.minBoundY + 'px';
    
    var maxBox = document.getElementById('max');
    maxBox.style.left = this.maxBoundX + 'px';
    maxBox.style.top = this.maxBoundY + 'px';
}