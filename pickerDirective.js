angular.module('picker', []).directive('picker', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    link: function (scope, el, atts, ngModel) {
      el.spectrum({
        color: '#ffffff',
        flat: true,
        move: function (newColor) {
          scope.$apply(function () {
            ngModel.$setViewValue(newColor.toHexString());
          });
        },
        showButtons: false
      });
      ngModel.$render = function () {
        if (document.getElementById('firstColor').value !== "") {
          el.spectrum("set", ngModel.$viewValue);
        }
      };
      scope.$watch('currentColor', function () {
        if ('currentColor' === '1') {
          scope.$watch('mypicker', function (newVal, oldVal) {
            el.spectrum("set", newVal);
          });
        }
        if ('currentColor' === '2') {
          scope.$watch('mypicker2', function (newVal, oldVal) {
            el.spectrum("set", newVal);
          });
        }
      });
      $($('.sp-container')[1]).hide();
    }
  };
});