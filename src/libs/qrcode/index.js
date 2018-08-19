/**
 * 代码来自https://github.com/xkeshi/vue-qrcode/
 * 做了调整
 */
import QRious from 'qrious';

export default {
  name: 'qrcode',

  props: {
    /**
     * The options for the QR code generator.
     * {@link https://github.com/neocotic/qrious#api}
     */
    options: Object,

    /**
     * The tag of the component root element.
     */
    tag: {
      type: String,
      default: 'canvas',
    },

    /**
     * The value of the QR code.
     */
    value: {
      type: null,
      default: '',
    },
    callback:{
      type: Function
    }
  },

  render(createElement) {
    return createElement(this.tag, this.$slots.default);
  },

  watch: {
    /**
     * Update QR code when value change.
     */
    value() {
      this.generate();
    },

    /**
     * Update QR code when options change.
     */
    options() {
      this.generate();
    },
  },

  methods: {
    /**
     * Generate QR code.
     */
    generate() {
      if (this.$el) {
        let qr = new QRious({
          element: this.$el,
          value: String(this.value),
          ...this.options,
        });
        if(this.callback){
          this.callback(qr.toDataURL())
        }
      }
    },
  },

  mounted() {
    this.generate();
  },
};