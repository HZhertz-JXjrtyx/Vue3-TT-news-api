import SearchModel from '../../model/user/searchModel.js'

class SearchController {
  //获取搜索列表
  // async getSearchResult(ctx) {
  //   let myid = ctx.state.user.id
  //   let Info = ctx.request.query
  //   console.log(myid, Info)
  //   // 获取分页参数
  //   let page = parseInt(Info.page) || 1
  //   let pageSize = parseInt(Info.per_page) || 10
  //   let searchWord = Info.q
  //   // 计算偏移量
  //   let offset = (page - 1) * pageSize
  //   const rows = await SearchModel.getResult(offset, pageSize, searchWord)
  //   console.log(rows.length)
  //   if (rows.length === 0) {
  //     ctx.body = {
  //       type: 'success',
  //       status: 200,
  //       message: '没有搜索到！',
  //       data: []
  //     }
  //   } else {
  //     ctx.body = {
  //       type: 'success',
  //       status: 200,
  //       message: `获取到${rows.length}条数据！`,
  //       data: rows
  //     }
  //   }
  // }
}
export default new SearchController()
