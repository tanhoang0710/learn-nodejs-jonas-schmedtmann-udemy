const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

// upload.single('image')
// upload.array('images', 5)

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    console.log(req.files);

    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );
    console.log(req.body.images);
    next();
});

exports.aliasTopTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     // BUILD QUERY
//     // 1A) Filtering
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['page', 'sort', 'limit', 'fields'];

//     // excludedFields.forEach((el) => delete queryObj[el]);

//     // // 1B) Advanced filtering
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(
//     //     /\b(gte|gt|lte|lt)\b/g,
//     //     (match) => `$${match}`
//     // );
//     // let query = Tour.find(JSON.parse(queryStr));

//     // const query = await Tour.find()
//     //     .where('duration')
//     //     .equals(5)
//     //     .where('difficulty')
//     //     .equals('easy');

//     // 2) Sorting
//     // if (req.query.sort) {
//     //     const sortBy = req.query.sort.split(',').join(' ');
//     //     query = query.sort(sortBy);
//     // } else {
//     //     query = query.sort('-createdAt');
//     // }

//     // 3) Field limiting
//     // if (req.query.fields) {
//     //     const fields = req.query.fields.split(',').join(' ');
//     //     query = query.select(fields);
//     // } else {
//     //     query = query.select('-__v');
//     // }

//     // 4) Pagination
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page - 1) * limit;

//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //     const numTours = await Tour.countDocuments();
//     //     if (skip >= numTours) throw new Error('This page does not exist');
//     // }

//     // EXECUTE QUERY
//     const features = new APIFeature(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .paginate();
//     const tours = await features.query;

//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours,
//         },
//     });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     // Tour.findOne({_id: req.params.id})

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour,
//         },
//     });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//     });

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null,
//     });
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingAverage: {
                    $gte: 4.5,
                },
            },
        }, // lay ra nhung tour co danh gia >= 4.5
        // roi nhom theo ID

        // ko group by
        // {
        //     $group: {
        //         _id: null,
        //         num: {
        //             $sum: 1,
        //         }, // moi tour di qua pipeline nay se tang num len 1
        //         numRatings: {
        //             $sum: '$ratingsQuantity',
        //         },
        //         avgRating: {
        //             $avg: '$ratingsAverage',
        //         },
        //         avgPrice: {
        //             $avg: '$price',
        //         },
        //         minPrice: {
        //             $min: '$price',
        //         },
        //         maxPrice: {
        //             $max: '$price',
        //         },
        //     },
        // },

        // group by difficulty
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                num: {
                    $sum: 1,
                }, // moi tour di qua pipeline nay se tang num len 1
                numRatings: {
                    $sum: '$ratingsQuantity',
                },
                avgRating: {
                    $avg: '$ratingAverage',
                },
                avgPrice: {
                    $avg: '$price',
                },
                minPrice: {
                    $min: '$price',
                },
                maxPrice: {
                    $max: '$price',
                },
            },
        },

        // group theo ratingAverage
        // {
        //     $group: {
        //         _id: '$ratingAverage',
        //         num: {
        //             $sum: 1,
        //         }, // moi tour di qua pipeline nay se tang num len 1
        //         numRatings: {
        //             $sum: '$ratingsQuantity',
        //         },
        //         avgRating: {
        //             $avg: '$ratingAverage',
        //         },
        //         avgPrice: {
        //             $avg: '$price',
        //         },
        //         minPrice: {
        //             $min: '$price',
        //         },
        //         maxPrice: {
        //             $max: '$price',
        //         },
        //     },
        // },

        // sort theo field moi'
        {
            $sort: {
                avgPrice: 1, // 1 for ascending
            },
        },

        // match lan nua chi lay document co difficuly khac EASY
        // {
        //     $match: {
        //         _id: {
        //             $ne: 'EASY',
        //         },
        //     },
        // },
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            // de tach field cua document ma co nhieu gia tri ra nhieu document ma field do chi co 1
            // vd 1 document:
            // {
            //     name: 'name',
            //     images: [
            //         'image1',
            //         'image2',
            //         'image3',
            //     ]
            // }
            // sau khi unwind theo images se thanh 3 document
            // {
            //     name: 'name',
            //     images: 'image1'
            // }
            // {
            //     name: 'name',
            //     images: 'image2'
            // }
            // {
            //     name: 'name',
            //     images: 'image3'
            // }
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: {
                    $month: '$startDates',
                },
                numToursStarts: {
                    $sum: 1,
                },
                tours: {
                    $push: '$name',
                },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                numToursStarts: -1,
            },
        },
        {
            $limit: 12,
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: { plan },
    });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/40,-45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // mi = mile or km
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitude and longtitude in the format lat,lng.',
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius],
            },
        },
    });
    console.log(distance, latlng, unit);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitude and longtitude in the format lat,lng.',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: distances.length,
        data: {
            data: distances,
        },
    });
});
