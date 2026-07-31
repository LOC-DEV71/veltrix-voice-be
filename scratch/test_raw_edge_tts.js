const WebSocket = require('ws');
const crypto = require('crypto');

function generateEdgeTTS(text, voice = 'vi-VN-HoaiMyNeural') {
    return new Promise((resolve, reject) => {
        const requestId = crypto.randomBytes(16).toString('hex');
        const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EA5942DEA4198C125640778D&ConnectionId=${requestId}`;

        const ws = new WebSocket(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
                'Origin': 'chrome-extension://jdiccldimpdaibhpobmhopjdcmkbcgba',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const audioChunks = [];

        ws.on('open', () => {
            console.log('⚡ Connected to Microsoft Edge Neural TTS WebSocket!');
            
            // 1. Send speech.config
            const timestamp1 = new Date().toISOString();
            const configHeader = `Path: speech.config\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${timestamp1}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n`;
            const configBody = JSON.stringify({
                context: {
                    synthesis: {
                        audio: {
                            metadataversion: 'A6',
                            outputFormat: 'audio-24khz-96kbitrate-mono-mp3'
                        }
                    }
                }
            });
            ws.send(configHeader + configBody);

            // 2. Send SSML request
            const timestamp2 = new Date().toISOString();
            const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'><voice name='${voice}'><lang xml:lang='vi-VN'>${text}</lang></voice></speak>`;
            const ssmlHeader = `Path: ssml\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${timestamp2}\r\nContent-Type: application/ssml+xml\r\n\r\n`;
            ws.send(ssmlHeader + ssml);
        });

        ws.on('message', (data, isBinary) => {
            if (isBinary) {
                // Header is separated by \r\n\r\n, length is in 2-byte header
                const headerLength = data.readUInt16BE(0);
                const audioBuffer = data.slice(headerLength + 2);
                audioChunks.push(audioBuffer);
            } else {
                const str = data.toString();
                if (str.includes('Path:turn.end')) {
                    ws.close();
                    resolve(Buffer.concat(audioChunks));
                }
            }
        });

        ws.on('error', (err) => {
            reject(err);
        });

        ws.on('close', (code, reason) => {
            if (audioChunks.length > 0) {
                resolve(Buffer.concat(audioChunks));
            } else {
                reject(new Error(`WebSocket closed with code ${code}: ${reason}`));
            }
        });
    });
}

async function testRaw() {
    console.log('⏱️ Testing Raw Microsoft Edge Neural TTS (Hoài My / Nam Minh / Ava / Andrew)...');
    const startTime = Date.now();
    try {
        const buffer = await generateEdgeTTS("Xin chào! Tôi là giọng đọc Hoài My chuẩn Microsoft Neural HD cực kỳ tự nhiên.");
        console.log(`🎉 SUCCESS 100%! Microsoft Neural Buffer size: ${buffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch(e) {
        console.error('❌ Raw Error:', e);
    }
    process.exit();
}

testRaw();
