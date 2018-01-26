// toFixed兼容方法
Number.prototype.toFixed = function (n) {
  if (n > 20 || n < 0) {
      throw new RangeError('toFixed() digits argument must be between 0 and 20');
  }
  const number = this;
  if (isNaN(number) || number >= Math.pow(10, 21)) {
      return number.toString();
  }
  if (typeof (n) == 'undefined' || n == 0) {
      return (Math.round(number)).toString();
  }

  let result = number.toString();
  const arr = result.split('.');

  // 整数的情况
  if (arr.length < 2) {
      result += '.';
      for (let i = 0; i < n; i += 1) {
          result += '0';
      }
      return result;
  }

  const integer = arr[0];
  const decimal = arr[1];
  if (decimal.length == n) {
      return result;
  }
  if (decimal.length < n) {
      for (let i = 0; i < n - decimal.length; i += 1) {
          result += '0';
      }
      return result;
  }
  result = integer + '.' + decimal.substr(0, n);
  const last = decimal.substr(n, 1);

  // 四舍五入，转换为整数再处理，避免浮点数精度的损失
  if (parseInt(last, 10) >= 5) {
      const x = Math.pow(10, n);
      result = (Math.round((parseFloat(result) * x)) + 1) / x;
      result = result.toFixed(n);
  }

  return result;
};

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}