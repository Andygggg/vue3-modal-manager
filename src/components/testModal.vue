<template>
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
</style>
