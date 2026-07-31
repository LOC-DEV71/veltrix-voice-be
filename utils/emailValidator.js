/**
 * Utility Kiểm tra định dạng Email chuẩn (Email Format Validator)
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return {
            isValid: false,
            message: 'Vui lòng nhập Email!'
        };
    }

    const trimmedEmail = email.trim();

    // Standard Regex kiểm tra cấu trúc Email chuẩn: username@domain.ext
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) {
        return {
            isValid: false,
            message: 'Định dạng Email không hợp lệ! (Ví dụ hợp lệ: name@domain.com)'
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

module.exports = {
    validateEmail
};
