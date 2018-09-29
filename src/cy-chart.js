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