# ns
orange funny define

## what about ns ?

1. ns is a plugin without any cmd or amd grammar rules,it is a proxy model
2. it is easier to organize variables
3. it is easy to use
4. for nodejs or browser

## how to use

 1. download `ns` and import it
 
```javascript
require('./ns')
```

or

```javascript
<script type="text/javascript" src="script/ns.js">
```

2. use ns("key")

```javascript
// if it is exist in global or window
// it will be throw an error 
//namespace should not be cover
//we want namespace match file-name or plugin-name as much as possible
ns('namespace');

//use namespace
namespace(...)
```

### 1.define basic variables

```javascript
//define ns whit demo
ns('demo');
```

```javascript
//use demo
//whit basic value
demo("name","value");
demo("name") //--> get "value"
```

```javascript
//cover name value
//if false or not 
//it will be throw an exist key error
demo("name","name",true);
demo("name") //--> get "name"
```

```javascript
//with function operation
//if params is null 
//it could not be operation
demo("operation",function(a,b,c){
    return a+b+c;
},1,2,3);
//it just store after function operation
demo("operation");//--> get "6";
```
### 2.define function
> cover variables see `1. define basic variables`

```javascript
//define ns with fn
ns('fn');
```

```javascript
fn("dosomething",function(param){
    return param;
});

fn("dosomething")("todo");//-- get "todo"
```

```javascript
fn("next",function(next){
    //if params is not null
    //must return function
    //here is an closure
    return function(param){
        return next + param;
    }
},1);
fn("next")(1); //get 2
```
### 2.define object
> cover variables see `1. define basic variables`

```javascript
ns('obj')
```
```javascript
obj("map",{key:"value"});
obj("map");// -->get {key:"value"}
```

#  Apache License 2.0
Copyright 2017 @arefn.cn



