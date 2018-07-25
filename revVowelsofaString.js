/**
 * @param {string} s
 * @return {string}
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
  vowelarr=vowelstack.split('');
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
