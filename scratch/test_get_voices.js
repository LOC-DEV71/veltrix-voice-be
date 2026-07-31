require('dotenv').config();
const mongoose = require('mongoose');
const Voice = require('../models/voiceModel');
const ClientVoiceController = require('../controllers/client/voiceController');

async function testGetVoices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 DB Connected!');

        const allVoices = await Voice.find();
        console.log('🎙️ Total Voices in DB:', allVoices.length);
        allVoices.forEach(v => console.log(`   - Name: ${v.name} | Status: ${v.status} | voiceId: ${v.voiceId}`));

        // Mock req and res
        const req = { user: null };
        const res = {
            json: (data) => {
                console.log('\n✅ getVoices Output count:', data.voices?.length);
                console.log(JSON.stringify(data.voices, null, 2));
            },
            status: (code) => ({ json: (err) => console.error(`Status ${code}:`, err) })
        };

        await ClientVoiceController.getVoices(req, res);

    } catch (err) {
        console.error('❌ Test Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testGetVoices();
