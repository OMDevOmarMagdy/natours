const Review = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = handlerFactory.getAll(Review);
exports.getReveiw = handlerFactory.getOne(Review);
exports.createReview = handlerFactory.createOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
