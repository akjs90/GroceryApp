angular.module('GroceryModule',['ngRoute'])

.config(function($routeProvider){
	$routeProvider
	
	.when('/',{
		templateUrl:'views/grocerylist.html',
		controller:"groceryctrl"
	})
	
	.when('/additem',{
		templateUrl:'views/addgrocery.html',
		controller:"groceryItemCtrl"
	})
	
	.when('/additem/edit/:id',{
		templateUrl:'views/addgrocery.html',
		controller:"groceryItemCtrl"
	})
	
	.otherwise({
		redirectTo:'/'
	})
	
})

.factory('groceryListService',['$http',function($http){
	var groceryServiceObj={};
	groceryServiceObj.groceryItems=[];
	
	$http.post("data/grocerydata.json",{id:"2"})
	.success(function(data){
		groceryServiceObj.groceryItems=data;
		for(item in groceryServiceObj.groceryItems)
			groceryServiceObj.groceryItems[item].date=new Date(groceryServiceObj.groceryItems[item].date);
	})
	.error(function(data,status){
		alert("Something went wrong");	
	});

	
	groceryServiceObj.saveItem=function(item){
		var updateItem=groceryServiceObj.findById(item.id);
		if(updateItem){
			updateItem.completed=item.completed;
			updateItem.name=item.name;
			updateItem.date=item.date;
		}
		else{
			item.id=groceryServiceObj.getNewId();
			groceryServiceObj.groceryItems.push(item);
		}
		
		
	};
	groceryServiceObj.getNewId=function(){
		if(groceryServiceObj.newId)
			groceryServiceObj.newId++;
		else
		{
			var maxId=_.max(groceryServiceObj.groceryItems,function(entry){
				return entry.id;
			});
			groceryServiceObj.newId=maxId.id+1;
		}
		return groceryServiceObj.newId;
	};
	groceryServiceObj.findById=function(id){
		for(item in groceryServiceObj.groceryItems){
			
			if(groceryServiceObj.groceryItems[item].id==id)
			{	
				return groceryServiceObj.groceryItems[item];
			}
		}
	};

	groceryServiceObj.removeItem=function(item){
		var index=groceryServiceObj.groceryItems.indexOf(item);
		groceryServiceObj.groceryItems.splice(index,1);
	};
	
	groceryServiceObj.checkItem=function(item){
		item.completed=!item.completed;
	};
	return groceryServiceObj;
}])

.directive('glItemDisplay',function(){
	return {
		restrict:'E',
		templateUrl:'views/groceryitem.html'
	};
})

.controller('groceryctrl',['$scope','$routeParams','groceryListService',function($scope,$routeParams,groceryListService){
	$scope.itemList=groceryListService.groceryItems; 
	$scope.removeItem=function(item){
		groceryListService.removeItem(item);
	}
	$scope.checkItem=function(item){
		groceryListService.checkItem(item);
	}
	// $scope.$watch() creates listener
	$scope.$watch(function(){// value function which walue to listen
		return groceryListService.groceryItems;	
	},function(newvalue){// listener function what to do after specified value changes
		$scope.itemList=newvalue;
	});
}])

.controller('groceryItemCtrl',['$scope','$routeParams','$location','groceryListService',function($scope,$routeParams,$location,groceryListService){
	if(!$routeParams.id){
		$scope.item={completed:false,date:new Date()};
	}else{
		$scope.item=_.clone(groceryListService.findById(parseInt($routeParams.id)));
	}
	
	$scope.save=function(){
		groceryListService.saveItem($scope.item);
		$location.path('/');
	};
}]);
