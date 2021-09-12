// import cloneDeep from 'lodash/cloneDeep';
import { abc } from './a';
const a = '111';
const b = '222';
const c = '333';

const d = (x, y) => {
    return x + y;
}

const obj = {
    a,
    b
}

// const x = cloneDeep(obj);


const result = d(a, b);


const result1 = abc(obj);
console.log(result, obj, result1);



console.log('我是不是很菜')
// console.log(result, obj);