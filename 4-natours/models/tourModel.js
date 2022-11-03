const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal 40 characters',
            ],
            minlength: [
                10,
                'A tour name must have more or equal 10 characters',
            ],
            // validator: [
            //     validator.isAlpha,
            //     'Tour name must only contains characters',
            // ],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a durations'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                // enum chi dung voi string
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // chỉ có tác dụng với create, ko có tác dụng với update
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a desciption'],
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

// dùng function thường vì trong trường hợp này cần this để trỏ đến từng document một
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual popolate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// Mongoose middleware

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
    });
    next();
});

// Nếu embedded users vào tours thì sẽ có nhiều drawback(hạn chế) bởi khi khi update thông tin của user thì sẽ phải update lại thông tin user trong tour nên t sẽ làm child reference

// tourSchema.pre('save', async function (next) {
//     const guidesPromise = this.guides.map(
//         async (id) => await User.findById(id)
//     );
//     this.guides = await Promise.all(guidesPromise);
//     next();
// });

// tourSchema.pre('save', (next) => {
//     console.log('Will save document...');
//     next();
// });

// // Document middleware: runs after .save() and .create()
// tourSchema.post('save', (doc, next) => {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
//     // lúc này this sẽ trỏ tới Query chứ ko trỏ đến document
//     this.find({
//         secretTour: {
//             $ne: true,
//         },
//     });
//     next();
// });

// vì pre hook find ko áp dụng lên find one
// tourSchema.pre('findOne', function (next) {
//     // lúc này this sẽ trỏ tới Query chứ ko trỏ đến document
//     this.find({
//         secretTour: {
//             $ne: true,
//         },
//     });
//     next();
// });

// Better way, áp dụng cho tất cả query bắt đầu bằng find
tourSchema.pre(/^find/, function (next) {
    // lúc này this sẽ trỏ tới Query chứ ko trỏ đến document
    this.find({
        secretTour: {
            $ne: true,
        },
    });

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt',
    });
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE

// this trỏ đến aggregation object
tourSchema.pre('aggregate', function (next) {
    this._pipeline.unshift({
        $match: {
            secretTour: {
                $ne: true,
            },
        },
    });
    console.log(this._pipeline);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
