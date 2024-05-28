import jwt from 'jsonwebtoken'
import { PUBLIC_KEY } from '../app/config.js'

async function check(ctx, next) {
  console.log(ctx.path)
  if (
    ctx.path.startsWith('/api/user/login') ||
    ctx.path.startsWith('/api/user/register') ||
    ctx.path.startsWith('/api/user/checkname') ||
    ctx.path.startsWith('/api/user/codes') ||
    ctx.path.startsWith('/api/channel/all') ||
    ctx.path.startsWith('/admin_avatar') ||
    ctx.path.startsWith('/article_images') ||
    ctx.path.startsWith('/other') ||
    ctx.path.startsWith('/user_avatar') ||
    ctx.path.startsWith('/video_images') ||
    ctx.path.startsWith('/videos') ||
    ctx.path.startsWith('/favicon.ico')
  ) {
    // 不需要验证token
    await next()
  } else if (
    ctx.path.startsWith('/api/channel/user') ||
    ctx.path.startsWith('/api/news/list') ||
    ctx.path.startsWith('/api/news/article') ||
    ctx.path.startsWith('/api/news/hotlist') ||
    ctx.path.startsWith('/api/article/info') ||
    ctx.path.startsWith('/api/video/info') ||
    ctx.path.startsWith('/api/comment/list') ||
    ctx.path.startsWith('/api/comment/detail') ||
    ctx.path.startsWith('/api/user/detail') ||
    ctx.path.startsWith('/api/user/works') ||
    ctx.path.startsWith('/api/user/isfollow')
  ) {
    // 可能会携带token
    if (ctx.header.authorization) {
      const token = ctx.header.authorization.replace('Bearer ', '')
      const tokenItem = jwt.verify(token, PUBLIC_KEY, {
        algorithms: ['RS256'],
      })
      ctx.state.user = tokenItem
      const { time, timeout } = tokenItem
      let NewTime = new Date().getTime()
      if (NewTime - time <= timeout) {
        await next()
      } else {
        ctx.body = {
          status: 405,
          message: 'token 已过期，请重新登陆',
        }
      }
    } else {
      ctx.state.user = {}
      await next()
    }
  } else {
    // 必须携带token
    const token = ctx.header.authorization.replace('Bearer ', '')
    if (token) {
      const tokenItem = jwt.verify(token, PUBLIC_KEY, {
        algorithms: ['RS256'],
      })
      // 解析后挂载到ctx.state.user上
      ctx.state.user = tokenItem
      // 把创建时间和过期时间析构出来
      const { time, timeout } = tokenItem
      // 拿到当前时间
      let NewTime = new Date().getTime()
      if (NewTime - time <= timeout) {
        // 说明没过期
        await next()
      } else {
        ctx.body = {
          status: 405,
          message: 'token 已过期，请重新登陆',
        }
      }
    } else {
      ctx.body = {
        status: 405,
        message: '请带上token',
      }
    }
  }
}
export default check
