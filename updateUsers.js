const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require('./models/userModel');
    await User.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'ACTIVE' } }
    );
    console.log('Updated existing users');
    process.exit(0);
});
