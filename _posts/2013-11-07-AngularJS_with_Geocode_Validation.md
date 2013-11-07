---
layout: post
title: AngularJS with Google Geocode Validation
---

{{ page.title }}
================
In this article I will explain how I created a location validation directive.
The directive is written in Javascript for AngularJS. The directive is applied
to a form input. The directive uses an AngularJS service to communicate with
Geocode in Google Maps API. The service responds to the directive with a promise.

Create the Example Form
-----------------------
A simple form is made to test the validation and service. This form has only one
input and a submit box. The input will have its value validated to be a real
location. The submit box is disabled until the form is valid.

{% highlight html %}
<div>
<form novalidate name="newForm" class="app-form css-form">
  <input type="text" name="fLocation" class="form-control" ng-model="formData.location"
    placeholder="Location" ng-pattern="/^[a-zA-Z, ]*$/" valid-Location required/>
  <button class="form-control btn btn-success" ng-disabled="newForm.$invalid" 
    ng-click="doSomething(formData)">Submit</button>
  </form>
</div>
{% endhighlight %}

Creating an AngularJS Validation Directive
------------------------------------------
Now lets create the validation directive. When I started this task I followed the
custom validation example at the AngularJS website. The function `numberOfLocations`
in the geocode service returns a promise. In order to understand `promises` I read
the article ["Promises Explained as a Cartoon."](http://andyshora.com/promises-angularjs-explained-as-cartoon.html)
To act on a promise you add code to a function to `then`.

{% highlight js %}
.directive('validLocation', ['GeoCode', function(geoCode) { 
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
        if (viewValue.length < 5) {
          ctrl.$setValidity('validLocation', false);
          return undefined;
        }
        geoCode.numberOfLocations(viewValue)
        .then(function(results) {
          // console.log('numberOfLocations(viewValue): ' + numberOfLocations(viewValue));
          console.log('results', results);
          if (1 == results) {
            ctrl.$setValidity('validLocation', true);
            return viewValue;
          } else {
            ctrl.$setValidity('validLocation', false);
            return undefined;
          }
        });
      });
    }
  };
}]);
{% endhighlight %}

Make sure that if you use camel case to define your directive you don't use camel
case in your HTML form. As you can see above I have "valid-location", while my 
directive is "validLocation." Note they use "unshift" on the $parsers, while I use
"push." This is to just add it to the list of parsers and leave it up to your ordering
in the HTML to dictate priority. "Unshift," would always put it at the top.

Creating the Geocode AngularJS Service
--------------------------------------
In this part we will be creating an adapter for the Google Geocode service that
returns a promise. Geocoding is the process of looking up latitude and longitude
from a string. The Google Geocoding API requires a general location to begin its
search. In this example the variable `myLatLng` is that location. To create a promise
follow this easy pattern:
1. Create the deferred.
2. Call the asynchronous function/long running function. It MUST return deferred.resole and/or deferred.reject.
3. Return the deferred promise.
You can see this pattern being followed in this service.

{% highlight js %}
.factory('GeoCode', function($q) {
  return { 
    numberOfLocations: function(address) {
      var geocoder = new google.maps.Geocoder();
      var deferred = $q.defer();
      var myLatLng = new google.maps.LatLng(36.05, -118.25);
      geocoder.geocode( {'address': address, latLng: myLatLng }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          return deferred.resolve(results.length);
        }
        return deferred.reject();
      });
      return deferred.promise;
    }
  };
});
{% endhighlight %}

[1] http://andyshora.com/promises-angularjs-explained-as-cartoon.html "Promises Explained as a Cartoon"
[2] http://liamkaufman.com/blog/2013/09/09/using-angularjs-promises/ "Using AngularJS Promises"
[3] http://docs.angularjs.org/api/ng.$q "AngularJS $q"
