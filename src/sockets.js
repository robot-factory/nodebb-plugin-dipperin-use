const constants = require('./constants')
const SocketPlugins = require.main.require('./src/socket.io/plugins')
const db = require.main.require('./src/database')
// const winston = require('winston')

SocketPlugins.myPlugin = {}
// SocketPlugins.myPlugin.myMethod = function(socket, data, callback) { ... };

const sockets = {}

sockets.init = function (callback) {
  SocketPlugins[constants.SOCKETS] = {}

  // a template
  SocketPlugins[constants.SOCKETS].myMethod = function (socket, data, callback) {
    const key = `uid:${socket.uid}:dipperin`
    const msg = `plugins.${constants.SOCKETS}.myMethod is called from uid-${socket.uid}, db key is ${key}`
    console.log(msg)
  }
  SocketPlugins[constants.SOCKETS].getDipperinAddress = function (socket, data, callback) {
    try {
      const key = `uid:${socket.uid}:dipperin`
      const msg = `plugins.${constants.SOCKETS}.getDipperinAddress is called from uid-${socket.uid}, db key is ${key}`
      console.log(msg)
      db.getObject(key, function (err, data) {
        if (err) {
          console.log('get', key, 'fail', err)
          callback(null, {
            success: false,
            info: err
          })
        } else {
          callback(null, {
            success: true,
            key,
            data
          })
          // console.log(`plugins.${constants.SOCKETS}.getDipperinAddress ${key} data is ${JSON.stringify(data)}`)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  SocketPlugins[constants.SOCKETS].setDipperinAddress = function (socket, data, callback) {
    const key = `uid:${socket.uid}:dipperin`
    const msg = `plugins.${constants.SOCKETS}.setDipperinAddress is called from uid-${socket.uid}, db key is ${key}`
    console.log(msg)
    const writeData = {
      address: data.account,
      createtime: Date.now()
    }
    db.setObject(key, writeData, function (err) {
      if (err) {
        callback(null, {
          success: false,
          info: err
        })
      } else {
        callback(null, {
          success: true
        })
      }
      console.log('setObject', key, 'success')
    })
    console.log('type of callback', typeof callback)
    callback(null, {
      success: true
    })
  }

  SocketPlugins[constants.SOCKETS].tippingTopic = function (socket, data, callback) {
    const msg = `plugins.${constants.SOCKETS}.setDipperinAddress is called from uid-${socket.uid}`
    console.log(msg, data)
    callback(null, null);
  }
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
