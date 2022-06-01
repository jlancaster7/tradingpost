import React from 'react';
import { Alert } from "react-native";
//import { AmiraError } from '../AmiraError';

export function TBI() {
    return Alert.alert("To Be Implemented", "Method has not been implemented");
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
    return new Date(new Date().valueOf() + (pastDate ? -1 : 1) * random(31_536_000)).toUTCString()
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

const pctFormatter = Intl.NumberFormat('en-US', {
    style: 'percent',
})
/**** All of these should be moved to a formatter file */

export function toAmiraDate(date: Date) {
    return date.toISOString().replace(/Z/gi, '');
}
export function fromAmiraDate(date: string) {
    return new Date(date + 'Z');
}

const pct2Formatter = Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2
})

export function toPercent(number: number) {
    return (number === undefined || number === null) ? "" : pctFormatter.format(number)
}
export function toPercent2(number: number) {
    return (number === undefined || number === null) ? "" : pct2Formatter.format(number)
}
const thousandFormatter = Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 3
})
export function toThousands(number: number) {
    return thousandFormatter.format(number)
}
const currencyFormatter = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: "USD",
})

export function isoToDate(dateString: string) {
    return dateString.split("T")[0];
}
export function toDollars(number: number) {
    return toDollarsAndCents(number).split(".")[0];
}
export function toDollarsAndCents(number: number) {
    return currencyFormatter.format(number).split(".")[0];
}
