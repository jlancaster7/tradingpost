import {DateTime} from 'luxon';

const dt = DateTime.fromFormat("2022-07-22 13:30", "yyyy-LL-dd HH:mm", {
    zone: "America/New_York"
});
console.log(dt);
