const fs = require('fs')

console.log("read sync")
console.log('A')
let result1 = fs.readFileSync('sample.txt', 'utf-8') //동기적
console.log(result1)
console.log('C')

console.log("read async")
console.log('A')
fs.readFile('sample.txt', 'utf-8', (err, result)=>{
    console.log(result)
})                                                            //비동기적
console.log('C')
