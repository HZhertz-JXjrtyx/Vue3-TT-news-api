import { v4 as uuidv4 } from 'uuid'
import CommentModel from '../../model/user/commentModel.js'
import UserModel from '../../model/user/userModel.js'
import commentModel from '../../model/user/commentModel.js'

class CommentController {
  // 获取评论列表
  async getCommentsList(ctx) {
    // try {
    const myId = ctx.state.user.id
    const { commentType, relatedId, page, size } = ctx.request.query
    console.log('>>>', myId, commentType, relatedId, page, size)
    const offset = (page - 1) * size
    const docs = await CommentModel.getComments(
      parseInt(commentType),
      relatedId,
      myId,
      offset,
      parseInt(size)
    )
    console.log(docs)
    if (docs.length === 0) {
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
        message: '获取评论列表成功！',
        data: docs,
      }
    }
    // } catch (error) {
    //   ctx.status = 500
    //   ctx.body = {
    //     type: 'error',
    //     status: 500,
    //     message: error,
    //   }
    // }
  }
  // 新增评论
  async addComment(ctx) {
    const myId = ctx.state.user.id
    const my_id = ctx.state.user._id
    const { commentType, replyUser, content, createdTime, parentComment, relatedId } = ctx.request.body
    console.log(my_id, commentType, replyUser, content, createdTime, parentComment, relatedId)

    const addRes = await CommentModel.addComment(
      my_id,
      commentType,
      replyUser,
      content,
      createdTime,
      parentComment,
      relatedId
    )
    console.log(addRes._id)
    const comment_id = addRes._id.toString()
    console.log(comment_id)

    const { _doc: commentInfo } = await CommentModel.findComment(comment_id)
    // console.log(sender, receiverInfo)
    const updUserRes = await CommentModel.updUserComment(myId, comment_id, 'add')
    const updCountRes = await CommentModel.updSourceCount(commentType, relatedId, 1)
    console.log(updUserRes, updCountRes)

    if (commentInfo._id && updUserRes.modifiedCount === 1 && updCountRes.modifiedCount === 1) {
      // addRes.user_info = await CommentModel.findUser(myId)
      commentInfo.islike = false
      if ([1, 2].includes(addRes.comment_type)) {
        commentInfo.replies = []
      }
      console.log(commentInfo)
      ctx.body = {
        type: 'success',
        status: 200,
        message: '评论成功！',
        data: commentInfo,
      }
    } else {
      ctx.body = { type: 'error', message: '评论失败！' }
    }
  }

  //对评论点赞、取消点赞
  async LikeComment(ctx) {
    const myId = ctx.state.user.id
    const { commentId, type } = ctx.request.body
    console.log(commentId, type)
    const isLike = await CommentModel.isLike(myId, commentId)
    console.log(isLike)
    if (type) {
      if (isLike) {
        ctx.body = { type: 'success', status: 200, message: '已对评论点赞！' }
      } else {
        const addRes = await CommentModel.addLike(myId, commentId)
        const updRes = await CommentModel.updLikeCount(commentId, 1)
        console.log(addRes, updRes)
        if (addRes.modifiedCount === 1 && updRes.modifiedCount === 1) {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '对评论点赞成功！',
          }
        } else {
          ctx.body = { type: 'error', message: '对评论点赞失败！' }
        }
      }
    } else {
      if (!isLike) {
        ctx.body = { type: 'success', status: 200, message: '还未对评论点赞！' }
      } else {
        const delRes = await CommentModel.deleteLike(myId, commentId)
        const updRes = await CommentModel.updLikeCount(commentId, -1)
        console.log(delRes)
        if (delRes.modifiedCount === 1 && updRes.modifiedCount === 1) {
          ctx.body = {
            type: 'success',
            status: 200,
            message: '取消对评论点赞成功！',
          }
        } else {
          ctx.body = { type: 'error', message: '取消对评论点赞失败！' }
        }
      }
    }
  }

  // 删除评论
  async deleteComment(ctx) {
    const myId = ctx.state.user.id
    const { commentId, commentType, relatedId } = ctx.request.body
    console.log(commentId, commentType, relatedId)
    const delRes = await CommentModel.deleteComment(commentId)
    const updUserRes = await CommentModel.updUserComment(myId, commentId, 'delete')
    const updCountRes = await CommentModel.updSourceCount(commentType, relatedId, -1)
    console.log(delRes, updUserRes, updCountRes)
    if (delRes.deletedCount === 1 && updUserRes.matchedCount === 1 && updCountRes.matchedCount === 1) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '删除评论成功！',
      }
    } else {
      ctx.body = {
        type: 'error',
        status: 500,
        message: '删除评论失败！',
      }
    }
  }
  // 获取评论详情
  async getCommentDetail(ctx) {
    try {
      const myId = ctx.state.user.id
      const { commentId } = ctx.request.query
      console.log('commentId', commentId)
      const { _doc: commentData } = await commentModel.findComment(commentId)
      console.log(commentData)
      const islike = await commentModel.isLike(myId, commentId)
      commentData.isLike = islike
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取评论详情成功！',
        data: commentData,
      }
    } catch (error) {
      ctx.body = {
        type: 'error',
        message: error,
      }
    }
  }
}
export default new CommentController()
