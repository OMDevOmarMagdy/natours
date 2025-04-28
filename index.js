const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandling = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoute = require('./routes/reviewRoutes');

const app = express();
// console.log(process.env.NODE_ENV);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. Global Middlewares
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMl: 60 * 60 * 1000,
  message: 'Too many requests from this API, please try again in an hour',
});
app.use('/api', limiter);

// Data sanitization against NOsql query injection --> for more security
app.use(mongoSanitize());

// Data sanitization against XSS --> for more security
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'maxGroupSize',
      'difficulty',
      'ratingsQuantity',
      'ratingsAverage',
    ],
  }),
);

// Body parser, reading data from the body int req.body
app.use(express.json({ limit: '10kb' }));

// Test middleware: A middleware to execute the current time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);

  next();
});

// 2. Routes
app.get('/', (req, res) => {
  res.status(200).render('base');
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoute);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find this ${req.originalUrl} on the server`, 404));
  // This is the error that we pass it to the next middleware to handle it
  // AppError(`Can't find this ${req.originalUrl} on the server`, 404)
});

// Global error handling middleware
app.use(globalErrorHandling);

module.exports = app;
