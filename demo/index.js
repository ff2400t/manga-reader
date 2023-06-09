import { createApp } from 'https://unpkg.com/petite-vue?module'

const reader = document.querySelector('manga-reader');
const controls = document.querySelector('.controls');

reader.pages = Array.from({ length: 9 }).map((_, i) => `/pages/00${i + 1}.jpg`)
reader.handleMiddleClick = () => controls.classList.toggle('open')
reader.preloadNo = 3

reader.addEventListener('pagechange', (e) => console.log(e))

createApp({
  get mode() { return reader.mode },
  set mode(newValue) { reader.mode = newValue },

  get dir() { return reader.dir },
  set dir(newValue) { reader.dir = newValue },

  get scaleType() { return reader.scaleType },
  set scaleType(newValue) { reader.scaleType = newValue },

  get showTouchIndicator() { return reader.showTouchIndicator },
  set showTouchIndicator(newValue) { reader.showTouchIndicator = newValue },

}).mount()
