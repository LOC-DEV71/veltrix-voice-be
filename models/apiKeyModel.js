const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Default API Key'
    },
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsedAt: {
        type: Date,
        default: null
    },
    allowedDomains: [{
        type: String,
        trim: true
    }]
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
