const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [false, "Please enter your first name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
  },
  lname: {
    type: String,
    required: [false, "Please enter your last name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false,
    match: [
      /^(?=.*\d)(?=.*[@#\-_$%^&+=§!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=§!\?]+$/,
      "Password must contain at leat 1 uppercase letter, 1 lowercase letter, 1 digit and a special character",
    ],
  },
  confPassword: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false,
    match: [
      /^(?=.*\d)(?=.*[@#\-_$%^&+=§!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=§!\?]+$/,
      "Password must contain at leat 1 uppercase letter, 1 lowercase letter, 1 digit and a special character",
    ],
  },
  phoneOtp: {
    type: String,
  },
  avatar : {
    data: String,
  },

  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  registerUserToken: String,
  registerUserExpire: Date,

});

// Encrypting password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("confPassword")) {
    next();
  }

  this.confPassword = await bcrypt.hash(this.confPassword, 10);
});

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
otpGen = function(){
  const otp = Math.floor(Math.random() * 10000) + '';
  if(otp.length == 4){
    return otp;
  }else{
    return otpGen();
  }
}
// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = otpGen();

  this.resetPasswordToken = resetToken;

  // Set token expire time
  this.regiserUserExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};


// Generate password reset token
userSchema.methods.getRegisterToken = function () {
  // Generate token
  const registerToken = otpGen();

  this.registerUserToken = registerToken;

  // Set token expire time
  this.resetUserExpire = Date.now() + 30 * 60 * 1000;

  return registerToken;
};

module.exports = mongoose.model("User", userSchema);
