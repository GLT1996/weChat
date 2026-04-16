// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { title, priority } = event

  try {
    const result = await db.collection('todos').add({
      data: {
        _openid: wxContext.OPENID,
        title: title,
        priority: priority || 2,
        completed: false,
        createTime: db.serverDate()
      }
    })

    return {
      code: 0,
      data: {
        _id: result._id
      },
      message: '添加成功'
    }
  } catch (err) {
    console.error('添加待办失败', err)
    return {
      code: -1,
      data: null,
      message: '添加失败',
      error: err
    }
  }
}