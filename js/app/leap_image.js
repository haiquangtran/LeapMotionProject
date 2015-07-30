// class LeapImage
function LeapImage() {

    // helper vars
    var imageDir = "img/";
    var imageFormat = ".jpg";
    var random_int = Math.floor(Math.random() * 28) + 1;

    // path to randomly generated image
    var src_path = imageDir + random_int + imageFormat;

    // create new image
    this.IMAGE = new Image(190, 170);

    //set the image source to the path we created
    this.IMAGE.src = src_path;

    //constants
    this.IMAGE_TYPE = {
        THUMBNAIL: {
            imageClass: 'image-thumbnail',
            imageDestId: 'image-thumbnail-display'
        },
        MAIN: {
            imageClass: 'image',
            imageDestId: 'image-display'
        },
    };

};


//Add the image to the the panel specified
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

        $(this.IMAGE).addClass(imageClass);
        $(this.IMAGE).addClass("selected");

        document.getElementById(imageDestId).appendChild(this.IMAGE);

    } else {
        console.log("Unknown image type: " + displayType);
    }

}