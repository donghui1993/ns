require('./ns');
//----------
ns('back');
back("value", function (a, b, c) {
   return a + b + c;
});
console.log(back("value")(1, 2, 3));
ns('back')