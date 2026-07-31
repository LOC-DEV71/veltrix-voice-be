const http = require('http');

function postJson(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function testSequence() {
    console.log('----------------------------------------------------');
    console.log('🧪 KIỂM TRA THỨ TỰ THÔNG BÁO LỖI ĐĂNG NHẬP LIVE (HTTP API)');
    console.log('----------------------------------------------------\n');

    // Test 1: Email sai định dạng
    console.log('📌 Test 1: Nhập email sai định dạng ("invalid-email"):');
    const res1 = await postJson('/api/client/auth/login', { email: 'invalid-email', password: 'Password123!' });
    console.log(`   Status: ${res1.status} | Output: "${res1.data?.error}"`);

    // Test 2: Email không tồn tại trong DB
    console.log('\n📌 Test 2: Nhập email chưa từng đăng ký ("nonexistent12389@gmail.com"):');
    const res2 = await postJson('/api/client/auth/login', { email: 'nonexistent12389@gmail.com', password: 'Password123!' });
    console.log(`   Status: ${res2.status} | Output: "${res2.data?.error}"`);

    // Test 3: Email tồn tại nhưng sai mật khẩu
    console.log('\n📌 Test 3: Nhập Email tồn tại ("1945musictrending@gmail.com") nhưng MẬT KHẨU SAI:');
    const res3 = await postJson('/api/client/auth/login', { email: '1945musictrending@gmail.com', password: 'WrongPassword999!' });
    console.log(`   Status: ${res3.status} | Output: "${res3.data?.error}"`);

    console.log('\n----------------------------------------------------');
}

testSequence();
