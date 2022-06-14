let foo = "bar";

setInterval(() => {
    foo = "foo";
    console.log("Changed...")
}, 2000);

const r = async () => {
    while (true) {
        sleep(0)
    }
}

const sleep = async (time) => {
    return new Promise((res, reject) => {
        setTimeout(() => {
            res();
        }, time);
    })
}

r();

console.log("Here....")
