const { MongoClient } = require('mongodb');

const uri = 'mongodb://193.49.52.71:27017/';
const client = new MongoClient(uri);

const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('db_straberry');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

module.exports = { connectDB, client };