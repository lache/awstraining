'use strict';
var funcs = [];

for (let i=0; i < 10; i++) {
    funcs.push(function() {
        console.log(i);
    });
}

funcs.forEach(function(func) {
    func();     // outputs 0, then 1, then 2, up to 9
})

const v = 100;
console.log('v='+v);

var msg = 'Hello World!';
console.log(msg.startsWith('o'));

let name = 'Nicholas';
let price = 50;
console.log(`Hello, ${name} -- $${price.toFixed(2)}.`);

function hello() {
}

console.log(hello.name);
