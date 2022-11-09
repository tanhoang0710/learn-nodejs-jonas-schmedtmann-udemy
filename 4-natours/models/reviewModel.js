const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review / rating /createAt / ref to Tour / ref to user
const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
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

reviewSchema.pre(/^find/, function (next) {
    this
        // .populate({
        //     path: 'tour',
        //     select: 'name',
        // })
        .populate({
            path: 'user',
            select: 'name photo',
        });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId,
            },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: stats[0].nRating,
            ratingAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: 0,
            ratingAverage: 4.5,
        });
    }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
    // this points to current review

    // vì calcAverageRatings là hàm static nên cần Model để gọi
    // dùng this.constructor để trỏ đến Model
    // ko để dưới hàm 87 được vì lúc đấy reviewSchema sẽ ko áp dụng hàm post
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    //this point to Query
    this.review = await this.findOne(); // truyền sang cho post middleware
    console.log(this.review);

    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    // this.review = await this.findOne(); does NOT work because the query has already executed
    // cần dùng post vì cần tính toán lại rating trung bình theo document đã được update
    await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
