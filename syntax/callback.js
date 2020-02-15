// function a(){
//     console.log('A');
// }

var a = function(){
    console.log('A');
}


function showfunc(callback){
    callback();
}

showfunc(a);