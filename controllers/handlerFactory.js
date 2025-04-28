const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('There are no document with this ID', 404));
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // that means --> we run validator again when we update not just createing
    });

    if (!doc) {
      return next(new AppError('There are no document with this ID', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (Model === 'Review') {
      if (!req.body.tour) req.body.tour = req.params.tourId;
      if (!req.body.user) req.body.user = req.user.id;
    }

    // Tour.create -> to create a tour in the database
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popObtions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popObtions) query = query.populate(popObtions);

    const doc = await query;
    if (!doc) {
      return next(new AppError('There are no document with this ID', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Skip this if statement --> contain old info before updating the code
    // if (false) {
    //   console.log(req.query);
    //   // BUILD THE QUERY
    //   // // 1.1. filtering
    //   // // here we make a new objcet contain the same properties of the req.query
    //   // const queryObject = { ...req.query };
    //   // const excludeFields = ['page', 'limit', 'sort', 'fields'];
    //   // excludeFields.forEach((el) => delete queryObject[el]);

    //   // // 1.2. Advanced filetering
    //   // let queryStr = JSON.stringify(queryObject);
    //   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //   // // console.log(JSON.parse(queryStr));

    //   // // find method is return a query (filtering using mongodb query)
    //   // let query = Tour.find(JSON.parse(queryStr));

    //   // // { duration: { $gte: 5}, difficulty: "easy"} --> mongodb query
    //   // // { duration: { gte: '5' }, difficulty: 'easy'} --> this from the req.query and the difference between it and mongodb query

    //   // 2. Sorting
    //   // if (req.query.sort) {
    //   //   const sortBy = req.query.sort.split(',').join(' ');
    //   //   query = query.sort(sortBy);
    //   //   // sort('price ratingsAverage')
    //   // } else {
    //   //   query = query.sort('-createdAt');
    //   // }

    //   // 3. Fields liminting
    //   // if (req.query.fields) {
    //   //   const fields = req.query.fields.split(',').join(' ');
    //   //   query = query.select(fields); // 'price name duration difficutly'
    //   // } else {
    //   //   query = query.select('-__v');
    //   // }

    //   // 4. Pagination
    //   // three results per page --> page = 2 and limit = 3
    //   // const page = req.query.page * 1 || 1;
    //   // const limit = req.query.limit * 1 || 100;
    //   // const skip = (page - 1) * limit;
    //   // query = query.skip(skip).limit(limit);

    //   // if (req.query.page) {
    //   //   const numTours = await Tour.countDocuments();
    //   //   if (skip >= numTours) throw new Error('This page does not exist');
    //   // }

    //   // const query = await Tour.find()
    //   //   .where('duration')
    //   //   .equals(5)
    //   //   .where('difficulty')
    //   //   .equals('easy');
    // }

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    console.log(filter);

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // query.sort().select().skip().limit()

    // SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
