const constants = require('./constants')
const SocketPlugins = require.main.require('./src/socket.io/plugins');
const db = require.main.require('./src/database')

SocketPlugins.myPlugin = {};
// SocketPlugins.myPlugin.myMethod = function(socket, data, callback) { ... };

const sockets = {};

sockets.init = function (callback) {
    SocketPlugins[constants.SOCKETS] = {};
    SocketPlugins[constants.SOCKETS].myMethod = function(socket, data, callback) { 
        console.log(constants.SOCKETS+'.myMethod'+' 被触发') 
        console.log(data)
        console.log(socket)
    };
}

module.exports = sockets


// (function (Sockets) {
//   'use strict';

//   var constants  = require('./constants'),
//       controller = require('./controller'),
//       nodebb     = require('./nodebb');

//   var sockets = nodebb.pluginSockets;

//   Sockets.init = function (callback) {
//       sockets[constants.SOCKETS] = {};
//       //Acknowledgements
//       sockets[constants.SOCKETS].getCalculationProperties = Sockets.getCalculationProperties;
//       sockets[constants.SOCKETS].getSettings = Sockets.getSettings;
//       sockets[constants.SOCKETS].saveCalculationProperties = Sockets.saveCalculationProperties;
//       sockets[constants.SOCKETS].saveSettings = Sockets.saveSettings;
//       callback();
//   };

//   Sockets.getCalculationProperties = function (socket, payload, callback) {
//       controller.getCalculationProperties(callback);
//   };

//   Sockets.getSettings = function (socket, payload, callback) {
//       controller.getSettings(callback);
//   };

//   Sockets.saveCalculationProperties = function (socket, payload, callback) {
//       controller.saveCalculationProperties(payload, callback);
//   };

//   Sockets.saveSettings = function (socket, payload, callback) {
//       controller.saveSettings(payload, callback);
//   };

// })(module.exports);