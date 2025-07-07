const https = require('https');

const publicKey = '8b926c9c9e675ab75a82bd9b4f1f01fc99ec27e141f56b6530105cec9f3938a704d103d51512b0482c86010b33097ca0f77c5d5f470a62ff85f201543e162496';

const data = JSON.stringify({
  publicKey: publicKey
});

const options = {
  hostname: 'faucet.flow.com',
  port: 443,
  path: '/fund-account',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);
  
  res.on('data', (d) => {
    console.log('Response:', d.toString());
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
