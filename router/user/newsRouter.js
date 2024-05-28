import Router from 'koa-router' // 引入koa-router
import NewsController from '../../controller/user/newsController.js'

const router = new Router({ prefix: '/api/news' })

//获取新闻列表
router.get('/list', NewsController.getNewsList)
// 获取热点列表
router.get('/hotlist', NewsController.getHotList)

export default router
