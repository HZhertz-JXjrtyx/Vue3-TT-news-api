import ArticleModel from '../../model/user/articleModel.js'
import UserModel from '../../model/user/userModel.js'
import MessageModel from '../../model/user/messageModel.js'
import renameFileBasedOnContent from '../../utils/renameFile.js'

class ArticleController {
  //获取文章详情
  async getArticleInfo(ctx) {
    try {
      const myId = ctx.state.user.id
      // console.log(myId)
      const { articleId } = ctx.request.query
      const { _doc: articleInfo } = await ArticleModel.getArticle(articleId)
      const { _doc: userInfo } = await UserModel.getInfo(articleInfo.user_id)
      articleInfo.user_info = userInfo

      if (myId) {
        articleInfo.is_followed = await UserModel.isFollowing(myId, articleInfo.user_id)
        articleInfo.is_liked = await UserModel.isLike(myId, articleId, 'article')
        articleInfo.is_collected = await UserModel.isCollect(myId, articleId, 'article')
      } else {
        articleInfo.is_followed = false
        articleInfo.is_liked = false
        articleInfo.is_collected = false
      }
      // console.log(articleInfo)
      if (articleInfo) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取article信息成功！',
          data: articleInfo,
        }
      } else {
        ctx.status = 404
        ctx.body = {
          type: 'error',
          status: 404,
          message: '获取article信息失败！',
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: `服务器内部错误${error}`,
      }
    }
  }
  // 收藏、取消收藏文章
  async collectArticle(ctx) {
    const myId = ctx.state.user.id
    const { articleId, type } = ctx.request.body
    const isCollect = await UserModel.isCollect(myId, articleId, 'article')
    // 收藏
    if (type) {
      if (isCollect) {
        ctx.body = { type: 'success', message: '已收藏！' }
      } else {
        const result = await UserModel.addCollect(myId, articleId, 'article')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '收藏文章失败！' }
        } else {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '收藏文章成功！',
          }
        }
      }
    } else {
      if (!isCollect) {
        ctx.body = { type: 'success', message: '未收藏！' }
      } else {
        const result = await UserModel.deleteCollect(myId, articleId, 'article')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '取消收藏失败！' }
        } else {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '取消收藏成功！',
          }
        }
      }
    }
  }

  // 对文章点赞、取消点赞
  async likeArticle(ctx) {
    const myId = ctx.state.user.id
    const my_id = ctx.state.user._id
    const { articleId, type } = ctx.request.body
    const isLike = await UserModel.isLike(myId, articleId, 'article')
    if (type) {
      if (isLike) {
        ctx.body = { type: 'success', message: '已对文章点赞！' }
      } else {
        const result = await UserModel.addLike(myId, articleId, 'article')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '对文章点赞失败！' }
        } else {
          const articleInfo = await ArticleModel.getArticle(articleId)
          const authorInfo = await UserModel.getInfo(articleInfo.user_id)

          if (my_id !== String(authorInfo._id)) {
            const addNotifyRes = await MessageModel.addNotifyMessage(
              '赞了你的文章',
              my_id,
              authorInfo._id,
              Date.now(),
              'like',
              undefined,
              articleInfo._id,
              'Article',
							articleInfo._id,
              'Article'
            )
            console.log(addNotifyRes)
          }
          ctx.body = {
            type: 'success',
            status: 200,
            message: '对文章点赞成功！',
          }
        }
      }
    } else {
      if (!isLike) {
        ctx.body = { type: 'success', message: '还未对文章点赞！' }
      } else {
        const result = await UserModel.deleteLike(myId, articleId, 'article')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '取消对文章点赞失败！' }
        } else {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '取消对文章点赞成功！',
          }
        }
      }
    }
  }

  // 上传文章图片
  async uploadArticleImage(ctx) {
    const fileArr = ctx.request.files
    const imageList = []
    for (let file of fileArr) {
      const newFilename = await renameFileBasedOnContent(file.path)
      imageList.push('http://127.0.0.1:3007/article_images/' + newFilename)
    }
    console.log(imageList)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '文章图片上传成功！',
      imageList,
    }
  }
  // 上传文章封面
  async uploadArticleCover(ctx) {
    const fileArr = ctx.request.files
    const coverList = []
    for (let file of fileArr) {
      console.log('file.path', file.path)
      const newFilename = await renameFileBasedOnContent(file.path)
      coverList.push('http://127.0.0.1:3007/article_images/' + newFilename)
    }
    console.log(coverList)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '文章封面上传成功！',
      coverList,
    }
  }
  // 发布文章
  async publishArticle(ctx) {
    const myId = ctx.state.user.id
    const { channelId, title, content, coverImage, articleImage, uiStyle, publishTime } = ctx.request.body
    console.log(myId, channelId, title, content, coverImage, articleImage, uiStyle, publishTime)
    const addRes = await ArticleModel.addArticle(
      myId,
      channelId,
      title,
      content,
      coverImage,
      articleImage,
      uiStyle,
      publishTime
    )
    const updRes = await ArticleModel.updateWorkcount(myId)
    console.log(addRes, updRes)
    if (addRes.article_id && updRes.modifiedCount === 1) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '文章上传成功！',
        data: addRes,
      }
    } else {
      ctx.body = { type: 'error', message: '文章上传失败！' }
    }
  }
}
export default new ArticleController()
