Page({
  data: {
    title: '',
    priority: 2,
    submitting: false
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  setPriority(e) {
    const priority = e.currentTarget.dataset.priority
    this.setData({ priority: parseInt(priority) })
  },

  async submitTodo() {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'error' })
      return
    }

    if (this.data.submitting) return
    this.setData({ submitting: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'addTodo',
        data: {
          title: this.data.title.trim(),
          priority: this.data.priority
        }
      })
      if (res.result.code === 0) {
        wx.showToast({ title: '添加成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else {
        wx.showToast({ title: '添加失败', icon: 'error' })
      }
    } catch (err) {
      console.error('添加待办失败', err)
      wx.showToast({ title: '添加失败', icon: 'error' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})