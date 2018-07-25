/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function (s) {
    let result = 0;
    let length = s.length - 1;
    for (let i = length; i >= 0; i--) {
        let num = s.charAt(i);
        let perviousNum = s.charAt(i + 1);
        //console.log(perviousNum)
        let intNum = isRoman(num);
        let intPerNum = isRoman(perviousNum);
        if (intNum == 0) {
            //console.log("Not Valid Roman Number");
            return;
        }
        if (intNum >= intPerNum) {
            result = result + intNum;
        }else{
            result = result - intNum;
        }
    }
    return result;
};
var isRoman = function (n) {
    if (n == "I") {
        return 1;
    }
    if (n == "V") {
        return 5;
    }
    if (n == "X") {
        return 10;
    }
    if (n == "L") {
        return 50;
    }
    if (n == "C") {
        return 100;
    }
    if (n == "D") {
        return 500;
    }
    if (n == "M") {
        return 1000;
    }
    return 0;
}
//console.log(romanToInt(process.argv[2]));
romanToInt(process.argv[2])