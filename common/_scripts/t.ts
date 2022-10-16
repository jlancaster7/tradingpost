import {EventEmitter} from 'events';

const p1 = new EventEmitter();
const p2 = new EventEmitter();

(async () => {

    p1.on('social', () => {
        // Do something and send on p2
        console.log("new social event")
        p2.emit('elastic', {name: "Dave"})
        console.log("BLOCKED")
    })

    setTimeout(() => {
        p1.emit('social')
    }, 1000)
    setTimeout(() => {
        p1.emit('social')
    }, 1500)
})()