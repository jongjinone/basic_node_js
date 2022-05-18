const testFolder = '../data'
const fs = require('fs')

fs.readdir(testFolder, (err, filelist)=>{             //폴더 안의 파일을 읽어내는 함수
    console.log(filelist)
})