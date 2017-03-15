import DefineMap from 'can-define/map/';
import route from 'can-route';
import 'can-route-pushstate';
const AppViewModel = DefineMap.extend({
  message: {
    value: 'Hello World!',
    serialize: false
  },
  title: {
    value: '<%= name %>',
    serialize: false
  }
});
exports.routes = route;
export default AppViewModel;
