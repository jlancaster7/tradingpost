import React from 'react';
import { Alert } from "react-native";
import numeral, {} from 'numeral'
//import { AmiraError } from '../AmiraError';

export type AwaitedReturn<T extends (...args: any[]) => Promise<any>> = Awaited<ReturnType<T>>

export function TBI() {
    return console.warn("Method has not been implemented");
}

export function randomPrice() {
    return Math.round(Math.random() * 100 * 100) / 100;
}


export function random(maxExclusive: number) {
    return Math.floor(Math.random() * maxExclusive);
}


export function randomArray(maxExclusive: number) {
    return Array.from(new Array(random(maxExclusive) + 1))
}
export function randomName() {
    return ["JoshL", "LJames", "JodyH"][random(3)]
}

export function randomText() {
    const texts = ["gaping",
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
    ]
    return texts[random(texts.length)]
}

export function randomDateString(pastDate?: boolean) {
    return new Date(new Date().valueOf() + (pastDate ? -1 : 1) * random(31536000)).toUTCString()
}


export function DEV_ONLY(code: () => void) {
    if (!__DEV__)
        throw new Error("DEVELOPMENT CODE IS RUNNING IN PRODUCTION");
    //throw new AmiraError(-1,"DEVELOPMENT CODE IS RUNNING IN PRODUCTION");
    else
        code();
}

type All<T> = {
    [K in keyof T]-?: T[K]
}

export type Undefinable<T> = {
    [K in keyof All<T>]: (T[K] | undefined)
}

export function badDate() {
    return toAmiraDate(new Date())
}

//const pctFormatter = numeral()

//NumberFormat('en-US', {
  //  style: 'percent',
//})
/**** All of these should be moved to a formatter file */

export function toAmiraDate(date: Date) {
    return date.toISOString().replace(/Z/gi, '');
}
export function fromAmiraDate(date: string) {
    return new Date(date + 'Z');
}

// const pct2Formatter = NumberFormat('en-US', {
//     style: 'percent',
//     minimumFractionDigits: 2
// })

export function toPercent(number: number) {
    return (number === undefined || number === null) ? "" : numeral(number).format('0%')
}
export function toPercent1(number: number) {
    return (number === undefined || number === null) ? "" : numeral(number).format('0.0%')
}
export function toPercent2(number: number) {
    return (number === undefined || number === null) ? "" : numeral(number).format('0.00%')
}
// const thousandFormatter = NumberFormat('en-US', {
//     maximumSignificantDigits: 3
// })
export function toThousands(number: number) {
    return    numeral(number).format('0,0');
}
export function toNumber1(number: number) {
    return (number === undefined || number === null) ? "" : numeral(number).format('0.0')
}
export function toNumber2(number: number) {
    return (number === undefined || number === null) ? "" : numeral(number).format('0.00')
}
// const currencyFormatter = NumberFormat('en-US', {
//     style: 'currency',
//     currency: "USD",
// })

export function isoToDate(dateString: string) {
    return dateString.split("T")[0];
}
export function toDateMonthYear(dateString: string) {
    const m = (new Date(dateString).toDateString().slice(4,7));
    const y = String((new Date(dateString).getFullYear())).slice(2);
    return `${m}-${y}`;
}
export function toDateDayMonth(dateString: string) {
    const d = (new Date(dateString).toDateString().slice(8,11));
    const m = (new Date(dateString).toDateString().slice(4,7));
    return `${d} ${m}`;
}
export function toDollars(number: number) {
    return toDollarsAndCents(number).split(".")[0];
}
export function toDollarsAndCents(number: number | undefined | null) {
    return  (number === undefined || number === null) ? "" : numeral(number).format('$0,0.00') //currencyFormatter.format(number);
}
