const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_LOCAL_URI)
        .then(con => {
            console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
        });
};

module.exports = connectDatabase;