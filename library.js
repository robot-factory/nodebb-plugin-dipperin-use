'use strict'
const callbackify = require('./callbackify')
const _ = require('lodash')

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

plugin.actionPostSave = function(data) {
  console.log('post data', data,'111111111111111111111111111111111111111111111111111111111111111')
}

plugin.filterPostGet = function (data, next) {
  console.log('filter:post.save', '等待5s！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！')
  setTimeout(()=>{
    next(null,data)
  },5000)
}

plugin.actionTopicSave = function(data) {
  console.log('topic data',data,'22222222222222222222222222222222222222222222222222222222222222')
}

module.exports = plugin
