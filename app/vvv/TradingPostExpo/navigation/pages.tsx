import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Interface } from '@tradingpost/common/api';
import { Table, TableProps } from '../components/Table';
import { NavIconKeys } from '../images';
import { PostScreen } from '../screens/PostScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TableModalScreen } from '../screens/TableModalScreen';

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}

type PagesWithoutParams<T extends keyof any> = {
    [P in T]: undefined
}
export type RootStackParamList =
    PagesWithoutParams<
        "Root" |
        "NotFound" |
        "AccountSettings" |
        "AccountInformation" |
        "Help" |
        "AppInformation" |
        "Launch" |
        "Create" |
        "Login" |
        "Dash" |
        "WatchlistViewer" |
        "WatchlistEditor" |
        "Watchlist" |
        "Auth" |
        "ImagePicker" |
        "ResetPassword" |
        "VerifyAccount" |
        "Subscription" |
        "SubscriptionSettings" |
        "NotificationTrade"
    > &
    {
        "Company": { securityId: number },
        "PostEditor": undefined,
        "TableModal": { title: string, tableProps: TableProps<any> },
        "PostScreen": { post: Interface.IElasticPostExt },
        "Profile": { userId: string },
    }

// {
//     Root: NavigatorScreenParams<RootTabParamList> | undefined;
//     Modal: undefined;
//     NotFound: undefined;
// };

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
    NativeStackScreenProps<
        RootStackParamList,
        Screen
    >;

export type DashTabParamList = {
    [P in NavIconKeys]: P extends "Feed" ? { bookmarkedOnly?: "true" | "false" } : undefined
}

export type DashTabScreenProps<Screen extends keyof DashTabParamList> = CompositeScreenProps<
    CompositeScreenProps<BottomTabScreenProps<DashTabParamList, Screen>, DrawerScreenProps<{ "Root": undefined }, "Root">>,
    NativeStackScreenProps<RootStackParamList>
>;

