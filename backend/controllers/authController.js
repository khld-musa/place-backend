const User = require("../models/user");
const fs = require('fs');
const path = require('path');

const ErrorHandler = require("../utilities/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utilities/jwtToken");
const sendEmail = require("../utilities/sendMessage");
const { compare } = require("bcryptjs");
const configureMulter = require("../utilities/multer");

//registerOTP => /api/v1/register/otp
exports.registerOtp = catchAsyncErrors(async (req, res, next) => {
  // Get reset token
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getRegisterToken();

  await user.save({ validateBeforeSave: false });

  // const message = `Your password reset token is as follow:\n\n${resetToken}\n\nIf you have not requested this phone, then ignore it.`;
  const message = `Your password reset token is as follow:\n ${resetToken}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Validation OTP",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.registerToken = undefined;
    user.registerExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // Proceed with file upload after validations
  const upload = configureMulter("backend/controllers/userImages");
  upload(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message || "File upload error", 500));
    }

    const { fname, email, phone, password, confPassword, lname } = req.body;

    // Check if user with the given email already exists
    const user = await User.findOne({ email });
    if (user) {
      // Unlink the recently uploaded picture
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            return next(new ErrorHandler("Error deleting file", 500));
          }
        });
      }
      return next(new ErrorHandler("User with this email already exists", 404));
    }

    // Check if passwords match
    if (password !== confPassword) {
      return next(new ErrorHandler("Passwords do not match", 401));
    }

    const newUser = await User.create({
      fname,
      lname,
      email,
      phone,
      password,
      confPassword,
      avatar: {
        data: req.file.filename,
      },
    });

    res.status(200).json({
      success: true,
      newUser,
    });
  });
});

// validateOtp  => /api/v1/register/validation
exports.validateUserSignUp = catchAsyncErrors(async (req, res, next) => {
  const { registerUserToken } = req.body;

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.registerUserToken
    !== user.registerUserToken
  ) {
    return next(new ErrorHandler("invalid otp", 400));
  }
  sendToken(user, 200, res);
});



// Login User  =>  /api/v1/login


exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Checks if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // Finding user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or Password", 401));
  }

  // Checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or Password", 401));
  }

  sendToken(user, 200, res);
});

// Forgot Password   =>  /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // const message = `Your password reset token is as follow:\n\n${resetToken}\n\nIf you have not requested this phone, then ignore it.`;
  const message = `Your password reset token is as follow:\n ${resetToken}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Place Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password   =>  /api/v1/password/otp
exports.otp = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const { resetPasswordToken } = req.body;

  const user = await User.findOne({ phone: req.body.phone });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }


  if (req.body.resetPasswordToken !== user.resetPasswordToken) {
    return next(new ErrorHandler("invalid otp", 400));
  }

  res.status(200).json({
    success: true,
  });
});





// Reset Password   =>  /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const { resetPasswordToken } = req.body;

  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  if (req.body.resetPasswordToken !== user.resetPasswordToken) {
    return next(new ErrorHandler("invalid otp", 400));
  }

  // Setup new password
  user.password = req.body.password;

  await user.save();

  sendToken(user, 200, res);
});

// Get currently logged in user details   =>   /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update / Change password   =>  /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect"));
  }

  user.password = req.body.password;
  await user.save();

  sendToken(user, 200, res);
});

// // Update user profile   =>   /api/v1/me/update
// exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
//   const newUserData = {
//     fname: req.body.fname,
//     lname: req.body.lname,
//     email: req.body.email,
//     phone: req.body.phone,
//   };

//   const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   res.status(200).json({
//     success: true,
//   });
// });

// Update user profile   =>   /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const newUserData = {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
  };

  // Update avatar
  const upload = configureMulter("backend/controllers/userImages");
  upload(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message || "File upload error", 500));
    }

    if (req.file) {
      const avatarPath = path.join(__dirname, 'userImages', user.avatar.data);

      // Delete old avatar
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }

      newUserData.avatar = {
        data: req.file.filename,
      };
    }

    await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  });
});

// Logout user   =>   /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Admin Routes

// Get all users   =>   /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get user details   =>   /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user profile   =>   /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete user   =>   /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  await user.remove();


  res.status(200).json({
    success: true,
  });
});

compareExpDate = function (expDate) {
  let now = new Date().getTime();
  let exp = new Date(expDate).getTime();

  return exp > now;
}