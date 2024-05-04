import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, './keys/private.key'))

const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname, './keys/public.key'))

export { PRIVATE_KEY, PUBLIC_KEY }
