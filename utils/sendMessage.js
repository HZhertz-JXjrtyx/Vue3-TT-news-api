import WebSocketServer from '../class/WebSocketServer.js'

// 发送Socket消息-新增通知消息
export async function sendNotifyMessage(newNotification) {
  new WebSocketServer().sendBySocketToUser('notify_message', newNotification.receiver, {
    type: 'success',
    status: 200,
    message: `新的${newNotification.type}通知`,
    data: newNotification,
  })
}

// 发送 Socket 消息-新增对话消息
// 传入 chatMessage 是因为 conversation 中的last_visible_message填充了
// 但是 last_visible_message 中的 user 没有填充
export async function sendChatMessage(senderId, receiverId, conversation, chatMessage) {
  console.log(senderId, receiverId, conversation)
  const sender = conversation.participants.find((p) => String(p.user._id) === senderId)
  const receiver = conversation.participants.find((p) => String(p.user._id) === receiverId)
  console.log(sender, receiver)

  new WebSocketServer().sendBySocketToUser('chat_message', receiverId, {
    type: 'success',
    status: 200,
    message: '新的对话消息',
    data: {
      _id: conversation._id,
      interlocutor: sender.user,
      last_message: chatMessage,
      unread_count: receiver.unread_count,
    },
  })
}
