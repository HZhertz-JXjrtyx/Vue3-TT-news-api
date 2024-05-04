import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// 根据文件内容重命名文件
async function renameFileBasedOnContent(filePath) {
  // 读取文件内容
  const fileBuffer = fs.readFileSync(filePath)

  // 计算文件内容的哈希值
  const hash = crypto.createHash('sha256')
  hash.update(fileBuffer)
  const hashValue = hash.digest('hex')

  // 构造新的文件名
  const ext = path.extname(filePath)
  const newFilename = `${hashValue}${ext}`
  const newFilePath = path.join(path.dirname(filePath), newFilename)

  // 检查是否已存在具有相同哈希值的文件
  if (fs.existsSync(newFilePath)) {
    // 如果存在，删除新上传的文件
    fs.unlinkSync(filePath)
  } else {
    // 如果不存在，重命名文件
    fs.renameSync(filePath, newFilePath)
  }

  return newFilename
}

export default renameFileBasedOnContent
