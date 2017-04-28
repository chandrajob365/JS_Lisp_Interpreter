function tokenize (input) {
  return input.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ' ).trim().split(/\s+/g)
}

function parse(input){
return read_from_tokens(tokenize(input));
}

function read_from_tokens(tokens){
    var token = tokens.shift()
    if(token === '('){
      var expr = [];
      while(tokens[0] !== ')'){
        expr.push(read_from_tokens(tokens))

      }
      tokens.shift()
      return expr
    }
    if(token === ')')
      //console.log("Unexpected )")
      throw new Error("unexpected )")
  return atom(token)
}

function atom(token){
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
  'pi' : 3.14,
  'begin' : function (arr_input) { return arr_input[arr_input.length-1]},
  'car' : function (arr_input) { return arr_input[0]},
  'cdr' : function (arr_input) { return arr_input.length !== 0 ?  arr_input.slice(1) : null },
  'list' : function (arr_input) { return arr_input.map(function(elm){ return elm })}

}

var global_env = new Env()
global_env.dict = standard_env

function operation(operand , operator){
  return operand.reduce(function(acc,elm){
    return operator_handler(eval(acc), operator, eval(elm))
  })
}

function operator_handler(op1 , operator , op2){
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
  if(eval(arr[0]))
    return eval(arr[1])
  else return eval(arr[2])
}

function procedure(params,body,env){
  this.params = params
  this.body = body
  this.env = env
  return function(args){
    return eval(this.body, new Env(this.params, args, this.env))
  }
}

function Env(params, args, outer){
  this.dict = {}
  this.outer = outer
  this.find = function(key){
    if(key in this.dict) return this.dict[key]
    return this.outer.find(key)
  }
  this.set = function(key, value){ return this.dict[key] = value}
  if(params && args){
    if(params instanceof Array){
      for(var i = 0 ; i < params.length ; i++){
        this.set(params[i], parseInt(args[i]))
      }
    }
    this.set (params, parseInt(args))
  }

}

function eval(input , env){
  env = env || global_env
  if(typeof input === 'number'){
    return input
  }else if(typeof input === 'string'){
    return env.find(input)
  }else if(input.constructor !== Array){
    return input
  }else if(input[0] === 'quote'){
    return input[1].join(' ')
  }else if(input[0] === 'if'){
    return ifEvaluator(input.slice(1))
  }else if(input[0] === 'define'){
    env.set(input[1],eval(input[2],env))
  }else if(input[0] === 'set!'){
    if(env.find(input[1]) !== undefined){
      env.set(input[1], eval(input[2],env))
    }
  }else if(input[0] === 'lambda'){
    return procedure(input[1], input[2], env)
  }
  else{
    var proc = eval(input[0],env)
    var args = input.slice(1).map(function(elm){
                return eval(elm,env);
    })
    return proc(args)
  }
}


//var program = "(begin (define r 10) (define x 2) (define y 7) (* r (+ r (/ r (- y x)))))"
//var program = "(begin (define x 20) (define y 15) (define z 4) (mod z (mod x y)))"
//var program = "(begin (define x 20) (define y 15) (define z 4) (min z (min y y) z))"
//var program = "(begin (define x (+ 20 3)) (define y 15) (define z 4)((if (> y y) + *) x y))"
//var program = "(begin (list 0 1 2 3 0 0))"
//var program = "(begin (define r 10) (define circle_area (lambda (r) (* pi (* r r)))) (circle_area 5))"
var program ="(begin (define makeAccount (lambda (balance) (lambda (amt) (begin (set! balance (+ balance amt)) balance)))) (define account1 (makeAccount 100)) (account1 -20)))"
//var program = "(begin (quote (The greater combined area of 1,2,3 vs 4,5,6:)))"
//var program = "(begin (define r 0) (set! r (+ 3 2)))";

var arr = parse(program);
//console.log("arr-->",arr);
console.log("result from getValue--->",eval(arr));
