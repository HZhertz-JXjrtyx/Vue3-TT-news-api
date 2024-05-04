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
  // 获取评论列表
  async getComments(type, id, my_id, offset, size) {
    let likeComment = []
    if (my_id !== undefined) {
      const user = await User.findOne({ user_id: my_id })
      if (user) {
        // console.log(user)
        likeComment = user.like.comment
      }
    }

    const pipelineArr = [
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
    const pipeline = [{ $match: { type: type, source_id: id } }, ...pipelineArr]
    if (type === 3) {
      pipeline.push(
        {
          $lookup: {
            from: 'users',
            let: { reply_user: '$reply_user' },
            pipeline: [
              { $match: { $expr: { $eq: ['$user_id', '$$reply_user'] } } },
              { $project: { user_nickname: 1 } },
            ],
            as: 'reply_user_info',
          },
        },
        { $unwind: { path: '$reply_user_info', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            reply_user_nickname: { $ifNull: ['$reply_user_info.user_nickname', '账户已注销'] },
          },
        },
        { $project: { reply_user_info: 0 } }
      )
    }
    if (type !== 3) {
      pipeline.push({
        $lookup: {
          from: 'comments',
          let: { comment_id: '$comment_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$type', 3] }, { $eq: ['$source_id', '$$comment_id'] }] } } },
            { $sort: { publish_time: -1 } },
            { $limit: 3 },
            {
              $lookup: {
                from: 'users',
                let: { reply_user: '$reply_user' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$user_id', '$$reply_user'] } } },
                  { $project: { user_nickname: 1 } },
                ],
                as: 'reply_user_info',
              },
            },
            { $unwind: { path: '$reply_user_info', preserveNullAndEmptyArrays: true } },
            {
              $addFields: {
                reply_user_nickname: { $ifNull: ['$reply_user_info.user_nickname', '账户已注销'] },
              },
            },
            { $project: { reply_user_info: 0 } },
            ...pipelineArr,
          ],
          as: 'replies',
        },
      })
    }

    pipeline.push({ $skip: offset })
    pipeline.push({ $limit: size })

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
  async addComment(comment_id, user_id, type, source_id, content, publish_time, reply_user) {
    const newComment = {
      comment_id,
      user_id,
      content,
      publish_time,
      type,
      source_id,
      reply_user,
    }
    return await Comment.create(newComment)
  }
  // 删除评论
  async deleteComment(comment_id) {
    return await Comment.deleteOne({ comment_id })
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
  async updSourceCount(type, source_id, comment_count) {
    if (type === 1) {
      return await Article.updateOne({ article_id: source_id }, { $inc: { comment_count } })
    } else if (type === 2) {
      return await Video.updateOne({ video_id: source_id }, { $inc: { comment_count } })
    } else if (type === 3) {
      await Comment.updateOne({ comment_id: source_id }, { $inc: { reply_count: comment_count } })
      const comment = await Comment.findOne({ comment_id: source_id })
      if (comment.type === 1) {
        return await Article.updateOne({ article_id: comment.source_id }, { $inc: { comment_count } })
      } else if (comment.type === 2) {
        return await Video.updateOne({ video_id: comment.source_id }, { $inc: { comment_count } })
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
    return await Comment.updateOne({ comment_id }, { $inc: { like_count } })
  }
}
export default new CommentModel()
