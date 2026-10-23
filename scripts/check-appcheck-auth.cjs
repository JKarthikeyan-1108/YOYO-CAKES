const https = require('https');
const { execSync } = require('child_process');

const gcloudBin = 'C:\\Users\\karth\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd';
const token = execSync(`"${gcloudBin}" auth print-access-token`).toString().trim();

https.get('https://firebaseappcheck.googleapis.com/v1/projects/yoyo-c46c3/services/identitytoolkit.googleapis.com', { headers: { Authorization: `Bearer ${token}` } }, (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => console.log('AppCheck Identity Toolkit Service:', res.statusCode, b));
});
