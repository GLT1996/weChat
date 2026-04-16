// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 查询当前用户的所有待办事项，按创建时间倒序
    const result = await db.collection('todos')
      .where({
        _openid: wxContext.OPENID
      })
      .orderBy('createTime', 'desc')
      .get()

    return {
      code: 0,
      data: result.data,
      message: '获取成功'
    }
  } catch (err) {
    console.error('获取待办列表失败', err)
    return {
      code: -1,
      data: [],
      message: '获取失败',
      error: err
    }
  }
}