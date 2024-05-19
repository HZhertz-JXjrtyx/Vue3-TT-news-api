import NewsModel from '../../model/user/newsModel.js'

class NewsController {
  //获取新闻列表
  async getNewsList(ctx) {
    try {
      // const userId = ctx.state.user.id
      const { channelId, page, size } = ctx.request.query
      // console.log(userId, channelId, page, size)
      const offset = (page - 1) * size
      const query = {}
      if (channelId !== '0') {
        query.channel_id = channelId
      }
      const result = await NewsModel.getNews(query, offset, parseInt(size))
      // console.log(result)
      if (result.length === 0) {
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
          message: '获取新闻列表成功！',
          data: result,
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
  // 获取热点列表
  async getHotList(ctx) {
    try {
      const hotList = await NewsModel.getHot()
      console.log(hotList.length)
      if (hotList.length === 0) {
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
          message: '获取热点列表成功！',
          data: hotList,
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
}
export default new NewsController()
