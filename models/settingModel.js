const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    // Donate Settings
    donateBankId: {
        type: String,
        default: 'MB'
    },
    donateAccountNo: {
        type: String,
        default: '0912572421202'
    },
    donateAccountName: {
        type: String,
        default: 'LÂM CHÍ LỘC'
    },
    // Google OAuth Settings
    googleClientId: {
        type: String,
        default: ''
    },
    googleClientSecret: {
        type: String,
        default: ''
    },
    // Cloudinary Storage Settings
    cloudinaryCloudName: {
        type: String,
        default: ''
    },
    cloudinaryApiKey: {
        type: String,
        default: ''
    },
    cloudinaryApiSecret: {
        type: String,
        default: ''
    },
    // SMTP Email Server Settings
    smtpHost: {
        type: String,
        default: 'smtp.gmail.com'
    },
    smtpPort: {
        type: Number,
        default: 587
    },
    smtpUser: {
        type: String,
        default: ''
    },
    smtpPass: {
        type: String,
        default: ''
    },
    smtpSecure: {
        type: Boolean,
        default: false
    },
    smtpFromName: {
        type: String,
        default: 'Veltrix Voice'
    },
    // System General Settings
    siteName: {
        type: String,
        default: 'Veltrix Voice'
    },
    contactEmail: {
        type: String,
        default: 'support@veltrix.ai'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    // AWS Polly TTS Settings
    awsAccessKeyId: {
        type: String,
        default: 'AKIA37VE327K2UFYQ4AW'
    },
    awsSecretAccessKey: {
        type: String,
        default: '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'
    },
    awsRegion: {
        type: String,
        default: 'us-east-1'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
