var beacons = {};
var beaconCounter = 0;

var Beacon = {

  startRangingBeacons: function(data) {
    // Frage Berechtigung ab
    //cordova.plugins.locationManager.requestAlwaysAuthorization();

    var delegate = new cordova.plugins.locationManager.Delegate();
    cordova.plugins.locationManager.setDelegate(delegate);

    // Set delegate functions.
    delegate.didStartMonitoringForRegion = function onDidStartMonitoringForRegion(pluginResult) {
        console.log('didStartMonitoringForRegion:', pluginResult);
    };

    // Move into and out of region
    delegate.didDetermineStateForRegion = function onDidDetermineStateForRegion(result) {
      var eventType = result.state;
      var regionId = result.region.identifier;
      var d = new Date();
      var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
      console.log('didDetermineStateForRegion:', {type: eventType, time: time, regionId: regionId});
    };


    for (var i = 0; i < data.stations.length; i++) {
      if (data.stations[i].uuid !== "") {
        Beacon.startRangingRegion({ uuid: data.stations[i].uuid, identifier: data.stations[i].titel });
      }
    }

    delegate.didRangeBeaconsInRegion = function onDidRangeBeaconsInRegion(result) {
      beaconCounter++;

      for(var i in result.beacons) {
        var beacon = result.beacons[i];
        beacons[beacon.uuid] = beacon;
      }

      var nearestBeacon = Beacon.getNearestBeacon(beacons);
      var secondBeacon = Beacon.getSecondBeacon(beacons);

      if(nearestBeacon) {
        console.log('didRangeBeaconsInRegion:', {uuid: nearestBeacon.uuid, distance: nearestBeacon.accuracy});
        var stationData = data.stations.filter(function(stationData) {
          return stationData.uuid.toLowerCase() === nearestBeacon.uuid.toLowerCase();
        })[0];

        // Get station id from url param
        var re = /[\?&]station_id=([0-9]+)/g;
        var str = window.location.search;
        var match = re.exec(str);

        // Wenn nächste Station nicht dieselbe wie schon vorhanden ist
        if(beaconCounter > 10 && (!match || (match && match[1] != stationData.id))) {

          // Wenn Distanz kleiner als 0.5 Meter ist
          if ((secondBeacon && (secondBeacon.accuracy - nearestBeacon.accuracy) > 0.5) || !secondBeacon) {
            station.displayData(stationData.id);
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

};