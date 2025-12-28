const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();

const fs = require('fs');
fs.writeFileSync('vapid_keys.txt',
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:admin@coj.com
`);
console.log('Keys written to vapid_keys.txt');
