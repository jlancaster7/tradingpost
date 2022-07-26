import User from "./User";
declare const _default: Record<keyof User, (req: {
    body: any;
    extra: {
        userId: string;
    };
}) => Promise<any>>;
export default _default;
