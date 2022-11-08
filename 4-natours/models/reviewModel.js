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

    await Tour.findByIdAndUpdate(tourId, {
        ratingQuantity: stats[0].nRating,
        ratingAverage: stats[0].avgRating,
    });
};

reviewSchema.post('save', function () {
    // this points to current review

    // vì calcAverageRatings là hàm static nên cần Model để gọi
    // dùng this.constructor để trỏ đến Model
    // ko để dưới hàm 87 được vì lúc đấy reviewSchema sẽ ko áp dụng hàm post
    this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
