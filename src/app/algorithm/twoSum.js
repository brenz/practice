/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

 /* runtime 120ms
var twoSum = function (nums, target) {
  for (let x=0;x<nums.length;x++) {
    for (let i=x+1; i<nums.length; i++){
      var cacl=nums[x]+nums[i];
      if(cacl==target){
        return [x,i];
      }
    }
  }
  return [];
};*/

var twoSum = function (nums, target) {
  for (let x in nums) {
    var y=nums.indexOf(target-nums[x])
    if(y!=-1&&y!=x){
      return [parseInt(x), y]
    }
  }
  return [];
};
console.log(twoSum([6,5,1,2,3,8], 10));
