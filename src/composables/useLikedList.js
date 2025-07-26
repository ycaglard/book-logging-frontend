import { ref } from 'vue'
import api from '@/api/api.js'
import { cleanBookId } from '@/utils/book.js'

export function useLikedList(username) {
  const likedBookIds = ref(new Set())
  const loading = ref(false)
  const error = ref(null)

  async function fetchLikedList() {
    loading.value = true
    error.value = null
    try {
      const listsResponse = await api.get('/openlibrary/booklists')
      const list = listsResponse.data.find(list => list.name === "Books I Liked" && (list.username === username || list.userId === username))
      if (list && list.books) {
        console.log('Books in liked list:', list.books)
        likedBookIds.value = new Set(list.books.map(b => cleanBookId(b.bookId || b.isbn || b.id)))
        console.log('Liked book IDs after cleaning:', Array.from(likedBookIds.value))
      } else {
        likedBookIds.value = new Set()
      }
    } catch (err) {
      error.value = err
      likedBookIds.value = new Set()
    } finally {
      loading.value = false
    }
  }

  function isBookLiked(bookId) {
    return likedBookIds.value.has(cleanBookId(bookId))
  }

  return {
    likedBookIds,
    loading,
    error,
    fetchLikedList,
    isBookLiked
  }
}
