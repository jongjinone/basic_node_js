const a = () => {
    console.log('a')
}

function showfunc (callback){
    callback()
}

showfunc(a)