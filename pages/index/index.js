Page({
  data: {
    todoList: [],
    completedCount: 0,
    loading: true
  },

  onLoad() {
    this.loadTodos()
  },

  onShow() {
    this.loadTodos()
  },

  // 加载待办列表（云函数）
  async loadTodos() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTodos'
      })
      if (res.result.code === 0) {
        const list = res.result.data.map(item => ({
          ...item,
          priorityText: this.getPriorityText(item.priority),
          timeText: this.formatTime(item.createTime)
        }))
        const completedCount = list.filter(item => item.completed).length
        this.setData({ todoList: list, completedCount })
      } else {
        wx.showToast({ title: '加载失败', icon: 'error' })
      }
    } catch (err) {
      console.error('加载待办失败', err)
      wx.showToast({ title: '加载失败', icon: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  getPriorityText(priority) {
    const map = { 1: '低', 2: '中', 3: '高' }
    return map[priority] || '中'
  },

  formatTime(time) {
    if (!time) return ''
    const date = new Date(time)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  },

  // 切换完成状态
  async toggleComplete(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.todoList.find(t => t._id === id)
    if (!item) return

    const newCompleted = !item.completed

    try {
      const res = await wx.cloud.callFunction({
        name: 'updateTodo',
        data: {
          id: id,
          completed: newCompleted
        }
      })
      if (res.result.code === 0) {
        const todoList = this.data.todoList.map(t =>
          t._id === id ? { ...t, completed: newCompleted } : t
        )
        const completedCount = todoList.filter(t => t.completed).length
        this.setData({ todoList, completedCount })
      } else {
        wx.showToast({ title: '操作失败', icon: 'error' })
      }
    } catch (err) {
      console.error('更新状态失败', err)
      wx.showToast({ title: '操作失败', icon: 'error' })
    }
  },

  // 删除待办
  deleteTodo(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定删除吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'deleteTodo',
              data: { id: id }
            })
            if (result.result.code === 0) {
              const todoList = this.data.todoList.filter(t => t._id !== id)
              const completedCount = todoList.filter(t => t.completed).length
              this.setData({ todoList, completedCount })
              wx.showToast({ title: '已删除', icon: 'success' })
            } else {
              wx.showToast({ title: '删除失败', icon: 'error' })
            }
          } catch (err) {
            console.error('删除失败', err)
            wx.showToast({ title: '删除失败', icon: 'error' })
          }
        }
      }
    })
  },

  // 跳转添加页面
  goToAdd() {
    wx.navigateTo({ url: '/pages/add/add' })
  },

  // 跳转大气计算页面
  goToCalc() {
    wx.navigateTo({ url: '/pages/calc/calc' })
  },

  // 跳转汇率转换页面
  goToExchange() {
    wx.navigateTo({ url: '/pages/exchange/exchange' })
  }
})