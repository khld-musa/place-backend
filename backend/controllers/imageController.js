const fs = require('fs');
const path = require("path");
const ErrorHandler = require("../utilities/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getUserImages = catchAsyncErrors(async (req, res, next) => {
  
    var arr=req.url.split('/');
    console.log(arr);
    // console.log(arr);
    if (arr.length>=1){
        if ( arr[1] == 'userImages'){ 
            let pathImage = __dirname+'/'+arr[1] + '/' + arr[2];
            console.log(pathImage);
            let pathTow = __dirname+'/'+arr[1]+'/undfine.png';
            if (fs.existsSync(pathImage)){
                res.status(200).header("Content-Type","text/html").sendFile(path.join(pathImage));
            }else{
                console.log('GET No Image In Path = ' + pathImage)
                res.status(200).header("Content-Type","text/html").sendFile(path.join(pathTow));
            }
            // console.log(p);
        }else if (arr[1] === 'null' || arr[1] === 'undefined'){
            console.log('GET Undefined OR Null')
            let pathTow = __dirname+'/../assets/images/undfine.png';
            res.status(200).header("Content-Type","text/html").sendFile(path.join(pathTow));
        }else {
            next()
        }
    } else{
        next()
    }
});


