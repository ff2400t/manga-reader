import { createApp } from 'https://unpkg.com/petite-vue?module'

const reader = document.querySelector('manga-reader');
const controls = document.querySelector('.controls');

const saveMode = localStorage.getItem('--mr-mode')
const saveDir = localStorage.getItem('--mr-dir')
const saveScale = localStorage.getItem('--mr-scale')
const savePadding = localStorage.getItem('--mr-padding')
reader.preloadNo = 3;
if (saveMode) {
  reader.mode = saveMode
}
if (saveDir) {
  reader.dir = saveDir
}
if (saveScale) {
  reader.scaleType = saveScale
}
if (savePadding) {
  reader.webtoonPadding = savePadding
}

reader.handleMiddleClick = () => controls.classList.toggle('open');

createApp({
  get mode() { return reader.mode },
  set mode(newValue) {
    reader.mode = newValue
    localStorage.setItem('--mr-mode', newValue)
  },

  get dir() { return reader.dir },
  set dir(newValue) {
    reader.dir = newValue
    localStorage.setItem('--mr-dir', newValue)
  },

  get scaleType() { return reader.scaleType },
  set scaleType(newValue) {
    reader.scaleType = newValue
    localStorage.setItem('--mr-scale', newValue)
  },

  get showTouchIndicator() { return reader.showTouchIndicator },
  set showTouchIndicator(newValue) { reader.showTouchIndicator = newValue },

  get webtoonPadding() { return reader.webtoonPadding },
  set webtoonPadding(newValue) {
    reader.webtoonPadding = newValue
  },

}).mount()
