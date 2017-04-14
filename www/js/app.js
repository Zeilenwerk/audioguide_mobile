var App = {

  eventList: {},
  serviceList: {},

  on: function(event, action) {
    if (!(event in App.eventList)) {
      App.eventList[event] = [];
    }
    App.eventList[event].push(action);
  },

  registerService: function(service, start, stop) {
    App.serviceList[service] = {start: start, stop: stop};
  },

  startService: function(service) {
    if (service in App.serviceList) {
      App.serviceList[service].start();  
    }
  },

  stopService: function(service) {
    if (service in App.serviceList) {
      App.serviceList[service].stop();
    }
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
  },

  getUUID: function() {
    return device.uuid;
  }
}
