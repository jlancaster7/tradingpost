import {FlexStyle, TextStyle, ViewStyle} from "react-native";
import {AppColors} from "./constants/Colors";

export const flex = {flex: 1} as ViewStyle
export const row: ViewStyle = {flexDirection: "row"}
export const shadow: ViewStyle = {
    elevation: 4,
    shadowOffset: {height: 2, width: 2},
    shadowColor: "black",
    shadowOpacity: 0.125,
    shadowRadius: 0.25,
}

export const noMargin = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
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
    rem0_25: 4,
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


export const paddView = [flex, {padding: sizes.rem1, backgroundColor: AppColors.background}]
export const paddViewWhite = [...paddView, {backgroundColor: "white"}]

export const elevated =
    {
        marginHorizontal: 2,
        paddingVertical: 8,
        backgroundColor: "white",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 16,
        ...shadow
    }
export const shaded =
    {
        marginHorizontal: 2,
        paddingVertical: 8,
        //backgroundColor: "white",
        //borderColor: "#ccc",
        //borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        //...shadow
    }
export const companyProfileStyle = {
    upColor: '#1AA457',
    downColor: '#D81222',
    upBackgroundColor: 'rgba(53,162,101, 0.2)',
    downBackgroundColor: 'rgba(216,18,34, 0.2)',
    ticker: {
        fontWeight: '500',
        color: '#969696'
    },
    name: {
        fontWeight: '400',
        color: 'black'
    },
    pctChg: {
        fontWeight: '500',
    },
    price: {
        fontWeight: '400'
    }
}
export const companyProfileStyle1 = {
    upColor: '#1AA457',
    downColor: '#D81222',
    ticker: {
        fontWeight: '500',
        color: '#9D9D9D'
    },
    name: {
        fontWeight: '400'
    },
    pctChg: {
        fontWeight: '500',
    },
    price: {
        fontWeight: '400'
    }
}
export const companyProfileContentSizes = {
        medium: {
            avatarSize: 'medium',
            symbolSize: fonts.xSmall,
            nameSize: fonts.xSmall + 2,
            pxSize: fonts.xSmall + 2
        },
        large: {
            avatarSize: 'giant',
            symbolSize: fonts.small,
            nameSize: fonts.small + 2,
            pxSize: fonts.small + 2
        }
    }
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
export const thinBannerText = [bannerText, {
    marginHorizontal: 0, marginVertical: sizes.rem0_5
} as TextStyle]


export const textInputWiz = {
    marginVertical: sizes.rem0_5
} as ViewStyle