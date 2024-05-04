import User from '../../schema/db/users.js'
import News from '../../schema/db/news.js'

class InterestModel {
  async getUsers(userid) {
    return await User.find({ user_id: userid }, 'browse like collect comment')
  }

  async getAllNews() {
    return await News.find({}, 'article_id article_info.keywords')
  }
  async updateInterest(userId, IM) {
    return await User.updateOne(
      { user_id: userId },
      { $set: { InterestModel: IM } }
    )
  }
  //
  async deleteBrowse(userId, articleId) {
    return await User.updateOne(
      { user_id: userId },
      { $pull: { browse: articleId } }
    )
  }
  async deleteComment(userId, articleId) {
    return await User.updateOne(
      { user_id: userId },
      { $pull: { comment: articleId } }
    )
  }
  async deleteLike(userId, articleId) {
    return await User.updateOne(
      { user_id: userId },
      { $pull: { like: articleId } }
    )
  }
  async deleteCollect(userId, articleId) {
    return await User.updateOne(
      { user_id: userId },
      { $pull: { collect: articleId } }
    )
  }
}

export default new InterestModel()
