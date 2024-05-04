import User from '../../schema/db/users.js'
import Channel from '../../schema/db/channel.js'


class SearchModel {
  // async getResult(offset, pageSize, searchWord) {
  //   // 查询所有包含 searchWord 的文档
  //   const allResults = await News.find({
  //     $or: [
  //       { title: { $regex: searchWord, $options: 'i' } },
  //       { 'article_info.keywords': { $regex: searchWord, $options: 'i' } },
  //       { 'article_info.description': { $regex: searchWord, $options: 'i' } },
  //       { 'article_info.article': { $regex: searchWord, $options: 'i' } }
  //     ]
  //   })

  //   // 筛选出符合要求的文档
  //   const results = allResults.filter((doc) => {
  //     if (doc.title.includes(searchWord)) {
  //       return true
  //     }
  //     if (doc.article_info.keywords.includes(searchWord)) {
  //       return true
  //     }
  //     if (doc.article_info.description.includes(searchWord)) {
  //       return true
  //     }
  //     if (doc.article_info.article.includes(searchWord)) {
  //       return true
  //     }
  //     return false
  //   })

  //   // 根据 offset 和 pageSize 获取部分数据
  //   const paginatedResults = results.slice(offset, offset + pageSize)

  //   return paginatedResults
  // }
}
export default new SearchModel()
