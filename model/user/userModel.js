import User from '../../schema/db/users.js'
import Channel from '../../schema/db/channel.js'
import Code from '../../schema/db/verification_code.js'
import Article from '../../schema/db/article.js'
import Video from '../../schema/db/video.js'

class UserModel {
  //获取用户/登录
  async getUser(username) {
    return await User.find({ user_name: username }, 'user_id user_name user_password')
  }
  //新增用户/注册
  async addUser(userinfo) {
    const newUser = {
      user_name: userinfo.name,
      user_nickname: userinfo.name,
      user_password: userinfo.password,
      user_email: userinfo.email,
    }
    return await User.create(newUser)
  }
  // 查找验证码
  async getCode(username) {
    return await Code.findOne({ user_name: username }, 'verification_code -_id')
  }
  async onLine(username) {
    await User.findOneAndUpdate({ user_name: username }, { user_state: 1 })
  }
  async logout(myid) {
    await User.findOneAndUpdate({ user_id: myid }, { user_state: 0 })
  }
  // 查找验证码
  async findCode(user_name, type) {
    return await Code.findOne({ user_name, type })
  }
  // 新增验证码
  async saveCode(user_name, type, verification_code) {
    await Code.deleteOne({ user_name, type })
    const code = {
      user_name,
      type,
      verification_code,
      createdAt: Date.now(),
    }
    return await Code.create(code)
  }
  // 删除验证码
  async delCode(user_name, type) {
    return await Code.deleteOne({ user_name, type })
  }

  // 获取用户信息
  async getInfo(user_id) {
    return await User.findOne(
      { user_id },
      'user_id user_name user_nickname user_avatar user_gender user_intro user_verified verified_content works_count fans_count followers_count comment_count likes_count'
    )
  }
  // 获取用户作品
  async getWorks(user_id, type, offset, size) {
    switch (type) {
      case 'all':
        const [articles, videos] = await Promise.all([
          Article.find({ user_id }).exec(),
          Video.find({ user_id }).exec(),
        ])
        return articles
          .concat(videos)
          .sort((a, b) => b.publish_time - a.publish_time)
          .slice(offset, offset + size)
      case 'article':
        return await Article.find({ user_id: user_id })
          .skip(offset)
          .limit(size)
          .sort({ publish_time: -1 })
          .exec()
      case 'video':
        return await Video.find({ user_id: user_id })
          .skip(offset)
          .limit(size)
          .sort({ publish_time: -1 })
          .exec()
      default:
        return new Error(`Invalid type: ${type}`)
    }
  }

  // 更新头像
  async updateAvr(user_avatar, user_id) {
    return await User.updateOne({ user_id }, { user_avatar })
  }
  // 更新个人资料
  async updateProfile(user_id, profileInfo) {
    const updData = {
      user_nickname: profileInfo.nickname,
      user_gender: profileInfo.gender,
      user_intro: profileInfo.intro,
    }
    return await User.updateOne({ user_id }, updData)
  }

  // 获取用户密码
  async getPassword(user_id) {
    return await User.findOne({ user_id }, 'user_password')
  }
  // 更新用户密码
  async updatePwd(user_id, user_password) {
    return await User.updateOne({ user_id }, { user_password })
  }

  // 获取用户频道
  async getChannels(userId) {
    return await User.find({ user_id: userId }, 'channel')
  }
  // 根据id查找频道
  async findChannel(id) {
    return await Channel.find({ id: id })
  }

  //判断用户是否已关注另一个用户
  async isFollowing(myId, userId) {
    const user = await User.findOne({ user_id: myId })
    if (user && user.followers.includes(userId)) {
      return true
    } else {
      return false
    }
  }

  //关注用户
  async addFollowing(myId, userId) {
    const [myIdUpdateResult, userIdUpdateResult] = await Promise.all([
      User.updateOne({ user_id: myId }, { $addToSet: { followers: userId }, $inc: { followers_count: 1 } }),
      User.updateOne({ user_id: userId }, { $addToSet: { fans: myId }, $inc: { fans_count: 1 } }),
    ])
    if (myIdUpdateResult.modifiedCount === 1 && userIdUpdateResult.modifiedCount === 1) {
      return true
    } else {
      return false
    }
  }
  //取消关注用户
  async deleteFollowing(myId, userId) {
    const [myIdUpdateResult, userIdUpdateResult] = await Promise.all([
      User.updateOne({ user_id: myId }, { $pull: { followers: userId }, $inc: { followers_count: -1 } }),
      User.updateOne({ user_id: userId }, { $pull: { fans: myId }, $inc: { fans_count: -1 } }),
    ])
    if (myIdUpdateResult.modifiedCount === 1 && userIdUpdateResult.modifiedCount === 1) {
      return true
    } else {
      return false
    }
  }
  // 是否收藏
  async isCollect(user_id, id, type) {
    const user = await User.findOne({ user_id })
    if (user && user.collect[type].includes(id)) {
      return true
    } else {
      return false
    }
  }
  //收藏
  async addCollect(user_id, id, type) {
    return await User.updateOne({ user_id }, { $addToSet: { [`collect.${type}`]: id } })
  }
  //取消收藏
  async deleteCollect(user_id, id, type) {
    return await User.updateOne({ user_id }, { $pull: { [`collect.${type}`]: id } })
  }
  // 是否点赞
  async isLike(user_id, id, type) {
    const user = await User.findOne({ user_id })
    if (user && user.like[type].includes(id)) {
      return true
    } else {
      return false
    }
  }
  //点赞
  async addLike(user_id, id, type) {
    return await User.updateOne({ user_id }, { $addToSet: { [`like.${type}`]: id } })
  }
  //取消点赞
  async deleteLike(user_id, id, type) {
    return await User.updateOne({ user_id }, { $pull: { [`like.${type}`]: id } })
  }

  //获取用户的粉丝列表
  async getFans(user_id, offset, size) {
    const { fans } = await User.findOne({ user_id }, 'fans')
    const fansArray = fans.slice(offset, offset + size)
    const fansInfoPromises = fansArray.map((fan_id) =>
      User.findOne({ user_id: fan_id }, 'user_id user_nickname user_avatar user_intro')
    )
    return await Promise.all(fansInfoPromises)
  }
  //获取用户的关注列表
  async getFollowers(user_id, offset, size) {
    const { followers } = await User.findOne({ user_id }, 'followers')
    const followersArray = followers.slice(offset, offset + size)
    const followersInfoPromises = followersArray.map((follower_id) =>
      User.findOne({ user_id: follower_id }, 'user_id user_nickname user_avatar user_intro')
    )
    return await Promise.all(followersInfoPromises)
  }
  //获取用户的收藏列表
  async getFavorite(user_id, type, offset, size) {
    const user = await User.findOne({ user_id })
    if (type === 'article') {
      const articles = await Article.find({ _id: { $in: user.collect.article } })
        .skip(offset)
        .limit(size)
      return articles
    } else if (type === 'video') {
      const videos = await Video.find({ _id: { $in: user.collect.video } })
        .skip(offset)
        .limit(size)
      return videos
    }
  }
  // 新增浏览历史
  async addBrowse(user_id, id, type) {
    // 尝试删除 id
    await User.updateOne({ user_id }, { $pull: { [`browse.${type}`]: id } })
    // 添加到首项
    return await User.updateOne({ user_id }, { $push: { [`browse.${type}`]: { $each: [id], $position: 0 } } })
  }
  //获取用户的浏览历史
  async getBrowse(user_id, type, offset, size) {
    const user = await User.findOne({ user_id })
    if (type === 'article') {
      const articles = await Article.find({ _id: { $in: user.browse.article } })
        .skip(offset)
        .limit(size)
      return articles
    } else if (type === 'video') {
      const videos = await Video.find({ _id: { $in: user.browse.video } })
        .skip(offset)
        .limit(size)
      return videos
    }
  }

  async getBind(user_id) {
    return await User.findOne({ user_id }, 'user_email user_phone')
  }
  // 更新work_count
  async updateWorkcount(user_id) {
    return User.updateOne({ user_id }, { $inc: { works_count: 1 } })
  }
}
export default new UserModel()
