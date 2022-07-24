import {diff} from 'deep-object-diff';

(async () => {
    let obj1 = {
        name: 'Steve',
        foo: 'bar',
        age: 21
    }

    let obj2 = {
        foo: 'barr',
        age: 21,
        name: 'Steve'
    }

    console.log(Object.keys(diff(obj1, obj2)).length ===0)
})()