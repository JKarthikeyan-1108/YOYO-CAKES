const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const gcloudBin = 'C:\\Users\\karth\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd';
  const token = execSync(`"${gcloudBin}" auth print-access-token`).toString().trim();
  const rulesContent = fs.readFileSync('firestore.rules', 'utf8');

  console.log('1. Creating Ruleset...');
  const postData = JSON.stringify({
    source: {
      files: [{ name: 'firestore.rules', content: rulesContent }],
    },
  });

  const rulesetRes = await makeRequest(
    {
      hostname: 'firebaserules.googleapis.com',
      path: '/v1/projects/yoyo-c46c3/rulesets',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    postData
  );

  const ruleset = JSON.parse(rulesetRes.body);
  console.log('Created ruleset:', ruleset.name);

  console.log('2. Creating Release for cloud.firestore...');
  const releasePayload = JSON.stringify({
    name: 'projects/yoyo-c46c3/releases/cloud.firestore',
    rulesetName: ruleset.name,
  });

  const createRes = await makeRequest(
    {
      hostname: 'firebaserules.googleapis.com',
      path: '/v1/projects/yoyo-c46c3/releases',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(releasePayload),
      },
    },
    releasePayload
  );

  console.log('Create release status:', createRes.status, createRes.body);
}

run().catch(console.error);
