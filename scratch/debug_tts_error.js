const { EdgeTTS } = require('node-edge-tts');
const path = require('path');
const fs = require('fs');

async function testWithPitch() {
    const text = "Xin chào! Đây là bài kiểm tra giọng đọc Microsoft Neural AI.";
    try {
        const tts = new EdgeTTS({
            voice: 'vi-VN-HoaiMyNeural',
            lang: 'vi-VN',
            outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
            rate: '+0%',
            pitch: '+0Hz'
        });
        const tempFile = path.join(__dirname, 'test_pitch.mp3');
        console.log("Calling ttsPromise with pitch...");
        await tts.ttsPromise(text, tempFile);
        console.log("File created size:", fs.statSync(tempFile).size);
        fs.unlinkSync(tempFile);
    } catch (e) {
        console.error("EXACT EDGETTS ERROR WITH PITCH:", e);
    }
}

testWithPitch();
