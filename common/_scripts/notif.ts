// import apn from 'apn';

// (async () => {
//     const options = {
//         token: {
//             key: 'AuthKey_LH8Y46Z2SG.p8',
//             keyId: 'LH8Y46Z2SG',
//             teamId: '25L2ZZWUPA',
//         }
//     };

//     const apnProvider = new apn.Provider(options);
//     const note = new apn.Notification();
//     note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
//     note.badge = 3;
//     note.sound = "ping.aiff";
//     note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
//     note.payload = {'messageFrom': 'John Appleseed'};
//     note.topic = "com.tradingpostapp";
//     const t = "c75a0f402b10ba7750b1a6446fa8431ff1f890147e54d573eb774cad39e5e106"
//     const res = await apnProvider.send(note, t)
//     console.log(res.failed);
// })();

// FCM Notifications
/////////////////////
// await fetch('https://fcm.googleapis.com/fcm/send', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         Authorization: `key=<FCM-SERVER-KEY>`,
//     },
//     body: JSON.stringify({
//         to: '<NATIVE-DEVICE-PUSH-TOKEN>',
//         priority: 'normal',
//         data: {
//             experienceId: '@yourExpoUsername/yourProjectSlug',
//             scopeKey: '@yourExpoUsername/yourProjectSlug',
//             title: "📧 You've got mail",
//             message: 'Hello world! 🌐',
//         },
//     }),
// });