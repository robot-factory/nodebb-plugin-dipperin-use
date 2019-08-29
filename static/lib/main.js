"use strict";

const APP_NAME = 'nodebb'
const APP_ADDRESS = '0x0000E660bFeCFbe590Eee1E27e09793af92C9cc11061'

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
		window.dipperinEx.isApproved(APP_NAME)
			.then((data) => {
				resolved(data);
			})
			.catch((e) => {
				reject(e);
			})
	});
}

function approveApp() {
	return new Promise((resolved, reject) => {
		window.dipperinEx.approve(APP_NAME)
			.then(data => resolved(data))
			.catch(e => reject(e));
	});
}

function sendToApp(spend) {
	return new Promise((resolved, reject) => {
		// const extraData = 'To ' + APP_NAME
		const extraData = ''
		dipperinEx.send('nodebb', APP_ADDRESS, String(spend), extraData)
			.then(data => {
				resolved(data);
			})
			.catch(e => {
				reject(e);
			})
	})
}

function hasnotDipperinEx() {
	return !window.dipperinEx;
}

function handleSendToAppError(e) {
	if(e.isHaveWallet === false) {
		alert('请创建您的钱包！');
	} else if (e.isUnlock == false) {
		alert('请解锁您的钱包插件！');
	} else if (e.isApproved === false) {
		alert('请对 nodebb 进行授权！')
	} else if (e.popupExist == true) {
		alert('请完成上一个交易！')
	} else {
		alert('付费失败，请重新付费后进行发帖')
	}
}

function initDipperinBlog() {
	// $('body').off('click');
	$('#new_topic').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (hasnotDipperinEx()) {
			alert('请安装Dipperin chrome插件！')
			return
		}
		verifyApproved().then((data) => {
			console.log(data)
			if (data.isApproved) {
				sendToApp(0.1).then((txHash) => {
					console.log("SendToApp", txHash);
					app.newTopic(5);
					$(window).one("action:composer.loaded", function (ev, composerLoadedData) {
						console.log("action:composer.loaded data", composerLoadedData);
						// post the txHash data to composer.posts
						composer.posts[composerLoadedData["post_uuid"]].txHash = txHash;
					});
				}).catch(e => {
					console.log("sendToApp Error:", e);
					handleSendToAppError(e);
					return
				})
			} else {
				// alert('not approve');
				throw new Error("not approve");
			}
		}).catch((e) => {
			alert('未完成授权');
			approveApp();
		})
	});
}

function isDipperinPage(url) {
	return url === "dipperin"
}

function isDipperinBlog(url) {
	return url === 'category/5/dipperin-blog'
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
	const version = '0.0.18';
	console.log("nodebb-plugin-dipperin: loaded", version);
	// load tools for dipperin
	const dipperin = {};
	// dipperin.utils = function () {
	// 	console.log('add dipperin utils');
	// };
	window.dipperin = dipperin;
	require(['dipperin/utils'], function (utils) {
		// console.log("require utils", utils);
		window.dipperin.utils = utils;
	});

	// add socket listener
	// for example
	// socket.on("dipperin:account.myMethod", function (data) {
	// 	console.log("on dipperin:account.myMethod data:", data);
	// });

	require(['composer'], function (composer) {
		window.composer = composer;
	});
	

	// add window listener

	// when page change, do something
	$(window).on("action:ajaxify.end", function (ev, data) {
		console.log("window action:ajaxify.end", ev);
		console.log('data', data)
		// window.debugData = data;
		const currentPage = data.url;
		// console.log('currentPage', currentPage);
		if (isDipperinPage(currentPage)) {
			initDipperinPage();
		} 
		if (isDipperinBlog(currentPage)) {
			initDipperinBlog();
		}
	});

	$(window).on("action:ajaxify.start", function (ev, data) {
		console.log("action:ajaxify.start", ev);
		console.log("action:ajaxify.start data", data)
	});

	$(window).on("action:categories.new_topic.loaded", function (ev, data) {
		console.log("action:categories.new_topic.loaded", ev);
		console.log("action:categories.new_topic.loaded data", data);
	});

	$(window).on("action:composer.loaded",function (ev, data) {
		// console.log("action:composer.loaded", ev);
		console.log("action:composer.loaded data", data);
		// $(window).one('action:composer.submit', function (ev, data) {
		// 	console.log('action:composer.submit data', data);
		// 	data.composerData.txHash = "0x31eaf669270dd2e700210215e5d4be5be85758ae13bc14cf35a5cbf5a26baf66";
		// });
	});

	$(window).on('action:composer.submit', function (ev, submitData) {
		console.log('action:composer.submit data', submitData);
		// get txHash from submitData.postData = composer.posts[post_uuid]
		if(dipperin.utils.isTxHash(submitData.postData.txHash)) {
			submitData.composerData.txHash = submitData.postData.txHash;
		}
		// submitData.composerData.txHash = txHash;
		// composer.posts[composerLoadedData["post_uuid"]] = txHash;
	});

	$(window).on("action:topic.loaded", function (ev, topicData) {
		// console.log("action:topic.loaded", ev);
		console.log("action:topic.loaded data", topicData);
		if (topicData.spendValue) {
			$('.topic-title[component="topic/title"]').append(`<span class="spendDip" style="font-size:16px"><i class="fa fa-usd golden"></i> ${topicData.spendValue} DIP</span>`)
		}
	});
});