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
  const { id, completed } = event

  try {
    const result = await db.collection('todos')
      .where({
        _id: id,
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          completed: completed,
          updateTime: db.serverDate()
        }
      })

    if (result.stats.updated > 0) {
      return {
        code: 0,
        data: result.stats,
        message: '更新成功'
      }
    } else {
      return {
        code: -1,
        data: null,
        message: '未找到待办或无权限'
      }
    }
  } catch (err) {
    console.error('更新待办失败', err)
    return {
      code: -1,
      data: null,
      message: '更新失败',
      error: err
    }
  }
}