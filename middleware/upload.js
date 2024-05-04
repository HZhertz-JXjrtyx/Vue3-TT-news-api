import multer from '@koa/multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('req.body.folder:', req.body.folder)
    console.log(file)
    cb(null, path.join(__dirname, '../public/', req.body.folder))
  },

  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const imageLimits = {
  fields: 5,
  fileSize: 7 * 1024 * 1024,
  files: 20,
}
const videoLimits = {
  fields: 5,
  fileSize: 100 * 1024 * 1024,
  files: 1,
}

export const imageUpload = multer({ storage: storage, imageLimits })
export const videoUpload = multer({ storage: storage, videoLimits })
