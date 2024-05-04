import MessageModel from '../../model/user/messageModel.js'
// import { ChatGPTAPI } from 'chatgpt'
class MessageController {
  // 选择数据
  async chooseData(userId, newsData) {
    // console.log('newsData', newsData)
    const result = await MessageModel.checkInterestModel(userId)
    console.log(userId, 'IM', result)
    // 有兴趣模型
    if (result) {
      // 筛选newsData中符合兴趣模型的
      const filteredData = newsData.filter((item) => {
        const keywords = item.article_info.keywords.split(',')
        return keywords.some((keyword) => result.includes(keyword))
      })
      if (filteredData.length > 0) {
        // 如果筛选后存在符合兴趣模型的，则返回筛选后的数据中take_time值最大的数据
        return filteredData.reduce((prev, curr) => (prev.take_time > curr.take_time ? prev : curr))
      }
    }
    // 无兴趣模型或筛选后没有符合兴趣模型的，则返回newsData中take_time值最大的数据
    return newsData.reduce((prev, curr) => (prev.take_time > curr.take_time ? prev : curr))
  }
  async chooseAtData(userId, newsData) {
    const { followers } = await MessageModel.findUserAt(userId)
    console.log(followers)
    // Filter the newsData array to only include news items where the author_id is included in the user's followers array
    const filteredNewsData = newsData.filter((newsItem) => followers.includes(newsItem.author_info.author_id))
    return filteredNewsData
  }
  //获取消息列表
  async getMessageList(ctx) {
    let myid = ctx.state.user.id
    let Info = ctx.request.query
    // console.log(myid, Info)
    if (Info.authorId === 'mostNews') {
      // 获取最新消息列表
      const rows = await MessageModel.getMostList(myid)
      // console.log(rows)
      const data = await MessageModel.getMostNewsList(rows)
      // console.log(data)
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取最新消息列表成功！',
        data: data,
      }
    } else if (Info.authorId === 'smateNews') {
      console.log('smate')
    } else {
      // 获取最新关注消息列表
      const rows = await MessageModel.getAuthorList(myid, Info.authorId)
      // console.log(rows)
      const data = await MessageModel.getAuthorNewsList(rows)
      // console.log(data)
      ctx.body = {
        type: 'success',
        status: 200,
        message: '获取最新关注消息列表成功！',
        data: data,
      }
    }
  }
  async updateMessageCount(ctx) {
    let myid = ctx.state.user.id
    let Info = ctx.request.body
    console.log('>>>', myid, Info)
    await MessageModel.updateIsRead(myid, Info.author_id)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '更新已读成功！',
    }
  }
  async deleteMessage(ctx) {
    let myid = ctx.state.user.id
    let Info = ctx.request.query
    console.log('<><>', myid, Info)
    const rows = await MessageModel.deleteMesg(myid, Info.type, Info.authorId)
    console.log(rows)
    if (rows) {
      ctx.body = {
        type: 'success',
        status: 200,
        message: '删除消息成功！',
        info: Info,
      }
    }
  }
  // async chat(ctx) {
  //   const apiKey = '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'
  //   const chatGPTApi = new ChatGPTAPI({
  //     apiKey: apiKey
  //   })
  //   console.log(ctx.request.body.msg)
  //   let result = await chatGPTApi.sendMessage(ctx.request.body.msg)
  //   console.log('res==>', result)
  //   console.log(result.text)
  //   // res.send(`${result.text}`)
  // }
}
export default new MessageController()
