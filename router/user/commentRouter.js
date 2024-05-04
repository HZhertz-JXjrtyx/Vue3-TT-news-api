import Router from 'koa-router' // 引入koa-router
import CommentController from '../../controller/user/commentController.js'

const router = new Router({ prefix: '/comment' }) // 创建路由，支持传递参数
// 获取评论或评论回复列表
router.get('/list', CommentController.getComments)
// 获取评论详情
router.get('/detail', CommentController.getCommentDetail)
// 新增评论或回复
router.post('/add', CommentController.addComment)
// 对评论点赞、取消点赞
router.post('/like', CommentController.LikeComment)
// 删除评论
router.delete('/delete', CommentController.deleteComment)

export default router
