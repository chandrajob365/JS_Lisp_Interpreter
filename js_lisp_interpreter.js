function tokenize (input) {
  return input.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ' ).trim().split(/\s+/g)
}

function parse(input){
return read_from_tokens(tokenize(input));
}

function read_from_tokens(tokens){
    var token = tokens.shift()
    //console.log("token--->",token , "tokens--->",tokens)
    if(token === '('){
      var expr = [];
      while(tokens[0] !== ')'){
      //  console.log("Inside while tokens[0]--->",tokens[0]);
        expr.push(read_from_tokens(tokens))
        //console.log("expr--->",expr);

      }
      //console.log("before shift tokens-->",tokens);
      tokens.shift()
    //  console.log("after shift tokens-->",tokens);
      return expr
    }
    if(token === ')')
      console.log("Unexpected )")
      //throw new Error("unexpected )")
  return atom(token)
}

function atom(token){
//  console.log("From atom token = ",token);
  var float
  if(!isNaN(float = parseFloat(token))) return float
  return token
}



var standard_env = {
  '+' : function (arr_input) { return addition(arr_input)},
  '-' : function (arr_input) { return subtract(arr_input)},
  '*' : function(arr_input) { return multiply(arr_input)},
  '/' : function (arr_input) { return division(arr_input)},
  'mod' : function (arr_input) { return mod(arr_input)},
  'max' : function (arr_input) { return max(arr_input)},
  'min' : function (arr_input) { return min(arr_input)},
  '>' : function (arr_input) { return gt(arr_input)},
  '<' : function (arr_input) { return lt(arr_input)},
  '>=' : function (arr_input) { return gtEq(arr_input)},
  '<=' : function (arr_input) { return ltEq(arr_input)},
  '=' : function (a, b) { return a == b},
  //'abs' : return Math.abs,
  'append' : function (a, b) { return String(a) + String(b)},
  'length' : function (a) { return a.length},
  //'max' : return Math.max
  'pi' : function () { return 3.14},
  'begin' : function (arr_input) { return arr_input[arr_input.length-1]},
  'car' : function (arr_input) { return arr_input[0]},
  'cdr' : function (arr_input) { return arr_input.length !== 0 ?  arr_input.slice(1) : null },
  'list' : function (arr_input) { return arr_input.map(function(elm){ return elm })}

}

var global_env = standard_env

function operation(operand , operator){
  console.log("operand->",operand);
  return operand.reduce(function(acc,elm){
    console.log("elm-->",elm , "acc-->",acc)
    return operator_handler(eval(acc), operator, eval(elm))
  })
}

function operator_handler(op1 , operator , op2){
  console.log("acc-->",op1," operator ",operator," --op2-->",op2);
  switch (operator) {
    case '+': return op1 + op2
              break
    case '-': return op1 - op2
              break
    case '*': return op1 * op2
              break
    case '/': return op1 / op2
              break
    case '%': return op1 % op2
              break
    case 'max': return op1 > op2 ? op1 : op2
              break
    case 'min': return op1 < op2 ? op1 : op2
              break
    case '>' : return op1 > op2 ? true : false
              break
    case '<' : return op1 < op2 ? true : false
              break
    default: break;

  }
}

function multiply(arr){
  return operation(arr,'*')
}

function addition(arr){
  return operation(arr,'+')
}

function subtract(arr){
  return operation(arr,'-')
}

function division(arr){
  return operation(arr,'/')
}

function mod(arr){
  return operation(arr , '%')
}

function max(arr){
  return operation(arr, 'max')
}

function min(arr){
  return operation(arr, 'min')
}

function gt(arr){
  return operation(arr,'>')
}

function lt(arr){
  return operation(arr,'<')
}

function ifEvaluator(arr){
  var t = eval(arr[0])
  console.log("eval(arr[0])->",t);
  if(t)
    return eval(arr[1])
  else return eval(arr[2])
}

function procedure(obj){
  this.params = obj.params
  this.body = obj.body
  this.env = this.env
  return function(args){
    return eval(this.body, Env(this.params, args, this.env))
  }
}

function Env(params, args, env){
  this.dict = {}
  this.outer = outer
  this.find = function(name){
    if(name in this.dict) return this.dict[name]
    return outer.find(name)
  }
  if(params && args){
    if(params instanceof Array){
      for(var i = 0 ; i < parms.length ; i++){
        this.dict[parms[i]] = parseInt(args[i])
      }
    }
  }

}

function eval(input , env = global_env){
  console.log('Entry eval input-->',input);
  if(env[input]){
    console.log('Inside , if input is there in global env --input-->',input,"----value in global_env-->", env[input]);
    return env[input]
  }else if(input.constructor !== Array){
    console.log('Inside if not array');
    return input
  }else if(input[0] === 'if'){
    console.log("Inside if first value is --if--");
    input = input.slice(1)
    var exp = ifEvaluator(input)
    console.log("result from ifEvaluator inside eval --- exp--->",exp);
    return exp
    //eval(exp,env)
  }else if(input[0] === 'define'){
    console.log('Inside if first value is --define--')
    env[input[1]] = eval(input[2],env)
  }else if(input[0] === 'lambda'){
    return procedure({params : input[1] , body : input[2] , env : env})
  }
  else{
    console.log('Inside last else condtion...input[0]=',input[0]);
    var proc = eval(input[0],env)
    console.log('Inside last else condtion... proc -> ',proc);
    console.log("Inside last else condtion... input.slice(1)=",input.slice(1));
    var args = input.slice(1).map(function(elm){
                console.log("Inside map of last else condition... elm = ",elm);
                var val = eval(elm,env);
                console.log("Inside map of last else condition... val = ",val);
              return val
    })
    console.log('Inside last else condtion... args -> ',args);
    return proc(args)
  }
}


var program = "(begin (define r 10) (define x 2) (define y 7) (* r (+ r (/ r (- y x)))))"
//var program = "((define x 20) (define y 15) (define z 4) (mod z (mod x y)))"
//var program = "((define x 20) (define y 15) (define z 4) (min z (min y y) z))"
//var program = "(begin (define x (+ 20 3)) (define y 15) (define z 4)((if (> x y) + *) x y))"
//var program = "(begin (list 0 1 2 3 0 0))"
var arr = parse(program);
console.log("arr-->",arr);
console.log("result from getValue--->",eval(arr));
console.log('global_env->',global_env);
console.log("standard_env-->",standard_env);

//console.log(global_env);
//var program = "(define r 10)"
 // expr---> [ [ 'define', 'r', 10 ], [ '*', 'r', 'r', 'r' ] ,[]]
//console.log("expr--->",arr);
//console.log(global_env);
//"((define r1 16) (define r2 2) (define r3 4) (= r1 r2 r3))"
