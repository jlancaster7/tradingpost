export class BrokerageAccountError extends Error {
    private userId: string;
    private brokerageUserId: string;
    private accountId: string | undefined;
    private errorCode: number | undefined;

    constructor(userId: string, brokerageUserId: string, errorCode?: number, accountId?: string, msg?: string) {
        super(msg);
        this.userId = userId;
        this.brokerageUserId = brokerageUserId;
        this.accountId = accountId;
        this.errorCode = errorCode;
    }
}

export class RetryBrokerageAccountError extends BrokerageAccountError {
    constructor(userId: string, brokerageUserId: string, errorCode?: number, accountId?: string, msg?: string) {
        super(userId, brokerageUserId, errorCode, accountId, msg);
    }
}

export class BrokerageAccountDataError extends BrokerageAccountError {
    constructor(userId: string, brokerageUserId: string, errorCode?: number, accountId?: string, msg?: string) {
        super(userId, brokerageUserId, errorCode, accountId, msg);
    }
}