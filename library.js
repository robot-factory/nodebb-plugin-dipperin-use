'use strict'
const callbackify = require('./callbackify');
const _ = require('lodash');
const winston = require('winston');
const dipperin = require('@dipperin/dipperin.js');
const async = require.main.require('async');
const db = require.main.require('./src/database')

const benefitAccount = "0x0000E660bFeCFbe590Eee1E27e09793af92C9cc11061"

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
	console.log("filter:post.create", data);
	// save txHash data in db
	const postData = data.data;
	data.post.txHash = postData.txHash
	// next step
	next(null, data);
}

plugin.filterTopicPost = function (data, next) {
	winston.info("filtertopicpost top=================================");
	// console.log('filter:topic.post', data);
	if (String(data.cid) === '5') {
		console.log(data.txHash);
		if (!data.txHash) {
			throw new Error("The post don't pay DIP!");
		} else {
			_dipperin.dr.getTransaction(data.txHash).then(
				txRes => {
					console.log(txRes);
					if (txRes.transaction) {
						if (txRes.transaction.TxData.to.toLowerCase() == benefitAccount.toLowerCase()) {
							data.txValue = Number(txRes.transaction.TxData.value) / 10 ** 18
							db.client.collection('objects').findOne({
								txHash: "data.txHash"
							}).then(r => {
								if (!r) {
									next(null, data);
								} else {
									next(new Error("重复交易"), null)
								}
							}).catch(e => {
								next(new Error("交易数据库验证失败，请重发"), null)
							})
						} else {
							next(new Error("发送地址错误"), null)
						}

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

plugin.filterTopicsGet = function (data, callback) {
	// console.log("filter:topics.get", data);
	const topics = data.topics;
	async.map(topics, function (topic, next) {
		if (topic.spendValue) {
			topic.title = topic.title + `<span class="spendDip"><i class="fa fa-usd golden"></i> ${topic.spendValue} DIP</span>`;
		}
		return next(null, topic);
	}, function (err) {
		return callback(err, data);
	});
	// next(null, data);
}

plugin.filterTopicCreate = function (data, next) {
	// console.log("filter:topic.create", data)
	if (data.data.txHash) {
		data.topic.txHash = data.data.txHash;
		data.topic.spendValue = data.data.txValue;
	}
	next(null, data);
}

plugin.filterTopicGet = function (data, next) {
	console.log("filter:topic.get", data);
	const topic = data.topic;
	// topic.title = topic.title + `<span class="spendDip"><i class="fa fa-usd golden"></i> ${topic.spendValue} DIP</span>`;
	next(null, data);
}


module.exports = plugin