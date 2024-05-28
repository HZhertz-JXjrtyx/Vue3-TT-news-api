import Router from 'koa-router'
import ChannelController from '../../controller/user/channelController.js'

const router = new Router({ prefix: '/api/channel' })

router.get('/user', ChannelController.getUserChannels)
router.patch('/user', ChannelController.patchUserChannels)

export default router
