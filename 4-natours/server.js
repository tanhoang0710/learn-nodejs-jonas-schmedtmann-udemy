const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
    path: './config.env',
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    // .connect(process.env.DATABASE_LOCAL, {
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log('DB connection successful!');
    });

const app = require('./app');

// 4) Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
