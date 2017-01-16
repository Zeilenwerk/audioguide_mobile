var beacons = {};
var beaconNow = "00000000-0000-0000-0000-000000000000";

var Beacon = {

  startRangingBeacons: function() {
    var data = JSON.parse(localStorage.getItem('data'));

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


    for (var i = 0; i < data.length; i++) {
      if (data[i].uuid !== "" && data[i].uuid !== null) {
        Beacon.startRangingRegion({ uuid: data[i].uuid, identifier: data[i].titel });
      }
    }

    delegate.didRangeBeaconsInRegion = function onDidRangeBeaconsInRegion(result) {

      for(var i in result.beacons) {
        var beacon = result.beacons[i];
        beacons[beacon.uuid] = beacon;
      }

      var nearestBeacon = Beacon.getNearestBeacon(beacons);
      var secondBeacon = Beacon.getSecondBeacon(beacons);

      //console.log('didRangeBeaconsInRegion: ', {uuid: nearestBeacon.uuid, distance: nearestBeacon.accuracy});

      if (nearestBeacon) {
        var siteData = data.filter(function(siteData) {
          return siteData.uuid !== null && siteData.uuid !== '';
        }).filter(function(siteData) {
          return siteData.uuid.toLowerCase() === nearestBeacon.uuid.toLowerCase();
        })[0];

        if ((!secondBeacon && !nearestBeacon) || Beacon.pitaDistance(secondBeacon.accuracy, nearestBeacon.accuracy)) {
          if (nearestBeacon.uuid.toLowerCase() !== beaconNow) {
              site.displayData(siteData.url);
              beaconNow = nearestBeacon.uuid.toLowerCase();
          }
        }
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


  getSecondBeacon: function(beacons) {
    var secondBeacon = null;
    var sortable = [];

    for (var i in beacons) {
      sortable.push(beacons[i]);
    }

    sortable.sort(function(b1, b2) {
        return b1.accuracy - b2.accuracy;
    });

    secondBeacon = sortable[1];
    return secondBeacon;
  },


  isNearerThan: function(beacon1, beacon2) {
    return beacon1.accuracy > 0  && beacon2.accuracy > 0  && beacon1.accuracy < beacon2.accuracy;
  },


  getBeaconId: function(beacon) {
    return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
  },

  pitaDistance: function(second, nearest) {
    return (Math.sqrt((second * second) + (nearest * nearest)) / 2) > 0.5;
  }
};
