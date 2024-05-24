import VideoModel from '../../model/user/videoModel.js'
import UserModel from '../../model/user/userModel.js'
import MessageModel from '../../model/user/messageModel.js'
import renameFileBasedOnContent from '../../utils/renameFile.js'
import { sendNotifyMessage } from '../../utils/sendMessage.js'

class VideoController {
  //获取video详情
  async getVideoInfo(ctx) {
    try {
      const myId = ctx.state.user.id
      const { videoId } = ctx.request.query
      const { _doc: videoInfo } = await VideoModel.getVideo(videoId)
      const userInfo = await UserModel.getInfo(videoInfo.user_id)
      videoInfo.user_info = userInfo
      if (myId) {
        videoInfo.is_followed = await UserModel.isFollowing(myId, videoInfo.user_id)
        videoInfo.is_liked = await UserModel.isLike(myId, videoId, 'video')
        videoInfo.is_collected = await UserModel.isCollect(myId, videoId, 'video')
      } else {
        videoInfo.is_followed = false
        videoInfo.is_liked = false
        videoInfo.is_collected = false
      }
      if (videoInfo) {
        ctx.status = 200
        ctx.body = {
          type: 'success',
          status: 200,
          message: '获取video信息成功！',
          data: videoInfo,
        }
      } else {
        ctx.status = 404
        ctx.body = {
          type: 'error',
          status: 404,
          message: '获取video信息失败！',
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
  // 收藏、取消收藏 video
  async collectVideo(ctx) {
    const myId = ctx.state.user.id
    const { videoId, type } = ctx.request.body
    const isCollect = await UserModel.isCollect(myId, videoId, 'video')
    // 收藏
    if (type) {
      if (isCollect) {
        ctx.body = { type: 'success', message: '已收藏！' }
      } else {
        const result = await UserModel.addCollect(myId, videoId, 'video')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '收藏视频失败！' }
        } else {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '收藏视频成功！',
          }
        }
      }
    } else {
      if (!isCollect) {
        ctx.body = { type: 'success', message: '未收藏！' }
      } else {
        const result = await UserModel.deleteCollect(myId, videoId, 'video')
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

  // 对 video 点赞、取消点赞
  async likeVideo(ctx) {
    const myId = ctx.state.user.id
    const my_id = ctx.state.user._id
    const { videoId, type } = ctx.request.body
    const isLike = await UserModel.isLike(myId, videoId, 'video')
    if (type) {
      if (isLike) {
        ctx.body = { type: 'success', message: '已对视频点赞！' }
      } else {
        const result = await UserModel.addLike(myId, videoId, 'video')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '对视频点赞失败！' }
        } else {
          const videoInfo = await VideoModel.getVideo(videoId)
          const authorInfo = await UserModel.getInfo(videoInfo.user_id)

          if (my_id !== String(authorInfo._id)) {
            const addNotifyRes = await MessageModel.addNotifyMessage(
              '赞了你的视频',
              my_id,
              authorInfo._id,
              Date.now(),
              'like',
              undefined,
              videoInfo._id,
              'Video',
              videoInfo._id,
              'Video'
            )
            // console.log(addNotifyRes)
            if (addNotifyRes._id) {
              const notificationInfo = await MessageModel.findMessage(addNotifyRes._id)
              await sendNotifyMessage(notificationInfo)
            }
          }

          ctx.body = {
            type: 'success',
            status: 200,
            message: '对视频点赞成功！',
          }
        }
      }
    } else {
      if (!isLike) {
        ctx.body = { type: 'success', message: '还未对视频点赞！' }
      } else {
        const result = await UserModel.deleteLike(myId, videoId, 'video')
        if (result.modifiedCount !== 1) {
          ctx.body = { type: 'error', message: '取消对视频点赞失败！' }
        } else {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '取消对视频点赞成功！',
          }
        }
      }
    }
  }

  // 上传视频
  async uploadVideo(ctx) {
    const newFilename = await renameFileBasedOnContent(ctx.request.file.path)
    const newUrl = 'http://127.0.0.1:3007/videos/' + newFilename
    ctx.body = {
      type: 'success',
      status: 200,
      message: '上传视频成功',
      videoSrc: newUrl,
    }
  }

  // 上传视频封面
  async uploadVideoCover(ctx) {
    const newFilename = await renameFileBasedOnContent(ctx.request.file.path)
    const newUrl = 'http://127.0.0.1:3007/video_images/' + newFilename
    ctx.body = {
      type: 'success',
      status: 200,
      message: '视频封面上传成功',
      videoCoverSrc: newUrl,
    }
  }
  // 发布视频
  async publishVideo(ctx) {
    const myId = ctx.state.user.id
    const { channelId, title, intro, video, coverImage, duration, uiStyle, publishTime } = ctx.request.body
    // console.log(myId, channelId, title, intro, video, coverImage, duration, uiStyle, publishTime)
    const addRes = await VideoModel.addVideo(
      myId,
      channelId,
      title,
      intro,
      video,
      coverImage,
      duration,
      uiStyle,
      publishTime
    )
    const updRes = await UserModel.updateWorkcount(myId)
    // console.log(addRes, updRes)
    if (addRes.video_id && updRes.modifiedCount === 1) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '视频发布成功！',
        data: addRes,
      }
    } else {
      ctx.body = { type: 'error', message: '视频发布失败！' }
    }
  }
}
export default new VideoController()
