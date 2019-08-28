// 依赖库
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

// 正则匹配
const reg = {
  'PNGs': /.*\.png$/i,
    // 'WEBP': /.*\.webp$/i,
  'GIF': /.*\.gif$/i,
  'MP4': /.*\.mp4$/i
}

// 记录每次操作的文件
var recordPng = []

// 文件深度
var maxDeep = 5
var deep

// store
var items = []

// 获取所有的文件夹
class actionFiles {
  getAllFiles (root) {
        // 拉取文件夹
    if (root.split(deep)[1].split('/').length < maxDeep) {
      let stats = fs.lstatSync(root)
      if (stats.isDirectory()) {
        var files = fs.readdirSync(root)
        files.forEach((file) => {
          var res = [],
            pathname = root + '/' + file,
            stat = fs.lstatSync(pathname)
          if (stat.isDirectory()) {
            res = res.concat(this.getAllFiles(pathname))
          }
          if (stat.isFile()) {
            this.getImageFormat(pathname)
          }
        })
      }
            // 拉取图片
      if (stats.isFile()) {
        this.getImageFormat(root)
      }
    } else {
      alert('最深支持5层~')
    }
  }
  getImageFormat (files) {
    var isApng
    let tempPng = []
    let pathname = path.dirname(files)
    for (var i in reg) {
      if (reg[i].test(files)) {
        if (i == 'PNGs') {
          var buffer = fs.readFileSync(files)
          var byte = buffer.slice(33, 41).toString('ascii')
          if (byte.match('acTL')) {
            this.writeBasic('APNG', pathname, [files])
          } else {
            recordPng.push(files)
          }
        } else {
          this.writeBasic(i, pathname, [files])
        }
      }
    }
  }

  writeBasic (format, address, fileList) {

    let temp = {}
    let globalSetting = JSON.parse(window.localStorage.getItem('globalSetting'))
    temp.basic = {}
    temp.options = globalSetting.options
    //去除文件名空格
    temp.options.outputName = path.basename(fileList[0]).split('.')[0].replace(/[ ]/g,"") + '_'+globalSetting.options.outputSuffix
    temp.basic.type = format
    temp.basic.inputPath = address + '/' + path.basename(fileList[0]).split('.')[0]
    temp.basic.outputPath = address
    temp.basic.fileList = fileList
    items.push(temp)
  }

  writePngBasic (PNGs) {
    // console.warn(PNGs)
    let tempPrefix = {}
    for (var i = 0; i < PNGs.length; i++) {
      let prefixpath = path.dirname(PNGs[i])
      let prefixname = path.basename(PNGs[i]).replace(/\d+\.png$/i, '')
      let prefix = prefixpath + prefixname
      // console.log(path.basename(PNGs[i]))
      if (!tempPrefix[prefix]) {
        tempPrefix[prefix] = []
        tempPrefix[prefix].push(PNGs[i])
      } else {
        tempPrefix[prefix].push(PNGs[i])
      }
      if (i == PNGs.length - 1) {}
    }

    for (var i in tempPrefix) {
      if (tempPrefix[i].length > 1) {
        this.writeBasic('PNGs', path.dirname(tempPrefix[i][0]), tempPrefix[i])
      }
    }
  }
}

// 文件处理
export const f = {

  readerFiles (dir) {
    return new Promise(function (resolve, reject) {
            //
      items = [], recordPng = []

      let operateFiles = new actionFiles()

      for (var i = 0; i < dir.length; i++) {
        if (dir[i].path) {
                    // 拖拽文件夹
          deep = dir[i].path
          operateFiles.getAllFiles(dir[i].path)
        } else {
                    // 选择文件夹
          deep = dir[i]
          operateFiles.getAllFiles(dir[i])
        }
      }

      operateFiles.writePngBasic(recordPng)
      resolve(items)
    })
  },
  basicFIle () {

  }

}
