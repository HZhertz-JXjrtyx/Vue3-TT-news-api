import Router from 'koa-router'
import { imageUpload } from '../../middleware/upload.js'
import UserController from '../../controller/user/userController.js'

const router = new Router({ prefix: '/user' })

// 登录
router.post('/login', UserController.login)
// 用户注册
router.post('/register', UserController.register)
// 验证用户名唯一
router.post('/checkname', UserController.checkName)
// 登出
router.post('/logout', UserController.logout)
// 获取验证码
router.get('/codes', UserController.getVerificationCode)
// 获取登录用户信息
router.get('/info', UserController.getUserInfo)
// 获取用户信息
router.get('/detail', UserController.getUserDetail)
// 上传头像
router.post('/upload/avatar', imageUpload.single('avatar'), UserController.uploadUserAvatar)
// 更新登录用户资料
router.patch('/profile', UserController.updateUserProfile)
// 获取用户绑定信息
router.get('/bind', UserController.getUserBind)
// 修改密码
router.patch('/password', UserController.updateUserPassword)
// 新增浏览历史
router.post('/browse', UserController.addUserBrowse)
// 是否关注
router.get('/isfollow', UserController.getIsFollow)
// 关注用户
router.post('/follow', UserController.updateUserFollow)
// 获取用户作品
router.get('/works', UserController.getUserWorks)
// 获取用户的粉丝列表
router.get('/fans', UserController.getUserFans)
// 获取用户的关注列表
router.get('/followers', UserController.getUserFollowers)
// 获取用户的收藏列表
router.get('/favorite', UserController.getUserFavorite)
// 获取用户的浏览历史
router.get('/browse', UserController.getUserBrowse)

export default router
