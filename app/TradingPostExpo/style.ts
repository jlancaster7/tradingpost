import { FlexStyle, TextStyle, ViewStyle } from "react-native";

export const flex = { flex: 1 } as ViewStyle
export const row: ViewStyle = { flexDirection: "row" }
export const shadow: ViewStyle = {
    elevation: 4,
    shadowOffset: { height: 2, width: 2 },
    shadowColor: "black",
    shadowOpacity: 0.125,
    shadowRadius: 0.25,
}



export function rounded(size: number) {
    return {
        height: size,
        width: size,
        borderRadius: size / 2
    }
}

export const fonts = {
    xSmall: 12,
    small: 16,
    medium: 20,
    large: 24,
    xLarge: 32
}

export function font(size: keyof typeof fonts, color: string = "black", isBold: boolean = false) {
    return {
        fontSize: fonts[size],
        fontWeight: isBold ? "bold" : undefined,
        color: color
    } as TextStyle
}


export const sizes = {
    rem0_5: 8,
    rem1: 16,
    rem1_5: 24,
    rem2: 32,
    rem4: 64,
    rem6: 96,
    rem7: 112,
    rem8: 128,
    rem9: 144,
    rem10: 160,
    rem12: 192,
    rem16: 256,
    borderRadius: 2
}



export const paddView = [flex, { padding: sizes.rem1 }]


export const chartColors = [
    '#2dadf4',
    '#f5523b',
    '#66a1fa',
    '#ff4a6b',
    '#9891f4',
    '#f95399',
    '#c37de1',
    '#e567c1']


export const social = {
    substackColor: '#ff7731'
}

export const bannerText = {
    textAlign: "center", margin: sizes.rem2, fontSize: fonts.large, lineHeight: fonts.large * 1.5,
} as TextStyle

export const textInputWiz = {
    marginVertical: sizes.rem0_5
} as ViewStyle