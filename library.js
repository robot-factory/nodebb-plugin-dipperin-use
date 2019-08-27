'use strict'
const callbackify = require('./callbackify')
const _ = require('lodash')
const winston = require('winston');
const dipperin = require('@dipperin/dipperin.js')

// 初始化参数
const _dipperin = new dipperin.default("http://14.17.65.122:3035")

// 重写所有 Promise 方法为 Callback 方式
const transform = origin => {
	const target = {}
	// 获取对象的所有键
	const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(origin))

	// 删除不必要的键
	_.pull(methods, 'constructor')
	// 如果类使用静态方法， 请注释掉上方， 并使用下方的代码代替
	// _.pull(methods, 'prototype', 'length', 'name')

	// 使用迭代器， 转换方法
	for (let method of methods) {
		target[method] = callbackify(origin[method])
	}
	return target
}

// 载入插件库核心
const Origin = require('./src/core')
const origin = new Origin()

// 转换
const plugin = transform(origin)

plugin.actionPostSave = function (data) {
	console.log('action:post.save data', data);
}

plugin.filterPostGet = function (data, next) {
	// console.log('filter:post.save', data, '等待5s！');
	// setTimeout(() => {
	// 	next(null, data);
	// }, 5000);

	console.log('filter:post.save', data);
	next(null, data);
}

plugin.actionTopicSave = function (data) {
	console.log('topic data', data)
}

plugin.filterPostCreate = function (data, next) {
	winston.info("filterPostCreate top=================================");
	console.log('filter:post.create', data);
	// console.log('filter:post.create data', data.data);
	// console.log("cid:", data.data.cid, "cid == 5:", String(data.data.cid) === '5', typeof data.data.cid);
	if (String(data.data.cid) === '5') {
		const postData = data.data;
		console.log(data.data.txHash);
		if (!postData.txHash) {
			throw new Error("The post don't pay DIP!");
		} else {
			// console.log(new dipperin.default())
			_dipperin.dr.getTransaction(postData.txHash).then(
				txRes => {
					console.log(txRes);
					if(txRes.transaction) {
						data.post.txHash = postData.txHash
						next(null, data);
					} else {
						next(new Error("交易还未上链"), null)
					}
					// console.log(res);
					// next(null, data);
				}
			).catch(e => {
				console.log(e);
				next(new Error(e), null);
			})
		}

	} else {
		next(null, data);
	}
	//winston.info("add dice seed");
	//winston.info(payload.post.content);

	winston.info("filterPostCreate bottom=============================================");
}

plugin.filterTopicPost = function (data, next) {
	winston.info("filtertopicpost top=================================");
	console.log('filter:topic.post', data);
	if (String(data.cid) === '5') {
		console.log(data.txHash);
		if (!data.txHash) {
			throw new Error("The post don't pay DIP!");
		} else {
			_dipperin.dr.getTransaction(data.txHash).then(
				txRes => {
					console.log(txRes);
					if(txRes.transaction) {
						next(null, data);
					} else {
						next(new Error("交易还未上链"), null)
					}
				}
			).catch(e => {
				console.log(e);
				next(new Error(e), null);
			})
		}

	} else {
		next(null, data);
	}
	winston.info("filtertopicpost bottom=============================================");
}

module.exports = plugin