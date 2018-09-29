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
  import(`./${typeH}/${options.type}.js`)
    .then((module) => {
      module[typeHF](ctx, options, coordOptions, datasOptions)
    })
}