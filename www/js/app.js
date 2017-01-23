var App = {

  eventList: {},

  on: function(event, action) {
    if (!(event in App.eventList)) {
      App.eventList[event] = [];
    }
    App.eventList[event].push(action);
  },

  startService: function(service) {
    // something happens here...
  },

  trigger: function(event, options) {
    console.log('[APP] event ' + event + ' triggered');
    if (event in App.eventList) {
      App.eventList[event].forEach(function(action) {
        action(options);
      }, this);
    }
  },

  navigate: function(slug) {
    site.displayData(slug + '.html');
  }
}
