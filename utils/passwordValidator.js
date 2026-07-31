/**
 * Utility Kiểm tra độ mạnh của Mật khẩu (Password Validator)
 * Quy định:
 * - Tối thiểu 8 ký tự
 * - Ít nhất 1 chữ cái in hoa (A-Z)
 * - Ít nhất 1 chữ số (0-9)
 * - Ít nhất 1 ký tự đặc biệt (!@#$%^&*())
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { 
            isValid: false, 
            message: 'Vui lòng nhập mật khẩu!' 
        };
    }

    if (password.length < 8) {
        return { 
            isValid: false, 
            message: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự!' 
        };
    }

    if (!/[A-Z]/.test(password)) {
        return { 
            isValid: false, 
            message: 'Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)!' 
        };
    }

    if (!/[0-9]/.test(password)) {
        return { 
            isValid: false, 
            message: 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!' 
        };
    }

    if (!/[!@#$%^&*()]/.test(password)) {
        return { 
            isValid: false, 
            message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*()!)' 
        };
    }

    return { 
        isValid: true, 
        message: '' 
    };
}

module.exports = {
    validatePassword
};
