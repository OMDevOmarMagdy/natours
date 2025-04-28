/* eslint-disable arrow-body-style */
/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Create a token and return it
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Send the cookie to the client
  res.cookie('jwt', token, cookieOptions);

  // Remove the password form the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Sucess',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // We specify the fileds here because the user sign in as an admine
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // Token -> payload and secret and obtions
  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // we need to check if the password and email exist or not
  if (!email || !password) {
    return next(new AppError('Please provid email and password', 400));
  }

  // if the user exist or password is correct
  const user = await User.findOne({ email }).select('+password');

  // compare two psswords
  // const corrPass = user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 400));
  }

  // send token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log('🛡️ PROTECT middleware called');
  // 1. Check if there are a token or not and get it if exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError(
        'You are not logged in, please login to access the tours',
        401,
      ),
    );
  }

  // 2. Verification Token
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // promisify convert the veritfy to a function return a promise
  const verifyToken = promisify(jwt.verify);
  const decoded = await verifyToken(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3. Check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belong to this token does no loger be exist!!',
        401,
      ),
    );
  }

  // 4. Check if the user changed his pssword or not
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('The user changed the password, please login again!!', 401),
    );
  }

  req.user = currentUser;

  // Only For Check
  console.log('📦 Token:', token);
  console.log('🔑 Decoded:', decoded);
  console.log('👤 Found User:', currentUser);

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have the permission to do that!!!', 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('Threr is no user with this email address!!!', 404),
    );
  }

  // 2. Generate the random reset Token (New token for Creating Password)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. send it to user's email
  // Ex:
  // http://localhost:3000/api/v1/users/resetPassword/token
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  // console.log(resetURL);

  const message = `Forgot you password??? use this link ${resetURL}\nIf you don't please ignore this email`;
  // console.log(message);

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password',
      message,
    });

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There is an error sending an email, try again later', 500),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If the token has not expired and there is a user, set the new password
  if (!user)
    return next(new AppError('Token has expired or is invalid!!!!', 400));
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changedPassword property fo the user
  // 4. Log the user IN, Set the JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user
  const user = await User.findById(req.user.id).select('+password');

  // Check if current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // Sent JWT, Login
  createSendToken(user, 200, res);
});
