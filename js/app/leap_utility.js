function LeapUtility() {

    /* Helper constants, cache some often used jQuery objects */
    this.PAGE = $('#page-container'),
    this.PAGE_CONTENT = $('#page-content'),
    this.SIDEBAR = $('#sidebar'),
    this.IMAGE_DISPLAY = $('#image-display');

}

/* Gets window width cross browser */
LeapUtility.prototype.getWindowWidth = function () {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

/* Resize #page-content to fill empty space if exists */
LeapUtility.prototype.resizePageContent = function () {

    var windowH = $(window).height();
    this.PAGE_CONTENT.css('min-height', windowH + 'px');
    this.SIDEBAR.css('min-height', windowH + 'px');
    this.IMAGE_DISPLAY.css('min-height', windowH - 30 + 'px');

};
