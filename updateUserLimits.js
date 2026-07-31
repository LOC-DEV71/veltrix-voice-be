const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require('./models/userModel');
    const Plan = require('./models/planModel');

    const users = await User.find();
    for (const user of users) {
        const plan = await Plan.findOne({ code: user.tier || 'FREE' });
        if (plan) {
            user.maxCharsPerRequest = plan.maxCharsPerRequest;
            // Also update tokens limit if needed, but let's stick to maxCharsPerRequest for now
            if (user.tier === 'PRO') {
                user.dailyTokenLimit = 2000000;
                user.tokens = 2000000;
            }
            await user.save();
        }
    }
    console.log('Updated user max chars based on plans');
    process.exit(0);
});
