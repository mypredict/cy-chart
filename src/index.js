import {cyChart} from './cy-chart.js'

const cyChartCtx1 = cyChart.init(document.getElementById('chartCvs1'))
cyChartCtx1.setOptions({
  type: 'brokenline-static',
  coordinate: {
    coordPlace: ['10%', '15%', '80%', '70%']
  }
})
cyChartCtx1.crudData({
  data: {
    第一天: 102,
    第二天: 138,
    第三天: 58,
    第四天: 78,
    第五天: 90
  }
})

const cyChartCtx2 = cyChart.init(document.getElementById('chartCvs2'))
cyChartCtx2.setOptions({
  type: 'brokenline-static',
  coordinate: {
    coordPlace: ['10%', '10%', '80%', '80%']
  },
  color: {
    lineColor: ['blue', 'green', 'red']
  }
})
cyChartCtx2.crudData({
  type: 'xData',
  data: ['one', 'two', 'three', 'four', 'five', 'six']
}, {
  type: 'yData',
  target: 'data1',
  data: [400, 700, 800, 1200, 1500, 1800]
}, {
  type: 'yData',
  target: 'data2',
  data: [300, 600, 750, 897, 1789, 400]
}, {
  type: 'yData',
  target: 'data3',
  data: [1345, 1456, 678, 890, 12, 234]
})