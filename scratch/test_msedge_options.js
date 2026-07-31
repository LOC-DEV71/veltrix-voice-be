const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

async function testOptions() {
    console.log('Testing msedge-tts variations...');

    // Test 1: Default toStream without prosody
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata('vi-VN-HoaiMyNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96BITRATE_MONO_MP3);
        const { audioStream } = tts.toStream('Xin chào mọi người');
        const chunks = [];
        await new Promise((resolve, reject) => {
            audioStream.on('data', c => chunks.push(c));
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });
        console.log('✅ Test 1 (No Prosody): SUCCESS, Buffer length =', Buffer.concat(chunks).length);
    } catch(e) {
        console.error('❌ Test 1 Failed:', e.message);
    }

    // Test 2: With Prosody rate: "+0%"
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata('vi-VN-HoaiMyNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96BITRATE_MONO_MP3);
        const { audioStream } = tts.toStream('Xin chào mọi người', { rate: '+0%' });
        const chunks = [];
        await new Promise((resolve, reject) => {
            audioStream.on('data', c => chunks.push(c));
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });
        console.log('✅ Test 2 (Prosody rate +0%): SUCCESS, Buffer length =', Buffer.concat(chunks).length);
    } catch(e) {
        console.error('❌ Test 2 Failed:', e.message);
    }

    process.exit();
}

testOptions();
