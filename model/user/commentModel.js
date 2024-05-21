import mongoose from 'mongoose'
import User from '../../schema/db/users.js'
import Channel from '../../schema/db/channel.js'
import Article from '../../schema/db/article.js'
import Video from '../../schema/db/video.js'
import Comment from '../../schema/db/comment.js'

const ObjectId = mongoose.Types.ObjectId

class CommentModel {
  // 获取评论列表
  async getComments(comment_type, related_entity, user_id, offset, size) {
    let likeComment = []
    if (user_id !== undefined) {
      const user = await User.findOne({ user_id })
      if (user) {
        likeComment = user.like.comment
      }
    }
    const populateArr = [
      {
        $lookup: {
          from: 'users',
          let: { user_info: '$user_info' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$user_info'] } } },
            { $project: { user_id: 1, user_nickname: 1, user_avatar: 1 } },
          ],
          as: 'user_info',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { reply_user: '$reply_user' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$reply_user'] } } },
            { $project: { user_id: 1, user_nickname: 1, user_avatar: 1 } },
          ],
          as: 'reply_user',
        },
      },
      {
        $addFields: {
          user_info: { $arrayElemAt: ['$user_info', 0] },
          reply_user: { $arrayElemAt: ['$reply_user', 0] },
        },
      },
    ]

    const pipeline = [
      { $skip: offset },
      { $limit: size },
      { $sort: { created_time: -1 } },
      ...populateArr,
      {
        $addFields: {
          is_like: { $in: [{ $toString: '$_id' }, likeComment] },
        },
      },
    ]

    if ([1, 2].includes(comment_type)) {
      // 聚合管道中，Mongoose 不会自动将查询条件中对应的字符串转换为 ObjectId
      pipeline.unshift({ $match: { comment_type, related_entity: new ObjectId(related_entity) } })
      pipeline.push({
        $lookup: {
          from: 'comments',
          // let: { comment_id: { $toString: '$_id' } },
          let: { comment_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ['$comment_type', [3, 4]] }, { $eq: ['$related_entity', '$$comment_id'] }],
                },
              },
            },
            { $sort: { created_time: -1 } },
            { $limit: 3 },
            ...populateArr,
          ],
          as: 'replies',
        },
      })
    } else {
      pipeline.unshift({
        $match: { comment_type: { $in: [3, 4] }, related_entity: new ObjectId(related_entity) },
      })
    }

    return await Comment.aggregate(pipeline)
  }
  // 获取评论详情
  async getComment(comment_id) {
    return await Comment.findById(comment_id)
      .populate({
        path: 'user_info',
        select: 'user_id user_nickname user_avatar',
      })
      .populate({
        path: 'reply_user',
        select: 'user_id user_nickname user_avatar',
      })
  }

  // 新增评论
  async addComment(
    user_info,
    comment_type,
    reply_user,
    content,
    created_time,
    parent_comment,
    related_entity,
    entity_type,
    related_work,
    work_type
  ) {
    const newComment = {
      comment_type,
      user_info,
      reply_user,
      content,
      created_time,
      parent_comment,
      related_entity,
      entity_type,
      related_work,
      work_type,
    }
    return await Comment.create(newComment)
  }
  // 删除评论
  async deleteComment(comment_id) {
    return await Comment.deleteOne({ _id: comment_id })
  }

  // 更新用户 comment array
  async updUserComment(user_id, comment_id, action) {
    if (action === 'add') {
      // 将comment_id添加到用户的comment数组字段
      return await User.updateOne({ user_id }, { $addToSet: { comment: comment_id } })
    } else if (action === 'delete') {
      // 从用户的comment数组字段中删除comment_id
      return await User.updateOne({ user_id }, { $pull: { comment: comment_id } })
    } else {
      throw new Error('Invalid action')
    }
  }
  //  更新源 comment_count
  async updSourceCount(comment_type, related_entity, comment_count) {
    if (comment_type === 1) {
      return await Article.updateOne({ _id: related_entity }, { $inc: { comment_count } })
    } else if (comment_type === 2) {
      return await Video.updateOne({ _id: related_entity }, { $inc: { comment_count } })
    } else if (comment_type === 3 || comment_type === 4) {
      await Comment.updateOne({ _id: related_entity }, { $inc: { reply_count: comment_count } })
      const comment = await Comment.findById(related_entity)
      if (comment.comment_type === 1) {
        return await Article.updateOne({ _id: comment.related_entity }, { $inc: { comment_count } })
      } else if (comment.comment_type === 2) {
        return await Video.updateOne({ _id: comment.related_entity }, { $inc: { comment_count } })
      }
    }
  }

  // 判断是否已对评论点赞
  async isLike(user_id, comment_id) {
    const user = await User.findOne({ user_id })
    if (user && user.like.comment.includes(comment_id)) {
      return true
    } else {
      return false
    }
  }
  //点赞
  async addLike(user_id, comment_id) {
    return await User.updateOne({ user_id }, { $addToSet: { 'like.comment': comment_id } })
  }
  //取消点赞
  async deleteLike(user_id, comment_id) {
    return await User.updateOne({ user_id }, { $pull: { 'like.comment': comment_id } })
  }
  // 更新like count
  async updLikeCount(comment_id, like_count) {
    return await Comment.updateOne({ _id: comment_id }, { $inc: { like_count } })
  }
}
export default new CommentModel()
