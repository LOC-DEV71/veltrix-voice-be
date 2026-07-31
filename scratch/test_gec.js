const WebSocket = require('ws');
const crypto = require('crypto');

function generateSecMSGECToken() {
    const ticks = (BigInt(Math.floor(Date.now() / 1000)) + 11644473600n) * 10000000n;
    const roundedTicks = ticks - (ticks % 3000000000n);
    const str = `${roundedTicks}6A5AA1D4EA5942DEA4198C125640778D`;
    return crypto.createHash('sha256').update(str, 'ascii').digest('hex').toUpperCase();
}

function generateEdgeTTS(text, voice = 'vi-VN-HoaiMyNeural') {
    return new Promise((resolve, reject) => {
        const requestId = crypto.randomBytes(16).toString('hex');
        const secToken = generateSecMSGECToken();
        const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EA5942DEA4198C125640778D&Sec-MS-GEC=${secToken}&Sec-MS-GEC-Version=1-130.0.2849.68&ConnectionId=${requestId}`;

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
            console.log('⚡ Connected with Sec-MS-GEC to Microsoft Edge Neural TTS!');
            
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

            const timestamp2 = new Date().toISOString();
            const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'><voice name='${voice}'><lang xml:lang='vi-VN'>${text}</lang></voice></speak>`;
            const ssmlHeader = `Path: ssml\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${timestamp2}\r\nContent-Type: application/ssml+xml\r\n\r\n`;
            ws.send(ssmlHeader + ssml);
        });

        ws.on('message', (data, isBinary) => {
            if (isBinary) {
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

        ws.on('error', reject);
        ws.on('close', (code, reason) => {
            if (audioChunks.length > 0) {
                resolve(Buffer.concat(audioChunks));
            } else {
                reject(new Error(`WebSocket closed code ${code}: ${reason}`));
            }
        });
    });
}

async function testGEC() {
    console.log('⏱️ Testing Microsoft Edge Neural HD Voice (Hoài My / Nam Minh / Ava / Andrew)...');
    const startTime = Date.now();
    try {
        const buffer = await generateEdgeTTS("Xin chào! Tôi là giọng đọc Hoài My chuẩn Microsoft Neural HD cực kỳ truyền cảm và tự nhiên.");
        console.log(`🎉 BINGO! MICROSOFT NEURAL VOICE HD GENERATED! Buffer size: ${buffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch(e) {
        console.error('❌ GEC Error:', e);
    }
    process.exit();
}

testGEC();
