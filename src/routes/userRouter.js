import Router from 'koa-router'

import userController from '../api/userController'

const router = new Router()

router.prefix('/user')

// 用户签到
router.get('/sign', userController.userSign)

// 获取用户信息
router.get('/info', userController.getUserInfo)

// 用户修改基本信息
router.post('/basic', userController.updateInfo)

// 获取用户消息
router.get('/messages', userController.getMessages)

// 获取用户列表
router.post('/list', userController.getUsers)

// 删除用户
router.post('/delete', userController.deleteUser)

// 管理员更新用户信息
router.post('/admin-update', userController.adminUpdateInfo)

// 校验用户名是否存在
router.get('/check-name', userController.checkUserName)

// 校验邮箱是否存在
router.get('/check-email', userController.checkUserEmail)

// 管理员新增用户
router.post('/add', userController.addUser)

export default router