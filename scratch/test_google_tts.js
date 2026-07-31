const googleTTS = require('google-tts-api');
const http = require('https');

async function testGoogleTTS() {
    console.log('⏱️ Testing google-tts-api speed...');
    const startTime = Date.now();
    try {
        const url = googleTTS.getAudioUrl('Xin chào! Đây là ứng dụng tạo giọng nói trí tuệ nhân tạo được xây dựng với chuẩn kiến trúc Redux Toolkit và MVC.', {
            lang: 'vi',
            slow: false,
            host: 'https://translate.google.com',
        });
        console.log('Got Audio URL:', url);

        // Fetch buffer
        const buffer = await new Promise((resolve, reject) => {
            http.get(url, (res) => {
                const chunks = [];
                res.on('data', c => chunks.push(c));
                res.on('end', () => resolve(Buffer.concat(chunks)));
                res.on('error', reject);
            });
        });

        console.log(`✅ SUCCESS! Buffer size: ${buffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch(e) {
        console.error('❌ Google TTS Error:', e);
    }
    process.exit();
}

testGoogleTTS();
