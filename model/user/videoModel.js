import Video from '../../schema/db/video.js'

class VideoModel {
  // 获取video信息
  async getVideo(video_id) {
    return await Video.findById(video_id)
  }
  // 发布article
  async addVideo(
    user_id,
    channel_id,
    title,
    description,
    video_src,
    cover_src,
    duration,
    ui_style,
    publish_time
  ) {
    const video = {
      channel_id,
      video_id: `${user_id}${Date.now()}`,
      title,
      description,
      duration,
      video_src,
      cover_src,
      publish_time,
      ui_style,
      user_id,
    }
    return Video.create(video)
  }
}
export default new VideoModel()
