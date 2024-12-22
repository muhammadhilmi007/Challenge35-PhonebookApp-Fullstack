import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(callback, options = {}) {
  const containerRef = ref(null)
  const observer = ref(null)
  
  onMounted(() => {
    observer.value = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
      }
    }, {
      threshold: options.threshold || 0.5,
      root: options.root || null,
      rootMargin: options.rootMargin || '0px'
    })
    
    if (containerRef.value) {
      observer.value.observe(containerRef.value)
    }
  })
  
  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })
  
  return {
    containerRef
  }
}