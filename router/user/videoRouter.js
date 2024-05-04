import Router from 'koa-router'
import { videoUpload, imageUpload } from '../../middleware/upload.js'
import VideoController from '../../controller/user/videoController.js'

const router = new Router({ prefix: '/video' })

// 获取视频详情
router.get('/info', VideoController.getVideoInfo)
// 收藏、取消收藏视频
router.post('/collect', VideoController.collectVideo)
// 对视频点赞、取消点赞
router.post('/like', VideoController.likeVideo)
// 上传视频
router.post('/publish/video', videoUpload.single('video'), VideoController.uploadVideo)
// 上传视频封面
router.post('/publish/cover', imageUpload.single('video_cover'), VideoController.uploadVideoCover)
// 发布视频
router.post('/publish', VideoController.publishVideo)

export default router
