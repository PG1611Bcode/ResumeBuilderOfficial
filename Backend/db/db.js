const mongoose = require('mongoose');

async function connectToDb() {
    if (mongoose.connection.readyState === 1) {
        console.log('Using existing MongoDB connection');
        return mongoose.connection;
    }

    try {
        const db = await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to MongoDB');
        return db;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports = connectToDb;