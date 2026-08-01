const http = require('http');

http.get('http://localhost:5000/api/client/tts/history/stream/6a6d99d827a8c7e2d95391d8', (res) => {
    console.log("Response Status Code:", res.statusCode);
    console.log("Response Headers:", res.headers);

    let dataLength = 0;
    res.on('data', chunk => dataLength += chunk.length);
    res.on('end', () => console.log("Total received bytes:", dataLength));
}).on('error', err => {
    console.error("HTTP Error:", err.message);
});
