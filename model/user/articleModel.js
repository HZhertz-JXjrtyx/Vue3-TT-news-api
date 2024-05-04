import Article from '../../schema/db/article.js'
import User from '../../schema/db/users.js'

class ArticleModel {
  // 获取article信息
  async getArticle(article_id) {
    return await Article.findOne({ article_id })
  }
  // 发布article
  async addArticle(user_id, channel_id, title, content, cover_list, image_list, ui_style, publish_time) {
    const article = {
      channel_id,
      article_id: `${user_id}${Date.now()}`,
      title,
      content,
      image_list,
      cover_list,
      publish_time,
      ui_style,
      user_id,
    }
    return Article.create(article)
  }
  // 更新work_count
  async updateWorkcount(user_id) {
    return User.updateOne({ user_id }, { $inc: { works_count: 1 } })
  }
}

export default new ArticleModel()
