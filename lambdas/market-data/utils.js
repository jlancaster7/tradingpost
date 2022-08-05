"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGroups = void 0;
const buildGroups = (securities, max = 100) => {
    const groups = [];
    let group = [];
    securities.forEach(sec => {
        group.push(sec);
        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });
    if (group.length > 0)
        groups.push(group);
    return groups;
};
exports.buildGroups = buildGroups;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLFdBQVcsR0FBRyxDQUFDLFVBQWlCLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBVyxFQUFFO0lBQ2pFLE1BQU0sTUFBTSxHQUFZLEVBQUUsQ0FBQztJQUMzQixJQUFJLEtBQUssR0FBVSxFQUFFLENBQUM7SUFDdEIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNyQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2YsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDZDtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7UUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXpDLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQTtBQWRZLFFBQUEsV0FBVyxlQWN2QiJ9