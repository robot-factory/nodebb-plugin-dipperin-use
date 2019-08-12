"use strict";

function initDipperinPage() {
	console.log('dipperin account page loaded!')

	function dipperinSet() {
		const data = {
			account: $('#dipperin-address').val()
		}
		console.log('dipperin set function is called')
		socket.emit('plugins.dipperin-account.setDipperinAddress', data, function (err, data) {
			if (err) {
				console.log('dipperin-account.setDipperinAddress error:', err)
			} else {
				console.log('dipperin-account.setDipperinAddress data:', data)
			}
		})
	}
	$('#dipperin-settings').on('click', dipperinSet)

	function dipperinDebug() {
		const data = {
			account: '0x'
		}
		socket.emit($('#dipperin-socketname').val(), data, function (err, data) {
			if (err) {
				console.log($('#dipperin-socketname').val(), 'error:', err)
			} else {
				console.log($('#dipperin-socketname').val(), 'data:', data)
			}
		})
	}
	$('#dipperin-debug').on('click', dipperinDebug)


	socket.on('plugins.dipperin-account.setDipperinAddress', function (data) {
		console.log('on dipperin-account.setDipperinAddress data:', data)
	})


	socket.emit('plugins.dipperin-account.getDipperinAddress', null, function (err, data) {
		console.log('dipperin get function is called')
		if (err) {
			console.log('dipperin-account.getDipperinAddress error:', err)
		} else {
			$('#dipperin-address').val(data.data.address);
			console.log('dipperin-account.getDipperinAddress data:', data)
		}
	})


	socket.on('plugins.dipperin-account.getDipperinAddress', function (data) {
		console.log('on dipperin-account.getDipperinAddress data:', data);
		$('#dipperin-address').val(data.data.address);
	})
}

function verifyApproved() {
	return new Promise((resolved, reject) => {
		window.dipperinEx.isApproved('nodebb').then((data) => {
			resolved(data);
		}).catch((e) => {
			reject(e)
		})
	});
}

function initDipperinBlog() {
	$('body').off('click');
	$('#new_topic').click(function (e) {
		e.preventDefault();
		verifyApproved().then((data) => {
			if(data.isApproved) {
				alert('has approve');
				console.log(data)
				app.newTopic(5);
			} else {
				alert('not approve');
			}
		}).catch((e) => {
			alert('not approve');
		})
	});
}

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

	// Note how this is shown in the console on the first load of every page
	const version = '0.0.15';
	console.log("nodebb-plugin-dipperin: loaded", version);
	// load tools for dipperin
	const dipperin = {};
	dipperin.utils = function () {
		console.log('add dipperin utils');
	};
	window.dipperin = dipperin;

	// add socket listener
	socket.on("dipperin:account.myMethod", function (data) {
		console.log("on dipperin:account.myMethod data:", data);
	});

	// add window listener

	// when page change, do something
	$(window).on("action:ajaxify.end", function (data) {
		console.log("window action:ajaxify.end", data);
		window.debugData = data;
		const currentPage = data.target.ajaxify.currentPage;
		// console.log('currentPage', currentPage);
		if (currentPage === 'dipperin') {
			initDipperinPage();
		} else if (currentPage === 'category/5/dipperin-blog') {
			initDipperinBlog();
		}
	});

});