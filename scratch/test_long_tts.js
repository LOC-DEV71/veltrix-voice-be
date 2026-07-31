const { EdgeTTS } = require('node-edge-tts');
const path = require('path');
const fs = require('fs');

async function testLongText() {
    const text = `Pin cũng là điểm ấn tượng. Nếu bạn là người dùng cơ bản thì không phải lo hết pin. Nếu bạn là người dùng tác vụ nặng liên tục trên điện thoại thì chiếc máy này đáp ứng rất tốt.

Vậy có đáng nâng cấp hay không? Nếu bạn đang dùng 11, 12, 13 hoặc muốn trải nghiệm màn hình tần số quét cao thì nâng cấp rất đáng cân nhắc. Còn nếu đang dùng 14 Pro trở lên thì chưa thực sự cần thiết.

Còn mọi người thì sao? Mọi người chọn nâng cấp hay tiếp tục gắn bó với chiếc điện thoại hiện tại? Bình luận bên dưới để mình biết với nhé!`;

    console.log("Testing text length:", text.length);

    try {
        const tts = new EdgeTTS({
            voice: 'vi-VN-HoaiMyNeural',
            lang: 'vi-VN',
            outputFormat: 'audio-24khz-96kbitrate-mono-mp3'
        });

        const tempFile = path.join(__dirname, 'test_long.mp3');
        await tts.ttsPromise(text, tempFile);
        console.log("SUCCESS EdgeTTS! File size:", fs.statSync(tempFile).size);
        fs.unlinkSync(tempFile);
    } catch (err) {
        console.error("FAIL EdgeTTS:", err);
    }
}

testLongText();
