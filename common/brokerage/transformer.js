"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHoldingsHistory = exports.transformTransactions = exports.transformHoldings = exports.transformAccounts = void 0;
const luxon_1 = require("luxon");
const interfaces_1 = require("./interfaces");
const transformerMap = {
    "": ""
};
const transformAccounts = (userId, finAccounts, institutionMap) => {
    return finAccounts.map((fa) => {
        let institution = institutionMap[fa.institutionId];
        let o = {
            userId: userId,
            accountNumber: fa.number,
            status: fa.status,
            name: fa.accountNickname,
            officialName: fa.name,
            mask: fa.accountNumberDisplay,
            type: fa.type,
            subtype: fa.marketSegment,
            brokerName: institution.name,
            institutionId: institution.id,
        };
        return o;
    });
};
exports.transformAccounts = transformAccounts;
const transformHoldings = (finHoldings) => {
    return finHoldings.map(fh => {
        return {
            currency: '',
            accountId: 0,
            securityId: 0,
            costBasis: null,
            price: 0,
            priceAsOf: luxon_1.DateTime.now(),
            value: 0,
            priceSource: '',
            quantity: 0,
            securityType: null
        };
    });
};
exports.transformHoldings = transformHoldings;
const transformTransactions = (finTransactions) => {
    return finTransactions.map(fh => {
        return {
            currency: '',
            securityId: 0,
            accountId: 0,
            date: luxon_1.DateTime.now(),
            price: 0,
            type: interfaces_1.InvestmentTransactionType.buy,
            amount: 0,
            quantity: 0,
            fees: 0,
            securityType: interfaces_1.SecurityType.unknown
        };
    });
};
exports.transformTransactions = transformTransactions;
const computeHoldingsHistory = () => {
};
exports.computeHoldingsHistory = computeHoldingsHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBaUM7QUFDakMsNkNBTXNCO0FBRXRCLE1BQU0sY0FBYyxHQUFHO0lBQ25CLEVBQUUsRUFBRSxFQUFFO0NBQ1QsQ0FBQztBQUVLLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxNQUFjLEVBQUUsV0FBOEIsRUFBRSxjQUErRSxFQUFrQyxFQUFFO0lBQ2pNLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQW1CLEVBQUUsRUFBRTtRQUMzQyxJQUFJLFdBQVcsR0FBRyxjQUFjLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ2xELElBQUksQ0FBQyxHQUFpQztZQUNsQyxNQUFNLEVBQUUsTUFBTTtZQUNkLGFBQWEsRUFBRSxFQUFFLENBQUMsTUFBTTtZQUN4QixNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU07WUFDakIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxlQUFlO1lBQ3hCLFlBQVksRUFBRSxFQUFFLENBQUMsSUFBSTtZQUNyQixJQUFJLEVBQUUsRUFBRSxDQUFDLG9CQUFvQjtZQUM3QixJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUk7WUFDYixPQUFPLEVBQUUsRUFBRSxDQUFDLGFBQWE7WUFDekIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJO1lBQzVCLGFBQWEsRUFBRSxXQUFXLENBQUMsRUFBRTtTQUNoQyxDQUFBO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTtBQWpCWSxRQUFBLGlCQUFpQixxQkFpQjdCO0FBRU0sTUFBTSxpQkFBaUIsR0FBRyxDQUFDLFdBQThCLEVBQWdDLEVBQUU7SUFDOUYsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3hCLE9BQU87WUFDSCxRQUFRLEVBQUUsRUFBRTtZQUNaLFNBQVMsRUFBRSxDQUFDO1lBQ1osVUFBVSxFQUFFLENBQUM7WUFDYixTQUFTLEVBQUUsSUFBSTtZQUNmLEtBQUssRUFBRSxDQUFDO1lBQ1IsU0FBUyxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFO1lBQ3pCLEtBQUssRUFBRSxDQUFDO1lBQ1IsV0FBVyxFQUFFLEVBQUU7WUFDZixRQUFRLEVBQUUsQ0FBQztZQUNYLFlBQVksRUFBRSxJQUFJO1NBQ3JCLENBQUE7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQTtBQWZZLFFBQUEsaUJBQWlCLHFCQWU3QjtBQUVNLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxlQUFzQyxFQUE2QixFQUFFO0lBQ3ZHLE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUM1QixPQUFPO1lBQ0gsUUFBUSxFQUFFLEVBQUU7WUFDWixVQUFVLEVBQUUsQ0FBQztZQUNiLFNBQVMsRUFBRSxDQUFDO1lBQ1osSUFBSSxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxFQUFFLHNDQUF5QixDQUFDLEdBQUc7WUFDbkMsTUFBTSxFQUFFLENBQUM7WUFDVCxRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksRUFBRSxDQUFDO1lBQ1AsWUFBWSxFQUFFLHlCQUFZLENBQUMsT0FBTztTQUNyQyxDQUFBO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUE7QUFmWSxRQUFBLHFCQUFxQix5QkFlakM7QUFFTSxNQUFNLHNCQUFzQixHQUFHLEdBQUcsRUFBRTtBQUUzQyxDQUFDLENBQUE7QUFGWSxRQUFBLHNCQUFzQiwwQkFFbEMifQ==