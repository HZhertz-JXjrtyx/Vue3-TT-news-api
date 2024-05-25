import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PRIVATE_KEY } from '../../app/config.js'
import sendEmail from '../../utils/sendEmail.js'
import UserModel from '../../model/user/userModel.js'
import MessageModel from '../../model/user/messageModel.js'
import renameFileBasedOnContent from '../../utils/renameFile.js'
import { sendNotifyMessage } from '../../utils/sendMessage.js'

class UserController {
  // 注册
  async register(ctx) {
    const userinfo = ctx.request.body
    // console.log(userinfo)
    const usernames = await UserModel.getUser(userinfo.name) //用户名是否重复
    // console.log(usernames)
    if (usernames.length > 0) {
      ctx.body = { type: 'error', message: '用户名被占用，请更换其他用户名！' }
    } else {
      // 验证码是否正确
      // 拿到数据库中存储的验证码
      const verifyCode = await UserModel.findCode(userinfo.name, 'register')
      // console.log(verifyCode)
      if (verifyCode) {
        if (verifyCode.verification_code == userinfo.code) {
          const salt = bcrypt.genSaltSync(10)
          const hash = bcrypt.hashSync(userinfo.password, salt) //密文
          userinfo.password = hash
          const result = await UserModel.addUser(userinfo)
          // console.log(result)
          if (result.user_id) {
            ctx.body = {
              type: 'success',
              status: 200,
              message: '注册成功,请登录！',
            }
          } else {
            ctx.body = { type: 'error', message: '注册失败！' }
          }
        } else {
          ctx.body = { type: 'error', message: '验证码错误！' }
        }
      } else {
        ctx.body = { type: 'error', message: '验证码失效！' }
      }
    }
  }
  // 用户名是否唯一
  async checkName(ctx) {
    let userInfo = ctx.request.body
    // console.log(userInfo)
    const rows = await UserModel.getUser(userInfo.username)
    // console.log(rows)
    if (rows.length === 0) {
      ctx.body = {
        status: 200,
        message: '没有用户名',
        type: 'success',
      }
    } else {
      ctx.body = {
        status: 409,
        message: '已有用户名',
        type: 'error',
      }
    }
  }
  // 获取验证码
  async getVerificationCode(ctx) {
    try {
      const { userName, userEmail, type } = ctx.request.query
      // console.log(userName, userEmail, type)
      const findRes = await UserModel.findCode(userName, type)
      if (findRes && Date.now() - findRes.createdAt < 60000) {
        ctx.body = { status: 429, type: 'error', message: '验证码发送频繁！' }
      } else {
        const verificationCode = Math.floor(Math.random() * 900000) + 100000
        // console.log(verificationCode)
        const result = await UserModel.saveCode(userName, type, verificationCode)
        // console.log(result)
        if (result.user_name === userName) {
          // 通过邮件发送验证码
          const info = await sendEmail(
            userEmail,
            'TT-news',
            `${type === 'register' ? '注册验证' : '安全验证'}\n你的验证码为${verificationCode}，5分钟内有效`,
            `<h1>${type === 'register' ? '注册验证' : '安全验证'}</h1>
						 <h1>你的验证码为${verificationCode}，5分钟内有效</h1>`
          )
          // console.log(`Message sent: ${info.messageId}`)
          ctx.body = {
            status: 200,
            message: '验证码发送成功',
            type: 'success',
          }
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  // 登录
  async login(ctx) {
    let userInfo = ctx.request.body
    // console.log(userInfo.name, userInfo.password)
    const rows = await UserModel.getUser(userInfo.name)
    // console.log(rows)
    if (rows.length === 1) {
      const compareResult = bcrypt.compareSync(userInfo.password, rows[0].user_password)
      if (compareResult) {
        const payload = {
          _id: rows[0]._id,
          id: rows[0].user_id,
          username: rows[0].user_name,
          time: new Date().getTime(),
          timeout: 1000 * 60 * 60 * 48,
        }
        const token = jwt.sign(payload, PRIVATE_KEY, {
          algorithm: 'RS256', // 指定算法
        })
        // 用户上线
        await UserModel.onLine(userInfo.name)
        ctx.body = {
          status: 200,
          message: '登录成功',
          token: `Bearer ${token}`,
          username: rows[0].user_name,
          type: 'success',
        }
      } else {
        ctx.body = { type: 'error', message: '用户名或密码不正确' }
      }
    } else {
      ctx.body = { type: 'error', message: '用户名不存在' }
    }
  }
  // 退出登录
  async logout(ctx) {
    let myid = ctx.state.user.id
    // console.log('0000000000', myid)
    // 用户下线
    await UserModel.logout(myid)
    ctx.body = {
      status: 200,
      message: '已下线',
      type: 'success',
    }
  }
  // 获取登录用户信息
  async getUserInfo(ctx) {
    const myId = ctx.state.user.id
    const userInfo = await UserModel.getInfo(myId)

    if (userInfo.user_id) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取个人信息成功！',
        data: userInfo,
      }
    } else {
      ctx.body = { type: 'error', message: '获取个人信息失败！' }
    }
  }
  // 新增浏览历史
  async addUserBrowse(ctx) {
    const myId = ctx.state.user.id
    const { id, type } = ctx.request.body
    // console.log(myId, id, type)
    const result = await UserModel.addBrowse(myId, id, type)
    // console.log(result)
    if (result.modifiedCount === 1) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '新增浏览历史成功！',
      }
    } else {
      ctx.body = { type: 'error', message: '新增浏览历史失败！' }
    }
  }
  // 是否关注某用户
  async getIsFollow(ctx) {
    const myId = ctx.state.user.id
    const { userId } = ctx.request.query
    const res = await UserModel.isFollowing(myId, userId)
    ctx.body = {
      type: 'success',
      status: 200,
      message: res ? '已关注' : '未关注',
      result: res,
    }
  }
  // 关注、取消关注用户
  async updateUserFollow(ctx) {
    const { id: myId, _id: my_id } = ctx.state.user
    const { userId, type } = ctx.request.body
    // console.log(myId, my_id, userId, type)
    //  关注
    if (type) {
      const res = await UserModel.isFollowing(myId, userId)
      // console.log(res)
      if (res) {
        ctx.body = { type: 'error', message: '已关注！' }
      } else {
        const result = await UserModel.addFollowing(myId, userId)
        // console.log(result)
        if (!result) {
          ctx.body = { type: 'error', message: '关注用户失败！' }
        } else {
          const userInfo = await UserModel.getInfo(userId)
          if (my_id !== String(userInfo._id)) {
            // 是否已有通知
            const isRepeat = await MessageModel.findNotifyByUserAndType(my_id, userInfo._id, 'follow', my_id)
            // console.log('isRepeat', isRepeat)
            if (!isRepeat) {
              const addNotifyRes = await MessageModel.addNotifyMessage(
                '关注了你',
                my_id,
                userInfo._id,
                Date.now(),
                'follow',
                undefined,
                my_id,
                'User'
              )
              // console.log(addNotifyRes)
              if (addNotifyRes._id) {
                const notificationInfo = await MessageModel.findMessage(addNotifyRes._id)
                await sendNotifyMessage(notificationInfo)
              }
            }
          }
          ctx.body = {
            type: 'success',
            status: 200,
            message: '关注用户成功！',
          }
        }
      }
    } else {
      const res = await UserModel.isFollowing(myId, userId)
      // console.log(res)
      if (!res) {
        ctx.body = { type: 'error', message: '未关注！' }
      } else {
        const result = await UserModel.deleteFollowing(myId, userId)
        // console.log(result)
        if (!result) {
          ctx.body = { type: 'error', message: '取消关注用户失败！' }
        } else {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '取消关注用户成功！',
          }
        }
      }
    }
  }
  // 更新用户个人头像
  async uploadUserAvatar(ctx) {
    const myId = ctx.state.user.id
    const newFilename = await renameFileBasedOnContent(ctx.request.file.path)
    const newUrl = 'http://127.0.0.1:3007/user_avatar/' + newFilename
    const result = await UserModel.updateAvr(newUrl, myId)
    if (result.matchedCount === 1) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '更新个人头像成功！',
        newUrl,
      }
    } else {
      ctx.body = { type: 'error', message: '更新个人头像失败！' }
    }
  }
  // 更新用户个人资料
  async updateUserProfile(ctx) {
    const myId = ctx.state.user.id
    const profileInfo = ctx.request.body
    // console.log(myId, profileInfo)
    const result = await UserModel.updateProfile(myId, profileInfo)
    // console.log(result)
    if (result.acknowledged) {
      if (result.modifiedCount) {
        ctx.body = {
          type: 'success',
          status: 200,
          message: '更新用户个人资料成功！',
        }
      } else if (!result.matchedCount) {
        ctx.body = { type: 'error', message: '没有匹配项' }
      } else {
        ctx.body = {
          type: 'success',
          status: 200,
          message: '没有数据被修改',
        }
      }
    } else {
      ctx.body = { type: 'error', message: '未正确处理更新请求' }
    }
  }
  // 获取用户信息
  async getUserDetail(ctx) {
    const { userId } = ctx.request.query
    // console.log(userId)
    const userInfo = await UserModel.getInfo(userId)
    // console.log(userInfo)
    if (userInfo.user_id) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取用户信息成功！',
        data: userInfo,
      }
    } else {
      ctx.body = { type: 'error', message: '获取用户信息失败！' }
    }
  }
  // 获取用户作品列表
  async getUserWorks(ctx) {
    try {
      const { userId, type, page, size } = ctx.request.query
      // console.log(userId, type, page, size)
      const offset = (page - 1) * size

      const worksData = await UserModel.getWorks(userId, type, offset, parseInt(size))
      // console.log(worksData)
      if (worksData.length === 0) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 204,
          message: '没有更多数据！',
          data: [],
        }
      } else {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取作品列表成功！',
          data: worksData,
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  // 获取用户粉丝列表
  async getUserFans(ctx) {
    try {
      const { userId, page, size } = ctx.request.query
      // console.log(userId, page, size)
      const offset = (page - 1) * size
      const fansData = await UserModel.getFans(userId, offset, parseInt(size))
      // console.log(fansData)
      if (fansData.length === 0) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 204,
          message: '没有更多数据！',
          data: fansData,
        }
      } else {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取粉丝列表成功！',
          data: fansData,
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  // 获取用户关注列表
  async getUserFollowers(ctx) {
    try {
      const { userId, page, size } = ctx.request.query
      // console.log(userId, page, size)
      const offset = (page - 1) * size
      const followersData = await UserModel.getFollowers(userId, offset, parseInt(size))
      // console.log(followersData)
      if (followersData.length === 0) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 204,
          message: '没有更多数据！',
          data: followersData,
        }
      } else {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取关注列表成功！',
          data: followersData,
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  //获取用户的收藏列表
  async getUserFavorite(ctx) {
    try {
      const myId = ctx.state.user.id
      const { type, page, size } = ctx.request.query
      // console.log(myId, type, page, size)
      const offset = (page - 1) * size
      const favoriteData = await UserModel.getFavorite(myId, type, offset, parseInt(size))
      if (favoriteData.length === 0) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 204,
          message: '没有更多数据！',
          data: [],
        }
      } else {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取用户的收藏列表成功！',
          data: favoriteData,
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  //获取用户的浏览历史
  async getUserBrowse(ctx) {
    try {
      const myId = ctx.state.user.id
      const { type, page, size } = ctx.request.query
      // console.log(myId, type, page, size)
      const offset = (page - 1) * size
      const browseData = await UserModel.getBrowse(myId, type, offset, parseInt(size))
      if (browseData.length === 0) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 204,
          message: '没有更多数据！',
          data: [],
        }
      } else {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取用户浏览历史成功！',
          data: browseData,
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  // 获取用户绑定信息
  async getUserBind(ctx) {
    const myId = ctx.state.user.id
    const bindData = await UserModel.getBind(myId)
    if (bindData.user_email) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取用户绑定信息成功',
        data: bindData,
      }
    } else {
      ctx.body = {
        type: 'success',
        status: 204,
        message: '用户未绑定邮箱',
        data: bindData,
      }
    }
  }
  // 更新密码
  async updateUserPassword(ctx) {
    const myId = ctx.state.user.id
    const {
      _doc: { user_name },
    } = await UserModel.getInfo(myId)
    const { oldPwd, newPwd, code } = ctx.request.body
    // console.log(oldPwd, newPwd, code)
    // 验证验证码
    const codeRes = await UserModel.findCode(user_name, 'changePwd')
    if (codeRes) {
      if (codeRes.verification_code === parseInt(code)) {
        // 验证旧密码
        const {
          _doc: { user_password },
        } = await UserModel.getPassword(myId)
        // console.log(user_password)
        const compareResult = bcrypt.compareSync(oldPwd, user_password)
        // console.log(compareResult)
        if (compareResult) {
          // 新旧密码是否相同
          if (oldPwd !== newPwd) {
            // 密码加密
            const pwdHash = bcrypt.hashSync(newPwd, bcrypt.genSaltSync(10))
            // 更新密码
            const result = await UserModel.updatePwd(myId, pwdHash)
            // console.log(result)
            if (result.modifiedCount === 1) {
              // 删除验证码
              await UserModel.delCode(user_name, 'changePwd')
              ctx.body = {
                type: 'success',
                status: 200,
                message: '更新密码成功！',
              }
            } else {
              ctx.body = { type: 'error', message: '更新密码失败' }
            }
          } else {
            ctx.body = { type: 'error', message: '新密码不能与旧密码相同' }
          }
        } else {
          ctx.body = { type: 'error', message: '原密码错误' }
        }
      } else {
        ctx.body = { type: 'error', message: '验证码错误' }
      }
    } else {
      ctx.body = { type: 'error', message: '验证码无效' }
    }
  }
}
export default new UserController()
