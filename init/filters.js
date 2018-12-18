const filter_currency = (input, sign) => {
  var digitsRegex= /(\d{3})(?=\d)/g;

  sign = sign || '$';
  input = parseFloat(input);

  if(!isFinite(input) || (!input && input !== 0)) {
    return '';
  }

  var strVal = Math.floor(Math.abs(input)).toString();
  var i = strVal.length % 3;
  var h = i > 0 ? (strVal.slice(0, i) + (strVal.length > 3 ? ',' : '')) : '';
  var v = Math.abs(parseInt((input * 100) % 100, 10));
  var float = '.' + (v < 10 ? ('0' + v) : v);

  return (input < 0 ? '-' : '') + sign + h + strVal.slice(i).replace(digitsRegex, '$1,') + float;
};

const filter_percent = (input, decimals) => {
  input = input || 0;
  decimals = decimals || 0;

  var whole = input * 100;
  var multiplier = Math.pow(10, decimals);

  return parseFloat(Math.floor(whole * multiplier) / multiplier).toFixed(decimals) + '%';
};

const filter_round = (input, decimals) => {
  if(isNaN(input)) {
    return 0;
  }

  decimals = decimals || 2;

  var multiplier = Math.pow(10, decimals);
  return parseFloat(Math.round(input * multiplier) / multiplier).toFixed(decimals);
};

const filter_trim = (input) => {
  return input.trim();
};

const filter_truncate = (input, length, end) => {
  end = end || '...';

  if(length == null) {
    return input;
  }
  return input.substring(0, length) + ((input.length > length) ? end : '');
};

exports.currency = filter_currency;
exports.percent = filter_percent
exports.round = filter_round
exports.trim = filter_trim
exports.truncate = filter_truncate