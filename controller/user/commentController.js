import { v4 as uuidv4 } from 'uuid'
import CommentModel from '../../model/user/commentModel.js'
import UserModel from '../../model/user/userModel.js'
import commentModel from '../../model/user/commentModel.js'

class CommentController {
  //获取评论或评论回复
  async getComments(ctx) {
    try {
      const myId = ctx.state.user.id
      const { type, id, page, size } = ctx.request.query
      // console.log(myId, type, id, page, pageSize)
      const offset = (page - 1) * size
      const docs = await CommentModel.getComments(parseInt(type), id, myId, offset, parseInt(size))
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
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        type: 'error',
        status: 500,
        message: error,
      }
    }
  }
  //对文章或者评论进行评论
  async addComment(ctx) {
    const myId = ctx.state.user.id
    const { type, id, content, replyId, pubTime } = ctx.request.body
    console.log(myId, type, id, content, replyId, pubTime)
    const comment_id = uuidv4()
    const { _doc: addRes } = await CommentModel.addComment(
      comment_id,
      myId,
      type,
      id,
      content,
      pubTime,
      parseInt(replyId)
    )
    const updUserRes = await CommentModel.updUserComment(myId, comment_id, 'add')
    const updCountRes = await CommentModel.updSourceCount(type, id, 1)
    console.log(updUserRes, updCountRes)
    if (addRes.comment_id && updUserRes.modifiedCount === 1 && updCountRes.modifiedCount === 1) {
      addRes.user_info = await CommentModel.findUser(myId)
      addRes.islike = false
      if (addRes.type === 3 && addRes.reply_user !== 0) {
        const docs = await CommentModel.findUser(addRes.reply_user)

        addRes.reply_user_nickname = docs?.user_nickname || '账户已注销'
      } else {
        addRes.replies = []
      }
      ctx.body = {
        type: 'success',
        status: 200,
        message: '评论成功！',
        data: addRes,
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
    const { commentId, type, sourceId } = ctx.request.body
    console.log(commentId, type, sourceId)
    const delRes = await CommentModel.deleteComment(commentId)
    const updUserRes = await CommentModel.updUserComment(myId, commentId, 'delete')
    const updCountRes = await CommentModel.updSourceCount(type, sourceId, -1)
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
    const myId = ctx.state.user.id
    const { commentId } = ctx.request.query
    console.log(commentId)
    const [commentData] = await commentModel.getCommentDetail(myId, commentId)
    if (commentData) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取评论详情成功！',
        data: commentData,
      }
    } else {
      ctx.body = {
        type: 'error',
        message: '获取评论详情失败！',
      }
    }
  }
}
export default new CommentController()
