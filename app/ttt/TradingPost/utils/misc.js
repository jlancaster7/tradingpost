"use strict";
exports.__esModule = true;
exports.toDollarsAndCents = exports.toDollars = exports.toDateDayMonth = exports.toDateMonthYear = exports.isoToDate = exports.toNumber2 = exports.toThousands = exports.toPercent2 = exports.toPercent = exports.fromAmiraDate = exports.toAmiraDate = exports.badDate = exports.DEV_ONLY = exports.randomDateString = exports.randomText = exports.randomName = exports.randomArray = exports.random = exports.randomPrice = exports.TBI = void 0;
var numeral_1 = require("numeral");
function TBI() {
    return console.warn("Method has not been implemented");
}
exports.TBI = TBI;
function randomPrice() {
    return Math.round(Math.random() * 100 * 100) / 100;
}
exports.randomPrice = randomPrice;
function random(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
}
exports.random = random;
function randomArray(maxExclusive) {
    return Array.from(new Array(random(maxExclusive) + 1));
}
exports.randomArray = randomArray;
function randomName() {
    return ["JoshL", "LJames", "JodyH"][random(3)];
}
exports.randomName = randomName;
function randomText() {
    var texts = ["gaping",
        "woebegone",
        "sticky",
        "friendly",
        "fine",
        "free",
        "accessible",
        "subsequent",
        "labored",
        "tan",
        "curious",
        "brash",
        "cautious",
        "sassy",
        "mushy",
        "foreign",
        "rightful",
        "bad",
        "psychological",
        "talented",
        "grieving",
        "scrawny",
        "familiar",
        "thoughtless",
        "daily",
        "ritzy",
        "elite",
        "cool",
        "shrill",
        "skinny",
        "living",
        "opposite",
        "right",
        "red",
        "slippery",
        "mammoth",
        "great",
        "spooky",
        "polite",
        "spotted",
        "educated",
        "private",
        "six",
        "belligerent",
        "amuck",
        "successful",
        "exotic",
        "guilty",
        "prickly",
        "shiny",
    ];
    return texts[random(texts.length)];
}
exports.randomText = randomText;
function randomDateString(pastDate) {
    return new Date(new Date().valueOf() + (pastDate ? -1 : 1) * random(31536000)).toUTCString();
}
exports.randomDateString = randomDateString;
function DEV_ONLY(code) {
    if (!__DEV__)
        throw new Error("DEVELOPMENT CODE IS RUNNING IN PRODUCTION");
    //throw new AmiraError(-1,"DEVELOPMENT CODE IS RUNNING IN PRODUCTION");
    else
        code();
}
exports.DEV_ONLY = DEV_ONLY;
function badDate() {
    return toAmiraDate(new Date());
}
exports.badDate = badDate;
//const pctFormatter = numeral()
//NumberFormat('en-US', {
//  style: 'percent',
//})
/**** All of these should be moved to a formatter file */
function toAmiraDate(date) {
    return date.toISOString().replace(/Z/gi, '');
}
exports.toAmiraDate = toAmiraDate;
function fromAmiraDate(date) {
    return new Date(date + 'Z');
}
exports.fromAmiraDate = fromAmiraDate;
// const pct2Formatter = NumberFormat('en-US', {
//     style: 'percent',
//     minimumFractionDigits: 2
// })
function toPercent(number) {
    return (number === undefined || number === null) ? "" : (0, numeral_1["default"])(number).format('0%');
}
exports.toPercent = toPercent;
function toPercent2(number) {
    return (number === undefined || number === null) ? "" : (0, numeral_1["default"])(number).format('0.00%');
}
exports.toPercent2 = toPercent2;
// const thousandFormatter = NumberFormat('en-US', {
//     maximumSignificantDigits: 3
// })
function toThousands(number) {
    return (0, numeral_1["default"])(number).format('0,0');
}
exports.toThousands = toThousands;
function toNumber2(number) {
    return (number === undefined || number === null) ? "" : (0, numeral_1["default"])(number).format('0.00');
}
exports.toNumber2 = toNumber2;
// const currencyFormatter = NumberFormat('en-US', {
//     style: 'currency',
//     currency: "USD",
// })
function isoToDate(dateString) {
    return dateString.split("T")[0];
}
exports.isoToDate = isoToDate;
function toDateMonthYear(dateString) {
    var m = (new Date(dateString).toDateString().slice(4, 7));
    var y = String((new Date(dateString).getFullYear())).slice(2);
    return "".concat(m, "-").concat(y);
}
exports.toDateMonthYear = toDateMonthYear;
function toDateDayMonth(dateString) {
    var d = (new Date(dateString).toDateString().slice(8, 11));
    var m = (new Date(dateString).toDateString().slice(4, 7));
    return "".concat(d, " ").concat(m);
}
exports.toDateDayMonth = toDateDayMonth;
function toDollars(number) {
    return toDollarsAndCents(number).split(".")[0];
}
exports.toDollars = toDollars;
function toDollarsAndCents(number) {
    return (number === undefined || number === null) ? "" : (0, numeral_1["default"])(number).format('$0,0.00'); //currencyFormatter.format(number);
}
exports.toDollarsAndCents = toDollarsAndCents;
