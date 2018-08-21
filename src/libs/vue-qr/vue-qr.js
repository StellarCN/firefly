const uuidv4 = require('uuid/v4')
import { toBoolean } from './util.js'
let AwesomeQR = require('../awesome-qr/awesome-qr');
export default {
  props: [
    'text',
    'size',
    'margin',
    'colorDark',
    'colorLight',
    'bgSrc',
    'backgroundDimming',
    'logoSrc',
    'logoScale',
    'logoMargin',
    'logoCornerRadius',
    'whiteMargin',
    'dotScale',
    'autoColor',
    'binarize',
    'binarizeThreshold',
    'callback'
  ],
  name: 'vue-qr',
  data() {
    return {
      uuid: '',
    }
  },
  watch: {
    $props: {
      deep: true,
      handler(nextProps) {
        this.main()
      }
    }
  },
  beforeMount() {
    this.uuid = uuidv4()
  },
  mounted() {
    this.main()
  },
  methods: {
    main() {
      const that = this
      if (this.bgSrc && this.logoSrc) {
        const bgImg = new Image()
        const logoImg = new Image()
        bgImg.onload = function() {
          logoImg.onload = function() {
            that.render(bgImg, logoImg)
          }
          logoImg.crossOrigin = 'anonymous'
          logoImg.src = that.logoSrc
        }
        bgImg.crossOrigin = 'anonymous'
        bgImg.src = this.bgSrc
        return
      }
      if (this.bgSrc) {
        const img = new Image()
        img.onload = function() {
          that.render(img)
        }
        img.crossOrigin = 'anonymous'
        img.src = this.bgSrc
        return
      }
      if (this.logoSrc) {
        const img = new Image()
        img.onload = function() {
          that.render(undefined, img)
        }
        img.crossOrigin = 'anonymous'
        img.src = this.logoSrc
        return
      }
      that.render()
    },
    render(img, logoImg) {
      const that = this
      new AwesomeQR().create({
        text: that.text,
        size: that.size || 200,
        margin: that.margin || 20,
        colorDark: that.colorDark || '#000000',
        colorLight: that.colorLight || '#FFFFFF',
        backgroundImage: img,
        backgroundDimming: that.backgroundDimming || 'rgba(0,0,0,0)',
        logoImage: logoImg,
        logoScale: that.logoScale || 0.2,
        logoMargin: that.logoMargin || 6,
        logoCornerRadius: that.logoCornerRadius || 8,
        whiteMargin: false,
        dotScale: that.dotScale || 0.35,
        autoColor: toBoolean(that.autoColor) || true,
        binarize: toBoolean(that.binarize) || false,
        binarizeThreshold: that.binarizeThreshold || 128,
        callback: function(dataURI) {
          //document.getElementById(that.uuid).src = that.arrayBufferToBase64(dataURI)
          that.callback && that.callback(that.arrayBufferToBase64(dataURI))
        },
        bindElement: that.uuid
      })
    },
    arrayBufferToBase64( buffer ) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return  'data:image/png;base64,' + window.btoa( binary );
    }
  }
}
