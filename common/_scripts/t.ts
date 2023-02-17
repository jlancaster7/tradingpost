import fetch from "node-fetch";

const asyncCall = async () => {
    console.log("Started")
    await fetch("http://localhost:8080")
    console.log("Fin")
}

(async () => {
    console.log("common...")

    await Promise.all([asyncCall(), asyncCall(), asyncCall()])
})()
