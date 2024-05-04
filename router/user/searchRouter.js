import Router from 'koa-router'
import SearchController from '../../controller/user/searchController.js'

const router = new Router({ prefix: '/search' })

//获取搜索列表
// router.get('/result', SearchController.getSearchResult)

export default router
