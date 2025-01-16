// const multer = require("multer");


//multer config
const multer = async (optionsUser) => {
const Storage = multer.diskStorage({
    destination: "backend/controllers/bokImages",
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        cb(new ErrorHandler("file type is not supported"), false);
        return;
      }
      cb(null, Date.now() + "-" + 'bokImages' + ext);
    },
  });
  
  const upload = multer({
    storage: Storage,
  }).single("testImage");
}

module.exports = multer;
