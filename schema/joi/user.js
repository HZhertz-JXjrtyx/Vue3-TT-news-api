// 导入定义验证规则的包
import Joi from 'joi'

// 定义验证规则
const id = Joi.number().integer().min(100001).required()
const username = Joi.string()
  .pattern(/(^[A-Za-z0-9]{4,10}$)/)
  .required()
const nickname = Joi.string().alphanum().min(3).max(15).required()
const email = Joi.string().email().required()
const user_pic = Joi.string().required()
const ustatus = Joi.number().valid(0, 1, 2, 3).required()
const privilege = Joi.string()
  .pattern(/^\d+(,\d+)*$/)
  .max(38)
  .required()

// 验证规则对象 - 删除用户信息
export const del_user_schema = Joi.object({
  id: id
})

// 验证规则对象 - 修改用户信息
export const update_user_schema = Joi.object({
  id: id,
  username: username,
  nickname: nickname,
  email: email,
  user_pic: user_pic,
  ustatus: ustatus,
  privilege: privilege
})
// 验证规则对象 - 修改用户权限
export const update_pvg_schema = Joi.object({
  id: id,
  privilege: privilege
})
// 验证规则对象 - 查找用户信息
export const find_user_schema = Joi.object({
  username: username
})

// 验证规则对象 - 修改用户头像
export const update_user_pic_schema = Joi.object({})
