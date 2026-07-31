/**
 * TTS Validator — Kiểm tra dữ liệu đầu vào cho Text-to-Speech
 * Tách riêng logic validation ra khỏi Controller cho sạch code
 */

/**
 * Validate request body cho TTS Preview
 */
function validatePreviewInput(req, res, next) {
    const { text, voice } = req.body;

    const sampleText = (text || '').trim();
    if (!sampleText) {
        return res.status(400).json({ error: 'Vui lòng nhập văn bản cần nghe thử.' });
    }

    if (!voice) {
        return res.status(400).json({ error: 'Vui lòng chọn giọng đọc.' });
    }

    // Giới hạn preview tối đa 200 ký tự
    req.body.text = sampleText.slice(0, 200);
    next();
}

/**
 * Validate request body cho TTS Generate (tạo audio thực)
 */
function validateGenerateInput(req, res, next) {
    const { text, voice } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Vui lòng nhập văn bản cần tạo giọng đọc!' });
    }

    if (!voice) {
        return res.status(400).json({ error: 'Vui lòng chọn giọng đọc.' });
    }

    next();
}

module.exports = {
    validatePreviewInput,
    validateGenerateInput
};
