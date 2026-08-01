require('dotenv').config();
const mongoose = require('mongoose');
const AudioLog = require('../models/audioLogModel');
const { generateSpeechBuffer } = require('../utils/ttsEngine');
const { uploadAudioBufferToCloudinary } = require('../utils/cloudinary');

async function fixEmptyAudioUrls() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🍃 DB Connected!");

        const emptyLogs = await AudioLog.find({
            $or: [
                { audioUrl: "" },
                { audioUrl: null },
                { audioUrl: { $exists: false } }
            ]
        });

        console.log(`🔍 Found ${emptyLogs.length} logs with empty audioUrl.`);

        for (const log of emptyLogs) {
            console.log(`🛠️ Fixing log ID: ${log._id} | Text: "${log.text.slice(0, 30)}..."`);
            try {
                const buf = await generateSpeechBuffer(log.text, log.voiceId || 'vi-VN-HoaiMyNeural');
                const cloudUrl = await uploadAudioBufferToCloudinary(buf);
                if (cloudUrl) {
                    log.audioUrl = cloudUrl;
                    await log.save();
                    console.log(`   ✅ SUCCESS! Updated audioUrl: ${cloudUrl}`);
                }
            } catch (err) {
                console.error(`   ❌ Failed to fix log ${log._id}:`, err.message);
            }
        }
    } catch (err) {
        console.error("Script Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

fixEmptyAudioUrls();
