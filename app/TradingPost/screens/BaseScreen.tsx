import React, { Component, PropsWithChildren } from "react"
import { Layout, LayoutComponent, Navigation, Options } from "react-native-navigation"
import { BaseScreen, BaseScreenProps } from "../layouts/BaseLayout"

export abstract class Screen<T, LProps = BaseScreenProps> {

    protected Layout: React.FC<PropsWithChildren<LProps>> = BaseScreen
    //can create a magic setter for this
    abstract layoutProps: LProps;
    
    abstract Content: React.FC<T & { componentId: string }>
    protected readonly isFullScreen = false;
    get componentName() {
        return this.constructor.name
    };
    constructor() {
        //register screen
        Navigation.registerComponent(this.constructor.name, () => this.Component);

    }
    Component: React.FC<PropsWithChildren<T & { componentId: string }>> = (props) => {
        const { Layout, Content } = this;
        return <Layout {...this.layoutProps}>
            <Content {...props} />
        </Layout>
    }
    getLayout(componentSettings?: Omit<LayoutComponent, "name"> & { alignment?: "fill" | "center" }): Layout {
        return {
            component: {
                name: this.componentName,
                ...componentSettings
            }
        }
    }
    open(componentId: string, props: Omit<T & { layoutProps: LProps }, "layoutProps">) {
        Navigation.push(componentId, this.getLayout(this.isFullScreen ? makeFullScreenSettings(props) : props))
    }
}

// export const openPeopleScreen = (componentId: string, props?: PeopleScreenProps) => {
//     dashboardScreens.push(componentId, "people", makeFullScreenSettings(props));
// }

export const fullScreenProps = {
    isFullscreen: true
}


export const fullDashOptions: Options = {
    sideMenu: {
        left: {
            visible: false
        }
    },
    bottomTabs: {
        visible: false
    },
    topBar: {
        leftButtons: [
        ],
        backButton: {
            visible: true
        }
    }
};

export const fullScreenSettings = {
    options: fullDashOptions,
    passProps: fullScreenProps
}

export const makeFullScreenSettings = <T,>(props: T) => {
    return {
        options: fullDashOptions,
        passProps: {
            ...fullScreenProps,
            ...props
        }

    }
}

// function getComponent(name: NavigationKey, componentSettings?: Omit<LayoutComponent, "name"> & { alignment?: "fill" | "center" }): LayoutComponent & { name: string } {
//     return {
//         name: `${prefix}_${name}`,
//         ...componentSettings
//     }
// }