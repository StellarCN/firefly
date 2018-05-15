import Vue from 'vue'

Vue.directive('swiper',{

  bind: function(element, binding) {
    let width = 80 //默认左侧移动距离
    let marginLeft = 80 * (binding.value ? binding.value : 2)
    var isTouchMove, startTx, startTy
    element.addEventListener('touchstart', function(e) {
        var touches = e.touches[0]
        startTx = touches.clientX
        startTy = touches.clientY
        isTouchMove = false;
    }, false);
    element.addEventListener('touchmove', function(e) {
        var touches = e.changedTouches[0],
            endTx = touches.clientX,
            endTy = touches.clientY,
            distanceX = startTx - endTx,
            distanceY = startTy - endTy;
        if (distanceX < 0) { //右滑
            if (Math.abs(distanceX) >= Math.abs(distanceY)) {
                if (Math.abs(distanceX) > 20) {
                    element.style.transition = "0.3s"
                    element.style.marginLeft = 0 + "px"
                }
            }
        } else { //左滑
            if (Math.abs(distanceX) >= Math.abs(distanceY)) {
                if (distanceX < marginLeft && distanceX > 20) {
                    e.preventDefault()
                    element.style.transition = "0s"
                    element.style.marginLeft = -distanceX + "px"
                    isTouchMove = true
                }
            }
        }
        // e.preventDefault()
    }, false);
    element.addEventListener('touchend', function(e) {
        if (!isTouchMove) {
            return;
        }
        let allnodes = element.parentNode.parentNode.childNodes
        allnodes.forEach(ele => {
            let item = ele.childNodes[0]
            item.style.transition = "0.3s"
            item.style.marginLeft = '0px'
        })
        var touches = e.changedTouches[0],
            endTx = touches.clientX,
            endTy = touches.clientY,
            distanceX = startTx - endTx,
            distanceY = startTy - endTy,
            isSwipe = false
        if (Math.abs(distanceX) >= Math.abs(distanceY)) {
            if (distanceX < 0) {
                return;
            }
            if (Math.abs(distanceX) < 80) {
                isSwipe = true
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
            } else {
                element.style.transition = "0.3s"
                element.style.marginLeft = "-"+marginLeft + "px"
            }
        }
    }, false);


  }
})