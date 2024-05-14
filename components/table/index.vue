<template>
    <div>
        我是子组件--{{ temp.visible }}
    
    </div>
</template>

<script setup lang="ts">
import { ref, watch , onMounted ,defineProps,reactive,defineExpose} from 'vue'
let test = "3434"
interface Props {
    visible: boolean;
}
let temp = withDefaults(defineProps<Props>(), {
    visible: false,
});
    
    

</script>

<style scoped>

</style>