"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGroups = void 0;
const buildGroups = (securities, max = 100) => {
    let groups = [];
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
