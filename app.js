var myApp = angular.module('myApp', ['dropzone', 'picker']);

myApp.controller('myappCtrl', function ($scope) {

    // initialise colours
    $scope.currentColor = "1";
    $scope.mypicker = "#BADA55";
    $scope.mypicker2 = "#B000B5";

    // function returns a colour with given relative luminance
    function ColorLuminance(hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    }

    // watch for changes in picked colours
    $scope.$watch('mypicker', function (newVal, oldVal) {
        $scope.col2Darker = ColorLuminance($scope.mypicker, -0.10);
        $scope.col2Lighter = ColorLuminance($scope.mypicker, 0.30);
        $scope.col2 = $scope.mypicker;
    });
    $scope.$watch('mypicker2', function (newVal, oldVal) {
        $scope.col1Darker = ColorLuminance($scope.mypicker2, -0.10);
        $scope.col1Lighter = ColorLuminance($scope.mypicker2, 0.30);
        $scope.col1 = $scope.mypicker2;
    });

    // change the colours with each other
    $scope.reverse = function() {
        var tmp = $scope.mypicker;
        $scope.mypicker = $scope.mypicker2;
        $scope.mypicker2 = tmp;

        $($('.sp-container')[0]).spectrum("set", $scope.mypicker2);
        $($('.sp-container')[1]).spectrum("set", $scope.mypicker);
    };

    // when editing first colour hide second picker and its hints
    $scope.editFirst = function () {
        $($('.sp-container')[1]).hide();
        $($('.sp-container')[0]).show();
        document.getElementById("secondInfo").style.visibility = "hidden";
        document.getElementById("firstInfo").style.visibility = "visible";

        document.getElementById("secondWrapper").className = "inactiveColor";
        document.getElementById("firstWrapper").className = "currentColor";

        $scope.currentColor = "1";
    }

    // when editing second colour hide first picker and its hints
    $scope.editSecond = function () {
        $($('.sp-container')[0]).hide();
        $($('.sp-container')[1]).show();
        document.getElementById("firstInfo").style.visibility = "hidden";
        document.getElementById("secondInfo").style.visibility = "visible";

        document.getElementById("firstWrapper").className = "inactiveColor";
        document.getElementById("secondWrapper").className = "currentColor";

        $scope.currentColor = "2";
    }

    $scope.btnFirst = function () {
        $("#firstColor").focus();
    }

    $scope.btnSecond = function () {
        $("#secondColor").focus();
    }

    // save colours; logo is being saved by DropzoneJS
    $scope.submitAll = function() {
        //this.preventDefault();
        //dropzone.processQueue();

        $("#colorsProgressBar").fadeIn(200);

        var color1 = $scope.mypicker,
            color2 = $scope.mypicker2;

        var req = $.ajax({
            type: 'POST',
            url: '/save-data',
            data: {
                color1: color1,
                color2: color2
            }
        })

        req.fail(function() {
            $("#chooseColors").append("<p style=\"clear:both;\">An error occured while saving the colours. Please contact us.</p>");
        });

        req.done(function() {
            window.location.reload(true);
        });
        // return false;
    }

    $scope.dropzoneConfig = {
        'options': { // passed into the Dropzone constructor
            url: "/",
            paramName: "image", // The name that will be used to transfer the file
            autoProcessQueue: true,
            maxFilesize: 5, // MB
            uploadMultiple: false,
            addRemoveLinks: false,
            dictDefaultMessage: "Drop files or click <span style=\"text-decoration: underline;\">in this area</span> to upload the logo",
            dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
            dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
            dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
            dictInvalidFileType: "You can't upload files of this type.",
            dictResponseError: "Server responded with {{statusCode}} code.",
            dictCancelUpload: "Cancel upload",
            dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
            dictRemoveFile: "Remove file",
            dictRemoveFileConfirmation: null,
            dictMaxFilesExceeded: "You can not upload any more files.",


            maxFiles: 1,
            thumbnailWidth: null,
            thumbnailHeight: 240,
            previewTemplate: document.querySelector('#preview-template').innerHTML,
            accept: function(file, done) {
            // the logo (file) is here, so we'll get ready to get colours from it

                function convertImageToCanvas(image) {
                    var canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    canvas.getContext("2d").drawImage(image, 0, 0);
                    return canvas;
                }

                function getRgbaFromCanvas(e) {
                    var x, y, rgba;
                    x = e.offsetX;
                    y = e.offsetY;
                    rgba = e.target.getContext('2d').getImageData(x, y, 1, 1).data;
                    rgba = "rgba(" + rgba.join(',') + ")";
                    return rgba;
                }

                function rgb2hex(rgb){
                    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                    return (rgb && rgb.length === 4) ? "#" +
                    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
                }

                var imgToCanvas = document.querySelector('#drp img'),
                    imgAsCanvas;

                $(".dz-progress").hide();

                $(imgToCanvas).one('load', function() {
                    imgAsCanvas = convertImageToCanvas(imgToCanvas);

                    $(imgToCanvas).replaceWith(imgAsCanvas);
                    $(imgAsCanvas).on("click", function(e) {
                            var rgba, hex;
                            rgba = getRgbaFromCanvas(e);
                            hex = rgb2hex(rgba);

                            if ($scope.currentColor === "1" )$scope.mypicker = hex;
                            if ($scope.currentColor === "2" )$scope.mypicker2 = hex;
                            $scope.$digest();
                    });
                    done();
                });
            },
            init: function() {
            // delete old preview, explained @ http://stackoverflow.com/a/19057630
                this.on("addedfile", function() {
                    if (this.files[1]!=null){
                        this.removeFile(this.files[0]);
                    }
                });
            // create a copy of the logo and put it on the product preview down below
                this.on("thumbnail", function(file) {
                    if (document.getElementById("uploadedCopy")) {
                        document.getElementById("productWrapper").removeChild(document.getElementById("uploadedCopy"));
                    }
                    var uploadedImgEncoded = $( '#drp img' ).attr("src");
                    var imgCopy = document.createElement("img");
                    imgCopy.setAttribute('src', uploadedImgEncoded);
                    imgCopy.setAttribute('id', 'uploadedCopy');
                    document.getElementById("productWrapper").appendChild(imgCopy);

                    function checkOuterWidth() { // workaround for chrome https://code.google.com/p/chromium/issues/detail?id=180838
                        if($('#uploadedCopy').outerWidth() === 0) {
                            window.setTimeout(checkOuterWidth, 100); /* this checks the flag every 100 milliseconds*/
                        } else {

                            setTimeout(function(){
                                var x = $('#uploadedCopy').outerWidth();
                                x = $('#productWrapper').width() -x;
                                x = x/1.6;
                                $('#uploadedCopy').css('left', x);
                            }, 100);

                        }
                    }
                    checkOuterWidth();
                });
            }

        },
        'eventHandlers': {
            'sending': function (file, xhr, formData) {
            },
            'success': function (file, response) {
            }
        }
    };
});