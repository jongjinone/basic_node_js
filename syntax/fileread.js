const fs = require('fs')

fs.readFile('sample.txt', 'utf-8', (err, data)=>{                         //파일을 읽어내는 함수
    if (err) throw err
    console.log(data)
})