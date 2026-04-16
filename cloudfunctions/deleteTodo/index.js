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
  const { id } = event

  try {
    const result = await db.collection('todos')
      .where({
        _id: id,
        _openid: wxContext.OPENID
      })
      .remove()

    if (result.stats.removed > 0) {
      return {
        code: 0,
        data: result.stats,
        message: '删除成功'
      }
    } else {
      return {
        code: -1,
        data: null,
        message: '未找到待办或无权限'
      }
    }
  } catch (err) {
    console.error('删除待办失败', err)
    return {
      code: -1,
      data: null,
      message: '删除失败',
      error: err
    }
  }
}