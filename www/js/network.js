var Network = {

  // Überprüfe Netzwerkstatus
  checkNetwork: function(online, offline) {
    console.log('checkNetwork function');
    var networkState = navigator.connection.type;
    if (networkState === Connection.NONE) {
      offline();
    } else {
      online();
    }
  }
};
