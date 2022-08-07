"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = void 0;
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
exports.getErrorMessage = getErrorMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQWMsRUFBRSxFQUFFO0lBQzlDLElBQUksS0FBSyxZQUFZLEtBQUs7UUFBRSxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDakQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFBO0FBSFksUUFBQSxlQUFlLG1CQUczQiJ9