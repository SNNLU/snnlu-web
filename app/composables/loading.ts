export const useLoading = () => useState('loading', () => 0)

/* 原站翻页时左上角转圈 */
export async function loading<T>(task: Promise<T>) {
  const n = useLoading()
  n.value++
  try {
    return await task
  } finally {
    n.value--
  }
}
