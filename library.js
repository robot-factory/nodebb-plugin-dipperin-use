'use strict'
const callbackify = require('./callbackify')
const _ = require('lodash')
// const Dipperin = require('@dipperin/dipperin.js')

// 初始化参数
// const dipperin = new Dipperin()

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

plugin.filterPostCreate = async function (data, next) {
	console.log('filter:post.create', data);
	if (data.data.cid === 5) {
		const postData = data.data;
		try {
			if (!postData.txHash) {
				throw new Error('The topic did not pay DIP');
			}
      const start = new Date().valueOf();
      let end = new Date().valueOf();
      const WAIT_TIME = 5000;
      while(end - start < WAIT_TIME) {
        end = new Date().valueOf();
				// const res = await dipperin.dr.getTransaction(postData.txHash)
				const res = {success: true}
				console.log(res)
        if(res.transaction) {
          next(null,data)
        }
      }
			throw new Error('The transaction has not on chain')

		} catch (e) {
      next(e,null)
			throw new Error(e)
		}
	} else {
		next(null, data);
	}
}

module.exports = plugin