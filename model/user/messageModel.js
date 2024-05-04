import User from '../../schema/db/users.js'

class MessageModel {
  async checkInterestModel(userId) {
    const user = await User.findOne({ user_id: userId })
    if (user && user.InterestModel) {
      // InterestModel不为空，返回其值
      return user.InterestModel
    } else {
      // InterestModel为空
      return false
    }
  }
  async getMostList(myid) {
    const user = await User.findOne({ user_id: myid })
    const message = user.messagelist.find((item) => item.messagetype === 'mostNews')
    if (message) {
      const notReadCount = message.not_read_count
      const messageNews = message.message_news
      let result
      if (notReadCount > 3) {
        result = messageNews.slice(-notReadCount)
      } else {
        result = messageNews.slice(-3)
      }
      return result
    }
  }
  async getMostNewsList(rows) {
    // const result = await Promise.all(
    //   rows.map(async (row) => {
    //     const news = await News.findOne({ article_id: row.news_id })
    //     if (news) {
    //       const newsObject = news.toObject()
    //       newsObject.send_time = row.send_time
    //       return newsObject
    //     }
    //   })
    // )
    // return result
  }
  async getAuthorList(myid, authorId) {
    const user = await User.findOne({ user_id: myid })
    const message = user.messagelist.find(
      (item) => item.messagetype === 'authorNews' && item.author_info.author_id === authorId
    )
    if (message) {
      const notReadCount = message.not_read_count
      const messageNews = message.message_news
      let result
      if (notReadCount > 3) {
        result = messageNews.slice(-notReadCount)
      } else {
        result = messageNews.slice(-3)
      }
      return result
    }
  }
  async getAuthorNewsList(rows) {
    // const result = await Promise.all(
    //   rows.map(async (row) => {
    //     const news = await News.findOne({ article_id: row.news_id })
    //     if (news) {
    //       const newsObject = news.toObject()
    //       newsObject.send_time = row.send_time
    //       return newsObject
    //     }
    //   })
    // )
    // return result
  }
  //更新最新消息列表
  // async updateMessageList(userId, sendTime, newData) {
  //   const filter = { user_id: userId }
  //   const update = {
  //     $push: {
  //       'messagelist.$[message].message_news': {
  //         news_id: newData.article_id,
  //         send_time: sendTime
  //       }
  //     },
  //     $set: {
  //       'messagelist.$[message].last_send_time': sendTime,
  //       'messagelist.$[message].last_description':
  //         newData.article_info.description,
  //       'messagelist.$[message].not_read_count': message.not_read_count + 1
  //     }
  //   }
  //   const options = { arrayFilters: [{ 'message.messagetype': 'mostNews' }] }

  //   await User.findOneAndUpdate(filter, update, options)
  // }
  async updateMessageList(userId, sendTime, newData) {
    const user = await User.findOne({ user_id: userId })
    if (user) {
      let message = user.messagelist.find((item) => item.messagetype === 'mostNews')
      if (message) {
        message.message_news.push({
          news_id: newData.article_id,
          send_time: sendTime,
        })
        message.last_send_time = sendTime
        message.last_description = newData.article_info.description
        message.not_read_count += 1
      } else {
        user.messagelist.push({
          messagetype: 'mostNews',
          last_description: newData.article_info.description,
          last_send_time: sendTime,
          not_read_count: 1,
          smate_info: {},
          most_info: {
            avatar_url:
              'https://sf6-cdn-tos.toutiaostatic.com/img/user-avatar/48d3c59f11acc281a70b6f81fd311004~300x300.image',
            name: '新闻推送',
          },
          author_info: {},
          message_news: [
            {
              news_id: newData.article_id,
              send_time: sendTime,
            },
          ],
        })
      }
      await user.save()
    }
  }
  async findUserAt(userId) {
    return User.findOne({ user_id: userId }, 'followers -_id')
  }
  async updateAttMessage(userId, sendTime, atData) {
    // 根据 userId 查找用户文档
    const user = await User.findOne({ user_id: userId })
    // 遍历 atData 数组中的每一项
    for (const item of atData) {
      // 在用户的 messagelist 数组中查找 messagetype 为 'authorNews' 且 author_info.author_id 等于 item.author_info.author_id 的消息的索引
      const messageIndex = user.messagelist.findIndex(
        (message) =>
          message.messagetype === 'authorNews' && message.author_info.author_id === item.author_info.author_id
      )
      if (messageIndex !== -1) {
        // 如果找到了消息，则更新其值并在其 message_news 数组中添加一项新数据
        const message = user.messagelist[messageIndex]
        message.message_news.push({
          news_id: item.article_id,
          send_time: sendTime,
        })
        message.last_description = item.article_info.description
        message.last_send_time = sendTime
        message.not_read_count += 1
      } else {
        // 如果没有找到消息，则在用户的 messagelist 数组中添加一条新消息
        user.messagelist.push({
          messagetype: 'authorNews',
          last_description: item.article_info.description,
          last_send_time: sendTime,
          not_read_count: 1,
          author_info: {
            author_id: item.author_info.author_id,
            avatar_url: item.author_info.avatar_url,
            name: item.author_info.name,
          },
          message_news: [{ news_id: item.article_id, send_time: sendTime }],
        })
      }
    }
    // 保存更新后的用户文档
    await user.save()
  }
  // 更新已读
  async updateIsRead(userId, authorId) {
    let messageType
    if (authorId === 'mostNews') {
      messageType = 'mostNews'
    } else if (authorId === 'smateNews') {
      messageType = 'smateNews'
    }

    if (messageType) {
      // Update messagelist items with the specified messagetype
      await User.updateOne(
        { user_id: userId },
        { $set: { 'messagelist.$[item].not_read_count': 0 } },
        { arrayFilters: [{ 'item.messagetype': messageType }] }
      )
    } else {
      // Update messagelist items with the specified author_id
      await User.updateOne(
        { user_id: userId },
        { $set: { 'messagelist.$[item].not_read_count': 0 } },
        { arrayFilters: [{ 'item.author_info.author_id': authorId }] }
      )
    }
  }
  async deleteMesg(userId, type, authorId) {
    // find the user document by userId
    const user = await User.findOne({ user_id: userId })

    // check if the user document was found
    if (user) {
      // filter the messagelist array based on the provided type and authorId
      user.messagelist = user.messagelist.filter((item) => {
        if (type === 'mostNews' && item.messagetype === 'mostNews') {
          return false
        } else if (type === 'smateNews' && item.messagetype === 'smateNews') {
          return false
        } else if (type === 'authorNews' && item.author_info && item.author_info.author_id === authorId) {
          return false
        } else {
          return true
        }
      })

      // save the updated user document
      await user.save()

      // return true to indicate success
      return true
    }

    // return false to indicate failure
    return false
  }
}
export default new MessageModel()
