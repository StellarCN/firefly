/**
 * 代码来自
 * https://github.com/joaquimserafim/is-json
 */

'use strict'

// module.exports = isJSON;
// isJSON.strict = strict;

export default function (str, pass_object = false) {
  if (pass_object && isObject(str)) return true;

  if (!isString(str)) return false;
  str = str.replace(/\s/g, '').replace(/\n|\r/, '');

  //新增条件过滤
  if(!(str.startsWith('{') && str.endsWith('}')))return false;
  if(str.length <= 2)return false;

  if (/^\{(.*?)\}$/.test(str))
    return /"(.*?)":(.*?)/g.test(str);

  if (/^\[(.*?)\]$/.test(str)) {
    return str.replace(/^\[/, '')
      .replace(/\]$/, '')
      .replace(/},{/g, '}\n{')
      .split(/\n/)
      .map(function (s) { return isJSON(s); })
      .reduce(function (prev, curr) { return !!curr; });
  }

  return false;
}


function strict (str) {
  if (isObject(str)) {
    return true;
  }

  try {
   return JSON.parse(str) && true;
  } catch (ex) {
    return false;
  }
}

function isString (x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

function isObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}