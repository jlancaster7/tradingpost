"use strict";
// import {FinicityApi} from "../../brokerage/api";
// import fs from "fs";
// import {DateTime} from 'luxon';
//
// const partnerId = "2445583954353";
// const partnerSecret = "S09usVIRgcwpESXQ6t17";
// const appKey = "a50d4232043a9be55eb851070b1d964f";
// const customerUsername = "demo";
// const applicationId = "tbd";
//
// (async () => {
//     const finApi = new FinicityApi();
//     // const accessToken = await finApi.partnerAuthentication(partnerId, partnerSecret, appKey);
//
//     // if (accessToken === null) return
//     const d = JSON.parse(fs.readFileSync("test.json", "utf8"))
//     const accessToken = d.accessToken;
//     // fs.writeFileSync("test.json", JSON.stringify({
//     //     expire: DateTime.now().plus({hour: 1, minute: 30}),
//     //     accessToken
//     // }));
//     console.log("Starting....")
//     const customers = await finApi.getCustomers(accessToken.token, appKey)
//     console.log(customers)
//     // const customer = await finApi.addTestCustomer(customerUsername, accessToken.token, appKey)
//     // console.log(customer);
//     // if (customer === null) return
//     // const connect = await finApi.generateConnectUrl(accessToken.token, appKey, partnerId, customer.id, "https://localhost123.com/webhook")
//     // console.log(connect)
// })()
//
// // Ixh7RFVnqtRp59I32Hl3
// /**
//  * Customers:  {
//  *   id: '6002806392',
//  *   username: 'testing....',
//  *   createdDate: '1653790102'
//  * }
//  */
