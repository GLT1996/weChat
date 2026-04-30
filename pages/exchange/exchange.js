Page({
  data: {
    currencies: [
      { code: 'CNY', name: '人民币' },
      { code: 'USD', name: '美元' },
      { code: 'EUR', name: '欧元' },
      { code: 'GBP', name: '英镑' },
      { code: 'JPY', name: '日元' },
      { code: 'AUD', name: '澳元' },
      { code: 'CAD', name: '加元' },
      { code: 'HKD', name: '港币' },
      { code: 'KRW', name: '韩元' },
      { code: 'THB', name: '泰铢' },
      { code: 'SGD', name: '新加坡元' },
      { code: 'NZD', name: '新西兰元' },
      { code: 'INR', name: '印度卢比' },
      { code: 'CHF', name: '瑞士法郎' },
      { code: 'RUB', name: '俄罗斯卢布' }
    ],
    quickCurrencies: [
      { code: 'CNY' },
      { code: 'USD' },
      { code: 'EUR' },
      { code: 'GBP' },
      { code: 'JPY' },
      { code: 'AUD' },
      { code: 'CAD' },
      { code: 'HKD' }
    ],
    fromIndex: 0,
    toIndex: 1,
    fromCurrency: 'CNY',
    fromName: '人民币',
    toCurrency: 'USD',
    toName: '美元',
    amount: '',
    result: '',
    rate: '',
    updateTime: '',
    showResult: false
  },

  onFromChange(e) {
    const index = e.detail.value
    const currency = this.data.currencies[index]
    this.setData({
      fromIndex: index,
      fromCurrency: currency.code,
      fromName: currency.name,
      showResult: false
    })
  },

  onToChange(e) {
    const index = e.detail.value
    const currency = this.data.currencies[index]
    this.setData({
      toIndex: index,
      toCurrency: currency.code,
      toName: currency.name,
      showResult: false
    })
  },

  onAmountInput(e) {
    this.setData({
      amount: e.detail.value,
      showResult: false
    })
  },

  swapCurrency() {
    const { fromIndex, toIndex, fromCurrency, fromName, toCurrency, toName } = this.data
    this.setData({
      fromIndex: toIndex,
      toIndex: fromIndex,
      fromCurrency: toCurrency,
      fromName: toName,
      toCurrency: fromCurrency,
      toName: fromName,
      showResult: false
    })
  },

  quickSelect(e) {
    const code = e.currentTarget.dataset.code
    const index = this.data.currencies.findIndex(c => c.code === code)
    if (index !== -1) {
      const currency = this.data.currencies[index]
      this.setData({
        fromIndex: index,
        fromCurrency: currency.code,
        fromName: currency.name,
        showResult: false
      })
    }
  },

  async convert() {
    const { fromCurrency, toCurrency, amount } = this.data

    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }

    wx.showLoading({ title: '获取汇率...' })

    try {
      const res = await wx.request({
        url: `https://open.er-api.com/v6/latest/${fromCurrency}`,
        method: 'GET'
      })

      wx.hideLoading()

      if (res.data && res.data.result === 'success') {
        const rate = res.data.rates[toCurrency]
        if (!rate) {
          wx.showToast({ title: '不支持该币种', icon: 'none' })
          return
        }

        const result = (parseFloat(amount) * rate).toFixed(2)
        const updateTime = this.formatTime(res.data.time_last_update_utc)

        this.setData({
          result,
          rate: rate.toFixed(4),
          updateTime,
          showResult: true
        })
      } else {
        wx.showToast({ title: '获取汇率失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('获取汇率失败', err)
      wx.showToast({ title: '网络请求失败', icon: 'none' })
    }
  },

  formatTime(timeStr) {
    if (!timeStr) return ''
    // "Mon, 13 Nov 2023 00:00:00 +0000" -> "2023-11-13"
    const match = timeStr.match(/\d{1,2}\s(\w{3})\s(\d{4})/)
    if (match) {
      const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }
      const day = timeStr.match(/\d{1,2}/)[0].padStart(2, '0')
      return `${match[2]}-${months[match[1]]}-${day}`
    }
    return timeStr
  }
})