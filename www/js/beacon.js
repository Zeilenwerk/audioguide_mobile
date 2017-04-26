var beacons = {};
var beaconNow = "00000000-0000-0000-0000-000000000000";
var region;

var Beacon = {

  startRangingBeacons: function() {
    var data = Cache.getApiData();

    cordova.plugins.locationManager.requestAlwaysAuthorization();

    var delegate = new cordova.plugins.locationManager.Delegate();
    cordova.plugins.locationManager.setDelegate(delegate);

    delegate.didStartMonitoringForRegion = function onDidStartMonitoringForRegion(pluginResult) {
        console.log('didStartMonitoringForRegion:', pluginResult);
    };

    delegate.didDetermineStateForRegion = function onDidDetermineStateForRegion(result) {
      var eventType = result.state;
      var regionId = result.region.identifier;
      var d = new Date();
      var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
      console.log('didDetermineStateForRegion:', {type: eventType, time: time, regionId: regionId});
    };

    for (var i = 0; i < data.posts.length; i++) {
      if (data.posts[i].uuid !== "" && data.posts[i].uuid !== null) {
        try {
          Beacon.startRangingRegion({ uuid: data.posts[i].uuid,
                                    identifier: Network.splitUrl(data.posts[i].url) });
        } catch(e) {
          console.log("Beacon ranging error: " + e.message );
        }
      }
    }

    delegate.didRangeBeaconsInRegion = function onDidRangeBeaconsInRegion(result) {

      for(var i in result.beacons) {
        var beacon = result.beacons[i];
        beacons[beacon.uuid] = beacon;
      }

      var nearestBeacon = Beacon.getNearestBeacon(beacons);

      if (nearestBeacon) {
        console.log('didRangeBeaconsInRegion: ', {uuid: nearestBeacon.uuid, distance: nearestBeacon.accuracy});

        var stationData = data.posts.filter(function(stationData) {
          return stationData.uuid !== null && stationData.uuid !== '';
        }).filter(function(stationData) {
          return stationData.uuid.toLowerCase() === nearestBeacon.uuid.toLowerCase();
        })[0];

        App.trigger('beacon', { accuracy: nearestBeacon.accuracy,
                                uuid: nearestBeacon.uuid.toLowerCase(), 
                                identifier: Network.splitUrl(stationData.url) });
      }
    };
  },


  startRangingRegion: function(region) {
    console.log('start ranging region' + region.uuid);
    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
      region.identifier,
      region.uuid,
      region.major,
      region.minor);

    cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
      .fail(function() {
        console.log('Monitoring beacons did fail: ' + errorMessage);
      })
      .done();
  },


  getNearestBeacon: function(beacons) {
    var nearestBeacon = null;
    var secondBeacon = null;

    for (var i in beacons) {
      var beacon = beacons[i];
      if (!nearestBeacon) {
        nearestBeacon = beacon;
      } else {
        if (Beacon.getBeaconId(beacon) == Beacon.getBeaconId(nearestBeacon) || Beacon.isNearerThan(beacon, nearestBeacon)) {
          nearestBeacon = beacon;
        }
      }
    }

    return nearestBeacon;
  },


  isNearerThan: function(beacon1, beacon2) {
    return beacon1.accuracy > 0  && beacon2.accuracy > 0  && beacon1.accuracy < beacon2.accuracy;
  },


  getBeaconId: function(beacon) {
    return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
  },


  stopRangingBeacons: function() {
    console.log('[BEACON] stop ranging beacons');
    var data = Cache.getApiData();

    for (var i = 0; i < data.posts.length; i++) {
      if (data.posts[i].uuid !== "" && data.posts[i].uuid !== null) {
        Beacon.stopRangingRegion({ uuid: data.posts[i].uuid,
                                   identifier: Network.splitUrl(data.posts[i].url) });
      }
    }
  },

  stopRangingRegion: function(region) {
    console.log('[BEACON] stop ranging region' + region.uuid);
    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
      region.identifier,
      region.uuid,
      region.major,
      region.minor);

    cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
    .fail(function(e) { console.error(e); })
    .done();
  }
};

App.registerService('beacon', Beacon.startRangingBeacons, Beacon.stopRangingBeacons);
