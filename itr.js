/**
 * @param {number} num
 * @return {string}
 */
var intToRoman = function (num) {
  var result = "";
  var matrix = [["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
  ["X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
  ["C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"],
  ["M", "MM", "MMM", "", "", "", "", "", ""]]
  var numString = num + "";
  var lng = numString.length;
  for (var x in numString) {
    if (numString[x] != "0") {
      result = result + matrix[lng - x - 1][numString[x] - 1];
    }
  }

  return result;
};

//console.log(intToRoman(process.argv[2]))
intToRoman(process.argv[2]);


