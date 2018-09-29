# cy-chart
原生的canvas渲染图表库
## 使用教程:
### index.js(引入文件)
1. 首先 ES6 modules 先引入cy-chart.js文件
2. 通过 init 方法初始化一个实例对象
3. setOptions 给实例添加配置项
4. crudData 添加数据(执行这一步时就会对canvas进行渲染)
```
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
```
## 核心模块
### cy-chart.js(用来初始化实例对象)
里面主要就是一个类, 用来创建实例对象
导入 cy-render.js 模块, 当收集好配置和数据时, 将其交付给cy-render.js进行解析
```
import {cyRender} from './cy-render.js'

class NewChart {
  // 基本配置和数据
  // 数据类型分为三种 mapData 和 xData, yData 不能共存
  // mapData 是一一映射的键值对对应 X Y 坐标, 值就是键值对
  // xData 是 X 坐标的数据, 值是一个数组
  // yData 是 Y 坐标的数据, 值是一个对象, 对象中的每个属性都是一个数组
  constructor (cvs) {
    this.cvs = cvs
    this.ctx = cvs.getContext('2d')
    this.data = {
      mapData: {},
      xData: [],
      yData: {}
    }
    this.options = {
      type: 'curveline-move',
      title: '',
      coordinate: {
        coordPlace: ['10%', '10%', '80%', '80%'],
        coordYBegin: true,
        coordXNum: 0
      },
      color: {
        backgroundColor: 'red',
        coordinateColor: '#333',
        fontColor: '#000',
        columnColor: 'blue',
        transLineColor: '#fff',
        lineColor: ['#333']
      }
    }
  }
  // 替换配置
  setOptions (options) {
    const that = this.options
    function resetOptions (that, options) {
      for (let item in options) {
        that[item] !== undefined && (that[item].constructor !== Object ? that[item] = options[item] : resetOptions(that[item], options[item]))
      }
    }
    resetOptions(that, options)
  }
  // 数据提交
  crudData (...handles) {
    // 遍历每一个数据对象, mapData 和 xData, yData 不能共存
    // 每个数据类型都提供两种数据提交方式
    // data类型会直接添加到原有数据之后
    // replaceData类型会将原有数据替换掉
    handles.forEach((crudItem) => {
      let crudType = crudItem.type ? crudItem.type : 'mapData'
      if (crudType === 'mapData') {
        crudItem.data && (this.data.mapData = Object.assign(this.data.mapData, crudItem.data))
        crudItem.replaceData && (this.data.mapData = crudItem.replaceData)
        this.data.xData = []
        this.data.yData = {}
      } else if (crudType === 'xData') {
        crudItem.data && (this.data.xData.push(...crudItem.data))
        crudItem.replaceData && (this.data.xData = crudItem.replaceData)
        this.data.mapData = {}
      } else {
        let crudTarget = crudItem.target
        this.data.yData[crudTarget] === undefined && (this.data.yData[crudTarget] = [])
        crudItem.data && (this.data.yData[crudTarget].push(...crudItem.data))
        crudItem.replaceData && (this.data.yData[crudTarget] = crudItem.replaceData)
        this.data.mapData = {}
      }
    })
    cyRender(this.cvs, this.ctx, this.options, this.data)
  }
}

function init (cvs) {
  cvs.width = cvs.clientWidth
  cvs.height = cvs.clientHeight
  return new NewChart(cvs)
}

export const cyChart = {
  init
}
```
### cy-render.js(用来解析配置和数据)
```
// 坐标位置
function getCoordPlace (cvs, coordPlace) {
  let coordX = typeof coordPlace[0] === 'string' ? cvs.width * parseFloat(coordPlace[0]) / 100 : coordPlace[0]
  let coordY = typeof coordPlace[1] === 'string' ? cvs.height - cvs.height * parseFloat(coordPlace[1]) / 100 : cvs.height - coordPlace[1]
  let coordW = typeof coordPlace[2] === 'string' ? cvs.width * parseFloat(coordPlace[2]) / 100 : coordPlace[2]
  let coordH = typeof coordPlace[3] === 'string' ? cvs.height * parseFloat(coordPlace[3]) / 100 : -coordPlace[3]
  return {coordX, coordY, coordW, coordH}
}

// X 坐标间距和数据
function getXDistance (coordinate, coordW, data) {
  // 间距
  let coordXSpace = 0
  if (coordinate.coordXNum) {
    coordXSpace = coordinate.coordYBegin ? coordW / (coordinate.coordXNum - 1) : coordW / coordinate.coordXNum
  } else if (data.xData.length > 0) {
    coordXSpace = coordinate.coordYBegin ? coordW / (data.xData.length - 1) : coordW / data.xData.length
  } else {
    coordXSpace = coordinate.coordYBegin ? coordW / (Object.values(data.mapData).length - 1) : coordW / Object.values(data.mapData).length
  }
  coordXSpace = parseInt(coordXSpace)
  // 数据
  let dataX = []
  if (data.xData.length > 0) {
    dataX.push(...data.xData)
  } else {
    dataX.push(...(Object.keys(data.mapData)))
  }
  return {coordXSpace, dataX}
}

// Y 坐标间距
function getYDistance (coordinate, coordH, data) {
  let coordYSpace = parseInt(coordH / 5)  // 坐标的实际间隔
  let dataBegin = 0    // 数据最小坐标
  let dataEnd = 0      // 数据最大坐标
  let dataYSpace = 0   // 数据的间隔
  let maxData = 0
  let minData = 0
  // 得到所有数据的最大值和最小值
  if (Object.values(data.mapData).length > 0) {
    let theData = Object.values(data.mapData)
    maxData = Math.max(...theData)
    minData = Math.min(...theData)
  } else {
    let yDataAll = []
    for (let itemYData of Object.values(data.yData)) {
      yDataAll.push(...itemYData)
    }
    maxData = Math.max(...yDataAll)
    minData = Math.min(...yDataAll)
  }
  // 计算间隔和数据 (20以下的数据固定)
  // 其他的计算方案分为 2 种
  if (maxData <= 10) {
    dataYSpace = 2
  } else if (maxData <= 20) {
    dataYSpace = 4
  } else {
    // 重置最大值为整5倍
    let maxStr = String(maxData)
    let compareNum = (maxStr[0] + '5') * (10 ** (maxStr.length - 2))
    if (maxData == maxStr[0] * (10 ** (maxStr.length - 1))) {
      dataEnd = maxData
    } else {
      dataEnd = maxData > compareNum ? compareNum + 5 * (10 ** (maxStr.length - 2)) : compareNum
    }
    // 重置坐标数据最小值 dataBegin
    minData > dataEnd / 5 * 3 && (dataBegin = dataEnd / 5 * 3)
    minData > dataEnd / 5 * 4 && (dataBegin = dataEnd / 5 * 4)
    dataYSpace = (dataEnd - dataBegin) / 5
  }
  return {coordYSpace, dataBegin, dataEnd, dataYSpace}
}

// 数据的纵坐标位置
function dataCoordY (coordH, dataBegin, dataEnd, data) {
  let dataY = []
  if (Object.values(data.mapData).length > 0) {
    let theData = Object.values(data.mapData)
    let mapYData = theData.map((singleData) => {
      return -parseInt((singleData - dataBegin) / (dataEnd - dataBegin) * coordH)
    })
    dataY.push(mapYData)
  } else {
    for (let itemYData of Object.values(data.yData)) {
      let mapYData = itemYData.map((singleData) => {
        return -parseInt((singleData - dataBegin) / (dataEnd - dataBegin) * coordH)
      })
      dataY.push(mapYData)
    }
  }
  return dataY
}

export const cyRender = (cvs, ctx, options, data) => {
  let {coordX, coordY, coordW, coordH} = getCoordPlace(cvs, options.coordinate.coordPlace)
  let {coordXSpace, dataX} = getXDistance(options.coordinate, coordW, data)
  let {coordYSpace, dataBegin, dataEnd, dataYSpace} = getYDistance(options.coordinate, coordH, data)
  let dataY = dataCoordY(coordH, dataBegin, dataEnd, data)
  let coordOptions = {coordX, coordY, coordW, coordH, coordXSpace, coordYSpace}
  let datasOptions = {dataX, dataY, dataBegin, dataYSpace}
  let typeH = options.type.split('-')[0]
  let typeF = options.type.split('-')[1]
  let typeHF = typeH + typeF[0].toUpperCase() + typeF.slice(1)
  // 此处根据初始化配置类型动态引入所需模块(模块所在文件夹命名要规范)
  import(`./${typeH}/${options.type}.js`)
    .then((module) => {
      module[typeHF](ctx, options, coordOptions, datasOptions)
    })
}
```
## 渲染模块(针对不同的样式所需写所需的样式模块)
此处就是一个简单的折线图样式
```
export const brokenlineStatic = function (ctx, options, coordOptions, datasOptions) {
  let {coordX, coordY, coordW, coordH, coordXSpace, coordYSpace} = coordOptions
  let {dataX, dataY, dataBegin, dataYSpace} = datasOptions
  requestAnimationFrame(rendering)
  // 坐标的渲染
  function rendering () {
    ctx.translate(coordX, coordY)
    ctx.moveTo(0, -coordH)
    ctx.lineTo(0, 0)
    ctx.lineTo(coordW, 0)
    // 横坐标
    let dataCoordX = 0
    dataX.forEach((item) => {
      ctx.moveTo(dataCoordX, 0)
      ctx.lineTo(dataCoordX, 5)
      ctx.font = '12px serif'
      ctx.textAlign = 'center'
      ctx.fillText(item, dataCoordX, 20)
      dataCoordX += coordXSpace
    })
    // 纵坐标
    let dataCoordY = 0
    for (let i=0; i<6; i++) {
      ctx.moveTo(0, dataCoordY)
      ctx.lineTo(-5, dataCoordY)
      ctx.font = '12px serif'
      ctx.textBaseline = 'middle'
      ctx.fillText(dataBegin, -20, dataCoordY)
      dataCoordY -= coordYSpace
      dataBegin += dataYSpace
    }
    ctx.stroke()
    // 数据
    dataY.forEach((itemArr, indexArr) => {
      ctx.beginPath()
      ctx.strokeStyle = options.color.lineColor[indexArr]
      let yMapX = 0
      itemArr.forEach((item, index) => {
        index > 0 && (ctx.lineTo(yMapX - 2, item))
        ctx.moveTo(yMapX + 2, item)
        ctx.arc(yMapX, item, 2, 0, Math.PI * 2)
        yMapX += coordXSpace
      })
      ctx.stroke()
    })
  }
}
```
