"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const dt = luxon_1.DateTime.fromFormat("2022-07-22 13:30", "yyyy-LL-dd HH:mm", {
    zone: "America/New_York"
});
console.log(dt);
