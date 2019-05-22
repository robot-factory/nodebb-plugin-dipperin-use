
const Controllers = require('./controllers')
const controllers = new Controllers()

class Core {
  async init (params) {
    const router = params.router
    const hostMiddleware = params.middleware
    // const hostControllers = params.controllers
    router.get('/admin/plugins/quickstart', hostMiddleware.admin.buildHeader, controllers.renderAdminPage)
    router.get('/api/admin/plugins/quickstart', controllers.renderAdminPage)

    router.get('/dipperin', hostMiddleware.buildHeader, controllers.renderDipperin);
    router.get('/api/dipperin', controllers.renderDipperin);
  }

  async addAdminNavigation (header) {
    header.plugins.push({
      'icon': 'fa-tasks',
      'route': '/plugins/quickstart',
      'name': '快速开始'
    })

    return header
  }

  async addNavigation (header) {
    header.plugins.push({
      'icon': 'fa-tasks',
      'route': '/plugins/quickstart',
      'name': '快速开始'
    })

    return header
  }

  async beforePostContent (postData) {
    console.log(postData)
    return postData
  }

  addScript () {
    console.log('我是一个新插件！')
  }
}

module.exports = Core
