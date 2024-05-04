import UserModel from './userModel.js'
import Article from '../../schema/db/article.js'
import Video from '../../schema/db/video.js'
import HotList from '../../schema/db/hot_list.js'

class NewsModel {
  // 获取新闻列表
  async getNews(query, offset, pageSize) {
    // const articleDBurl =
    //   'channel_id article_id title type ui_style image_list publish_time article_info.description user_id view_count collect_count comment_count like_count'
    // const videoDBurl =
    //   'channel_id video_id title type ui_style image_src publish_time video_info.description video_info.duration user_id play_count collect_count comment_count like_count'
    const articlesPromise = Article.find(query).sort({ publish_time: -1 }).exec()
    const videosPromise = Video.find(query).sort({ publish_time: -1 }).exec()
    const [articles, videos] = await Promise.all([articlesPromise, videosPromise])

    let result = articles.concat(videos)
    let newResult = await Promise.all(
      result.map(async (item) => {
        const rows = await UserModel.getInfo(item.user_id)
        const data = { ...rows }._doc
        return { ...item._doc, user_info: data }
      })
    )

    // console.log(newResult[0])
    // console.log(newResult.length)
    newResult.sort((a, b) => b.publish_time - a.publish_time)
    // console.log(offset, offset + pageSize)
    newResult = newResult.slice(offset, offset + pageSize)
    // console.log(newResult.length)
    return newResult
  }
  async getHot() {
    return await HotList.find()
  }
}
export default new NewsModel()