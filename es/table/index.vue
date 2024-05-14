<template>
    <div>
        我是子组件--{{ temp.visible }}
    
    </div>
</template>

<script setup lang="ts">
import { defineProps} from 'vue'

interface Props {
    visible: boolean;
}
let temp = withDefaults(defineProps<Props>(), {
    visible: false,
});
    
    

</script>

<style scoped>

</style>