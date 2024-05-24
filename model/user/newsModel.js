import UserModel from './userModel.js'
import Article from '../../schema/db/article.js'
import Video from '../../schema/db/video.js'
import HotList from '../../schema/db/hot_list.js'

class NewsModel {
  // 获取新闻列表
  async getNews(query, offset, pageSize) {
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
  // async getHot() {
  //   return await HotList.find()
  // }
  async getHot() {
    return await HotList.aggregate([
      {
        $lookup: {
          from: 'articles',
          let: { articleId: '$ArticleId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$article_id', '$$articleId'] } } },
            { $project: { _id: 1 } },
          ],
          as: 'article',
        },
      },
      {
        $lookup: {
          from: 'videos',
          let: { videoId: '$VideoId' },
          pipeline: [{ $match: { $expr: { $eq: ['$video_id', '$$videoId'] } } }, { $project: { _id: 1 } }],
          as: 'video',
        },
      },
      {
        $addFields: {
          related_id: {
            $cond: {
              if: { $eq: ['$Type', 'article'] },
              then: { $arrayElemAt: ['$article._id', 0] },
              else: { $arrayElemAt: ['$video._id', 0] },
            },
          },
        },
      },
      {
        $project: {
          article: 0,
          video: 0,
        },
      },
    ])
  }
}
export default new NewsModel()
