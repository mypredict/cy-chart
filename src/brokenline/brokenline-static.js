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