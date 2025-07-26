import api from '@/api/api.js'
import { cleanBookId } from '@/utils/book.js'

export async function findReviewedList(username) {
  const listsResponse = await api.get('/openlibrary/booklists')
  return listsResponse.data.find(list => list.name === "Books I've Reviewed" && (list.username === username || list.userId === username))
}

export async function addBookToReviewedList(listId, bookId) {
  const cleanId = cleanBookId(bookId)
  await api.post('/openlibrary/booklists/books', {
    bookListId: listId,
    bookIds: [cleanId]
  })
}

export async function removeBookFromReviewedList(listId, bookId) {
  const cleanId = cleanBookId(bookId)
  await api.post('/openlibrary/booklists/books/delete', {
    bookListId: listId,
    bookId: cleanId
  })
}

export async function findOrCreateLikedList(username) {
  const listsResponse = await api.get('/openlibrary/booklists')
  let likedList = listsResponse.data.find(list => list.name === "Books I Liked" && (list.username === username || list.userId === username))
  if (!likedList) {
    // Create the list if it doesn't exist
    const createResponse = await api.post('/openlibrary/booklists', {
      name: "Books I Liked",
      description: "A list of books I've liked.",
      default: false
    })
    likedList = createResponse.data
  }
  return likedList
}

export async function addBookToLikedList(listId, bookId) {
  const cleanId = cleanBookId(bookId)
  await api.post('/openlibrary/booklists/books', {
    bookListId: listId,
    bookIds: [cleanId]
  })
} 