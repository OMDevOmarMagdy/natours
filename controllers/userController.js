const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

// Where i store it and how (name)
const multerStorage = multer.diskStorage({
  destination: (req, file, cl) => {
    cl(null, 'public/img/users');
  },
  filename: (req, file, cl) => {
    const ext = file.mimetype.split('/')[1];
    // When you create a name make sure that this name is unique, So we did this:
    cl(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

// Make sure that only images are uploaded
const multerFilter = (req, file, cl) => {
  if (file.mimetype.startsWith('image')) {
    cl(null, true); // Accept
  } else {
    cl(new AppError('Not an image, Please upload only images.', 400), false); // Rejected
  }
};

// Upload the photo (file)
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

const fiterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Check that the user not specify the password filed, create an error
  if (req.body.password)
    return next(
      new AppError(
        'This route not for updating the password, please use this, /updateMyPassword',
        400,
      ),
    );

  // Filtering the fields that the user allowed to update it
  const filteredBody = fiterObj(req.body, 'name', 'email');
  // console.log(filteredBody);

  // updating the user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // console.log(updatedUser);

  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = handlerFactory.getOne(User);
exports.getAllUsers = handlerFactory.getAll(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateUser = handlerFactory.updateOne(User);
