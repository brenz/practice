/**
 * @param {string} s
 * @return {string}
 *
 * Accept solution:
 * https://leetcode.com/problems/reverse-vowels-of-a-string/
 *
 */
var reverseVowels = function(s) {
  let result="";
  const vowelstring="aeiouAEIOU";
  let vowelstack="";
  for (let x in s){
      if(vowelstring.indexOf(s[x])!=-1){
        vowelstack=vowelstack+s[x];
      }
  }
  let vowelarr=vowelstack.split('');
  //console.log(vowelarr);
  for (let x in s){
      if(vowelstring.indexOf(s[x])!=-1){
          result=result+vowelarr.pop();
      }else{
          result=result+s[x];
      }
  }
  return result;
};

//console.log(reverseVowels(process.argv[2]));

reverseVowels(process.argv[2])
