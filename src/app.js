// app.js
"use strict";

angular.module("myApp",[]);

/*
angular.module("myApp").config(function($interpolateProvider){
							   
	$interpolateProvider.startSymbol('(~');
	$interpolateProvider.endSymbol('~)');
	
});*/

angular.module("myApp").controller("MainController", [function(){
	
	this.number = 0;
	this.PalindromNumber = 0;
	
	this.isPalindrom = function (x){
		var tmpStr=( (typeof x)=== "string")?parseInt(x).toString():x.toString();
		var start=0;
		var end=tmpStr.length-1;
		while(start !== parseInt(tmpStr.length/2)){
			if (tmpStr.charAt(start)!==tmpStr.charAt(end)) {return false;}
			start++;
			end--;
		}
		
		return true;
	};
	
}]);

angular.module("myApp").filter("reversed", [function(){
	
	return function(value) {
		

		/* return str with Array */
		/*var reversString=function(str){
			return Array.from(str).reverse().join("");
		};*/
		
		/*
		var tmpStr=( (typeof value)=== "string")?parseInt(value).toString():value.toString();
		var reversString=function(str){
			if (str === ""){
				return "";
			} else {
				if (str.charAt(0)==="-"){
					return str.charAt(0) + reversString(str.substr(1));
				} else {
					return reversString(str.substr(1)) + str.charAt(0);
				}
			}
		};
		var result = parseInt(reversString(tmpStr));
		if (result > Math.pow(2,31)-1){
			return 0;
		}else if(result < -Math.pow(2,31)-1){
			return 0;
		}else{
			return result;
		}*/
		var INT_MAX = Math.pow(2,31)-1;
		
		var tmpNum = ((typeof value)==="number")?value:parseInt(value);
		var ans=0;
		while(tmpNum !== 0){
			var tmpres = ans*10 + tmpNum % 10;
			if (isNaN(tmpNum)){
				return 0;
			}
			
			ans = tmpres;
			tmpNum=parseInt(tmpNum/10);
		}
		
		if(ans > INT_MAX || ans < -(1+INT_MAX)) return 0;
		return ans;
		
	};
	
}]);
/*
angular.module("myApp").controller("MainController", [function(){
	
	this.fruitList = ['bananas', 'apples', 'pears', 'cherries', 'peaches'];
	
	this.user = {
		name: 'John Smith',
		favoriteFruit: 'cherries',
		isActive: true
	};
}]);

angular.module("myApp").filter("yesorno", [function(){
	
	return function(value) {
		if (value === true) {
			return 'yes';
		}else if (value === false) {
			return 'no';
		}else {
			return 'unknown';
		}
	};
	
}]);*/
	
	/*this.now=new Date();
	this.user = {
		name: 'John Doe',
		birthday: 171781200000,
		lastLogin: 1437705300000
	};*/
	
	/*this.user = {
		firstName: "John",
		lastName: "Smith",
		accountType: {
			accountId: '4683476348744',
			name: 'checking'
		},
		balance: 1349.2,
		birthday: 257925600000,
		hobbies: ['snowboarding','biking','fishing']
	};*
	/*this.users = [{
		firstName: "John",
		lastName: "Smith",
		accountType: "checking",
		balance: 1349.2,
		birthday: 257925600000
	},{
		firstName: "Mary",
		lastName: "Jones",
		accountType: "checking",
		balance: 1245.33,
		birthday: 488264400000
	},{
		firstName: "Barry",
		lastName: "Gold",
		accountType: "saving",
		balance: 4788.89,
		birthday: -135802800000
	},{
		firstName: "Martha",
		lastName: "Anderson",
		accountType: "checking",
		balance: 1349.2,
		birthday: -24721200000
	},{
		firstName: "Michael",
		lastName: "Anderson",
		accountType: "saving",
		balance: 1349.2,
		birthday: -24721200000
	}];*/


/*
angular.module("myApp").filter('capitalize', function(){
	return function(value){
		var result = "";
		var words = value.split(" ");
		words.forEach(function(item){
			if(result){
				result += " ";
			} else {
				result += "";
			}
			result +=item.substr(0,1).toUpperCase() + item.substr(1).toLowerCase();
		});
		return result;
	};
});
*/

/*
angular.module("myApp").controller("ParentController", [function(){
	this.message = "Hello from the parent.";
}]);

angular.module("myApp").controller("FirstChild", [function(){
	this.message = "Hello from the first child";
}]);

angular.module("myApp").controller("SecondChild", ['$interval','$scope',function($interval, $scope){
	this.message = "Hello from the Second child";
	this.value = 1;
	
	$interval(function(){
		this.value = Math.round(Math.random() * 10000000) + 1;
	}.bind(this), 2000);
	
	$scope.$watch('second.value', function(newValue, oldValue){
		console.log("New: ", newValue, " Old: ", oldValue);
	})
}]);
*/
/*

angular.module("myApp").controller("MainController", ['$scope', "$interval", function($scope, $interval){
	
	$scope.randomValue=-999;
	
	$scope.names = ['David',"Tom","Joe"];
	
	$scope.qty = 20;
	$scope.cost = 1.99;
	
	$scope.pWidth = 100;
	
	$interval(function(){
		$scope.randomValue = Math.round(Math.random() * 1000000);
	},1000);
}]);
/*
/*
angular.module("myApp").controller("MainController", ['$scope', "$interval", function($scope, $interval){
	var items =['bananas','apples','pears','cherries','peaches'];
	$scope.itemIndex=null;
	$scope.currentItem='';
	
	$scope.getItem=function(){
		$scope.currentItem = items[$scope.itemIndex];
	};
}]);*/

/* Excise I
angular.module("myApp").controller('MainController', ["$scope",function($scope){
	$scope.message="Hello";
	
	$scope.sayHello = function(name){
		return $scope.message + " " + name + "."; 
	};
}]);*/
													  
													  