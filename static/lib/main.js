"use strict";

$(document).ready(function () {
  /*
  	This file shows how client-side javascript can be included via a plugin.
  	If you check `plugin.json`, you'll see that this file is listed under "scripts".
  	That array tells NodeBB which files to bundle into the minified javascript
  	that is served to the end user.

  	Some events you can elect to listen for:

  	$(document).ready();			Fired when the DOM is ready
  	$(window).on('action:ajaxify.end', function(data) { ... });			"data" contains "url"
  */

  console.log('nodebb-plugin-dipperin: loaded');
  // Note how this is shown in the console on the first load of every page
  function dipperinSet() {
    const data = {
      account: '0x'
    }
    socket.emit('plugins.dipperin-account.myMethod', data, function (err, data) {
      if (err) {
				console.log('plugins.dipperin-account.myMethod error:', err)
				return
      }
      console.log('plugins.dipperin-account.myMethod data:', data)
    })
  }

  socket.on('dipperin:account.myMethod', function (data) {
    console.log('on dipperin:account.myMethod data:', data)
  })

	$('#dipperin-settings').on('click', dipperinSet)
	
	$(window).on('action:ajaxify.end', function(data) {
		console.log('window action:ajaxify.end', data)
	});
});
