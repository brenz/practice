/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function (s) {
    let result = 0;
    let length = s.length - 1;
    for (let i = length; i >= 0; i--) {
        let num=s.charAt(i);
        console.log(num)
        let intNum=isRoman(num);
        if (intNum==0){
            console.log("Not Valid Roman Number");
            return;
        }
        result=result+intNum;
        console.log(result);
    }

};
var isRoman = function(n){
    if (n=="I"){
        return 1;
    }
    if (n=="V"){
        return 5;
    }
    if (n=="X"){
        return 10;
    }
    if (n=="L"){
        return 50;
    }
    if (n=="C"){
        return 100;
    }
    if (n=="D"){
        return 500;
    }
    if (n=="M"){
        return 1000;
    }
    return 0;
}
romanToInt(process.argv[2]);