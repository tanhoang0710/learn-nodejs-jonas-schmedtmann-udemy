const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
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
        },
        ratingAverage: {
            type: Number,
            default: 4.5,
        },
        ratingQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: Number,
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

// Mongoose middleware

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
    });
    next();
});

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

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    console.log(docs);
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
