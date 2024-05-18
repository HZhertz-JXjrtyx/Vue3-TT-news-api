import User from '../../schema/db/users.js'
import Channel from '../../schema/db/channel.js'
import Article from '../../schema/db/article.js'
import Video from '../../schema/db/video.js'

import Comment from '../../schema/db/comment.js'

class CommentModel {
  // 获取登录用户信息
  async findUser(my_id) {
    return await User.findOne({ user_id: my_id }, 'user_avatar user_id user_name user_nickname')
  }
  async findComment(_id) {
    return await Comment.findById(_id)
      .populate({
        path: 'user_info',
        select: 'user_id user_nickname user_avatar',
      })
      .populate({
        path: 'reply_user',
        select: 'user_id user_nickname user_avatar',
      })
  }
  // 获取评论列表
  async getComments(comment_type, related_id, user_id, offset, size) {
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
      ...populateArr,
      {
        $addFields: {
          is_like: { $in: [{ $toString: '$_id' }, likeComment] },
        },
      },
    ]

    if ([1, 2].includes(comment_type)) {
      pipeline.unshift({ $match: { comment_type, related_id } })
      pipeline.push({
        $lookup: {
          from: 'comments',
          let: { comment_id: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ['$comment_type', [3, 4]] }, { $eq: ['$related_id', '$$comment_id'] }],
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
      pipeline.unshift({ $match: { comment_type: { $in: [3, 4] }, related_id } })
    }

    return await Comment.aggregate(pipeline)
  }
  // 获取评论详情
  async getCommentDetail(my_id, comment_id) {
    let likeComment = []
    if (my_id !== undefined) {
      const user = await User.findOne({ user_id: my_id })
      if (user) {
        console.log(user)
        likeComment = user.like.comment
      }
    }
    const pipeline = [
      { $match: { comment_id: comment_id } },
      {
        $lookup: {
          from: 'users',
          let: { user_id: '$user_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } },
            { $project: { user_id: 1, user_name: 1, user_nickname: 1, user_avatar: 1 } },
          ],
          as: 'user_info',
        },
      },
      { $unwind: '$user_info' },
      {
        $addFields: {
          is_like: { $in: ['$comment_id', likeComment] },
        },
      },
    ]
    return await Comment.aggregate(pipeline)
  }
  // 新增评论
  async addComment(user_info, comment_type, reply_user, content, created_time, parent_comment, related_id) {
    const newComment = {
      comment_type,
      user_info,
      reply_user,
      content,
      created_time,
      parent_comment,
      related_id,
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
  async updSourceCount(comment_type, related_id, comment_count) {
    if (comment_type === 1) {
      return await Article.updateOne({ article_id: related_id }, { $inc: { comment_count } })
    } else if (comment_type === 2) {
      return await Video.updateOne({ video_id: related_id }, { $inc: { comment_count } })
    } else if (comment_type === 3 || comment_type === 4) {
      await Comment.updateOne({ _id: related_id }, { $inc: { reply_count: comment_count } })
      const comment = await Comment.findById(related_id)
      if (comment.comment_type === 1) {
        return await Article.updateOne({ article_id: comment.related_id }, { $inc: { comment_count } })
      } else if (comment.comment_type === 2) {
        return await Video.updateOne({ video_id: comment.related_id }, { $inc: { comment_count } })
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
