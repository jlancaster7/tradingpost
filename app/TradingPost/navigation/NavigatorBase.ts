export abstract class NavigatorScreen { }

export abstract class NavigatorBase {
    abstract openLink(url: string): void;
    abstract openScreen(screen: NavigatorScreen): void;
    abstract popScreen(screen: NavigatorScreen): void;
}