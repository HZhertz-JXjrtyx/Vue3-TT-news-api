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

// 发送Socket消息-新增对话
export async function sendChat(senderId, receiverId, newConversation) {
  const sender = newConversation.participants.find((p) => String(p.user._id) === senderId)
  const receiver = newConversation.participants.find((p) => String(p.user._id) === receiverId)

  new WebSocketServer().sendBySocketToUser('chat', receiverId, {
    type: 'success',
    status: 200,
    message: '新的对话',
    data: {
      _id: newConversation._id,
      interlocutor: sender.user,
      last_message: receiver.last_visible_message,
      unread_count: receiver.unread_count,
    },
  })
}
// 发送Socket消息-新增对话消息
export async function sendChatMessage(newChatMessage) {
  console.log(newChatMessage)
  new WebSocketServer().sendBySocketToUser('chat_message', newChatMessage.receiver, {
    type: 'success',
    status: 200,
    message: '新的对话消息',
    data: newChatMessage,
  })
}
