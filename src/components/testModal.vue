<template>
  <Transition name="slide-right-enhanced" appear>
    <div class="profile_box" :id="props.modalId">
      <!-- 標題列 - 用於拖曳整個視窗 -->
      <div class="header_row" :modalDraggableArea="props.modalId">
        <span>title</span>
        <span @click="closeModal" style="cursor: pointer">ｘ</span>
      </div>
     
      <!-- 內容區域 -->
      <div class="content">
        <!-- 您的內容放這裡 -->
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const emit = defineEmits(['closed'])
const props = defineProps({
  modalId: {
    type: String,
    default() {
      return '0'
    },
    required: true,
  },
})

/**關閉modal*/
const closeModal = () => {
  emit('closed')
}
</script>

<style scoped>
.profile_box {
  position: relative; /* 確保相對定位，這對於調整大小很重要 */
  width: 230px;
  height: 370px;
  display: flex;
  flex-direction: column;
  border: 2px solid #237ce0;
  border-radius: 10px;
  background: #000000cb;
  backdrop-filter: blur(10px);
  padding: 1rem;
  box-sizing: border-box; /* 確保邊框和內邊距不會改變元素的實際寬高 */
  box-shadow:
    rgba(0, 0, 0, 0.3) 0px 19px 38px,
    rgba(0, 0, 0, 0.22) 0px 15px 12px;
}

.header_row {
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
}

.content {
  flex-grow: 1;
  width: 100%;
  overflow: auto; /* 內容過多時可滾動 */
}

/* 增強版從右到左的動畫效果 - 帶有縮放和彈性 */
.slide-right-enhanced-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 彈性緩動 */
}

.slide-right-enhanced-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53); /* 快速離開 */
}

.slide-right-enhanced-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.8) rotateY(15deg); /* 從右側、縮小、略微旋轉開始 */
  filter: blur(2px); /* 輕微模糊效果 */
}

.slide-right-enhanced-leave-to {
  opacity: 0;
  transform: translateX(120%) scale(0.9) rotateY(-10deg); /* 向右側、縮小、略微旋轉離開 */
  filter: blur(1px);
}

.slide-right-enhanced-enter-to,
.slide-right-enhanced-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1) rotateY(0deg); /* 正常位置和大小 */
  filter: blur(0px);
}

/* 可選：為不同的動畫狀態添加陰影效果 */
.slide-right-enhanced-enter-active .profile_box {
  box-shadow:
    rgba(35, 124, 224, 0.4) 0px 25px 50px,
    rgba(0, 0, 0, 0.3) 0px 19px 38px,
    rgba(0, 0, 0, 0.22) 0px 15px 12px;
}
</style>