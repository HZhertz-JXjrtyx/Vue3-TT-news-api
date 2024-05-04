import Router from 'koa-router'
import { imageUpload } from '../../middleware/upload.js'
import ArticleController from '../../controller/user/articleController.js'
// import validateSchemaJoi from '../../middleware/schema.js'
// import { reg_login_schema } from '../../schema/joi/my.js'

const router = new Router({ prefix: '/article' })

// 获取文章详情
router.get('/info', ArticleController.getArticleInfo)
// 收藏、取消收藏文章
router.post('/collect', ArticleController.collectArticle)
// 对文章点赞、取消点赞
router.post('/like', ArticleController.likeArticle)
// 上传文章图片
router.post('/publish/image', imageUpload.array('article_img', 20), ArticleController.uploadArticleImage)
// 上传文章封面
router.post('/publish/cover', imageUpload.array('article_cover', 3), ArticleController.uploadArticleCover)
// 发布文章
router.post('/publish', ArticleController.publishArticle)

export default router
