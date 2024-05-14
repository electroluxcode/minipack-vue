import {
  defineComponent,
  onMounted,
} from 'vue';

export default defineComponent({
  compatConfig: { MODE: 3 },
  
  // emits: ['click', 'mousedown'],
  setup(_props, {  expose }) {
    onMounted(()=>{
      console.log("开始挂载")
    });
    expose({
    });

    return () => {
      return <div>你好</div>;
    };
  },
});
