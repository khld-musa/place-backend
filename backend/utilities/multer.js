const multer = require("multer");
const path = require("path");
const ErrorHandler = require("./errorHandler");

const configureMulter = (destination) => {
  const storage = multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        cb(new ErrorHandler("file type is not supported"), false);
        return;
      }
      cb(null, Date.now() + "-" + path.basename(destination) + ext);
    },
  });

  return multer({ storage }).single("testImage");
};

module.exports = configureMulter;
