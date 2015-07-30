// class LeapImage
function LeapImage() {

  // helper vars
  this.imageDir = "img/";
  this.imageFormat = ".jpg";
  this.random_int = Math.floor(Math.random() * 28) + 1;

  // path to randomly generated image
  this.src_path = this.imageDir + this.random_int + this.imageFormat;

  // create new image
  this.IMAGE = new Image(190, 170);

  //set the image source to the path we created
  this.IMAGE.src = this.src_path;

};


//Add the image to the the panel specified
LeapImage.prototype.addToPanel = function (panel) {

  document.getElementById(panel).appendChild(this.IMAGE);

}
