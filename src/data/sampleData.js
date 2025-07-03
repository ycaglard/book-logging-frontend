import authorPhoto from '@/assets/author.jpg'
import bookCover from '@/assets/cover.jpg'

export const authors = [
  {
    id: 'author1',
    name: 'Jane Austen',
    bio: 'English novelist known primarily for her six major novels.',
    birthYear: 1775,
    deathYear: 1817,
    photoUrl: authorPhoto,
  },
  {
    id: 'author2',
    name: 'Mark Twain',
    bio: 'American writer, humorist, entrepreneur, publisher, and lecturer.',
    birthYear: 1835,
    deathYear: 1910,
    photoUrl: authorPhoto,
  },
  {
    id: 'author3',
    name: 'Haruki Murakami',
    bio: 'Japanese writer known for his surreal storytelling.',
    birthYear: 1949,
    photoUrl: authorPhoto,
  },
]

export const reviews = [
  {
    id: 'review1',
    userId: 'user1',
    bookId: 'book1',
    text: 'A timeless classic that beautifully captures human emotions.',
    date: '2025-06-20T10:00:00Z',
  },
  {
    id: 'review2',
    userId: 'user2',
    bookId: 'book2',
    text: 'Hilarious and insightful with unforgettable characters.',
    date: '2025-06-22T15:30:00Z',
  },
  {
    id: 'review3',
    userId: 'user3',
    bookId: 'book3',
    text: 'Magical realism at its finest with deep philosophical themes.',
    date: '2025-06-24T12:45:00Z',
  },
]

export const logs = [
  {
    id: 'log1',
    userId: 'user1',
    bookId: 'book1',
    dateRead: '2025-06-18T00:00:00Z',
    rating: 5,
    reviewId: 'review1',
    review: reviews[0],
  },
  {
    id: 'log2',
    userId: 'user2',
    bookId: 'book2',
    dateRead: '2025-06-20T00:00:00Z',
    rating: 4,
    reviewId: 'review2',
    review: reviews[1],
  },
  {
    id: 'log3',
    userId: 'user3',
    bookId: 'book3',
    dateRead: '2025-06-22T00:00:00Z',
    rating: 4,
    reviewId: 'review3',
    review: reviews[2],
  },
]

export const books = [
  {
    id: 'book1',
    title: 'Pride and Prejudice',
    authors: [authors[0]],
    coverUrl: bookCover,
    pageCount: 432,
    publicationYear: 1813,
    languages: ['en'],
    genres: ['Romance', 'Classic'],
    summary: 'The romantic clash between the opinionated Elizabeth and her proud beau Mr. Darcy.',
    numberOfReads: 500,
    numberOfLogs: 200,
    logs: [logs[0]],
    numberOfReviews: 150,
    reviews: [reviews[0]],
    numberOfRatings: 300,
    averageRating: 4.6,
  },
  {
    id: 'book2',
    title: 'Adventures of Huckleberry Finn',
    authors: [authors[1]],
    coverUrl: bookCover,
    pageCount: 366,
    publicationYear: 1884,
    languages: ['en'],
    genres: ['Adventure', 'Satire'],
    summary:
      'The adventures of a young boy and a runaway slave as they journey down the Mississippi River.',
    numberOfReads: 400,
    numberOfLogs: 160,
    logs: [logs[1]],
    numberOfReviews: 120,
    reviews: [reviews[1]],
    numberOfRatings: 280,
    averageRating: 4.4,
  },
  {
    id: 'book3',
    title: 'Kafka on the Shore',
    authors: [authors[2]],
    coverUrl: bookCover,
    pageCount: 505,
    publicationYear: 2002,
    languages: ['en', 'jp'],
    genres: ['Magical Realism', 'Fantasy'],
    summary:
      'A strange and surreal tale following two separate but connected stories that intertwine.',
    numberOfReads: 350,
    numberOfLogs: 140,
    logs: [logs[2]],
    numberOfReviews: 110,
    reviews: [reviews[2]],
    numberOfRatings: 260,
    averageRating: 4.3,
  },
]

export const lists = [
  {
    id: 1,
    name: 'Summer Reads',
    description: 'Light and fun books to read during summer.',
    userId: 'alice',
    likes: 42,
    comments: 10,
    booksCount: 8,
    books: [
      {
        id: 1,
        coverUrl: bookCover,
        title: 'dummyTitle',
      },
      {
        id: 2,
        coverUrl: bookCover,
        title: 'dummyTitle2',
      },
      {
        id: 3,
        coverUrl: bookCover,
        title: 'dummyTitle3',
      },
      {
        id: 4,
        coverUrl: bookCover,
        title: 'dummyTitle4',
      },
      {
        id: 35,
        coverUrl: bookCover,
        title: 'dummyTitle5',
      },
    ],
    createdAt: '2024-07-01',
  },
  {
    id: 2,
    name: 'Deep Thinkers',
    description: 'Books that make you think.',
    userId: 'bob',
    likes: 75,
    comments: 15,
    booksCount: 5,
    books: [
      {
        id: 1,
        coverUrl: bookCover,
        title: 'dummyTitles',
      },
      {
        id: 2,
        coverUrl: bookCover,
        title: 'dummyTitles2',
      },
      {
        id: 3,
        coverUrl: bookCover,
        title: 'dummyTitles3',
      },
      {
        id: 4,
        coverUrl: bookCover,
        title: 'dummyTitles4',
      },
      {
        id: 35,
        coverUrl: bookCover,
        title: 'dummyTitles5',
      },
    ],
    createdAt: '2024-06-20',
  },
  {
    id: 3,
    name: 'Fantasy Escapes',
    description: 'Lose yourself in another world.',
    userId: 'charlie',
    likes: 55,
    comments: 8,
    booksCount: 12,
    books: [
      {
        id: 1,
        coverUrl: bookCover,
        title: 'dummyTitlee',
      },
      {
        id: 2,
        coverUrl: bookCover,
        title: 'dummyTitlee2',
      },
      {
        id: 3,
        coverUrl: bookCover,
        title: 'dummyTitlee3',
      },
      {
        id: 4,
        coverUrl: bookCover,
        title: 'dummyTitlee4',
      },
      {
        id: 35,
        coverUrl: bookCover,
        title: 'dummyTitlee5',
      },
    ],
    createdAt: '2024-06-28',
  },
  {
    id: 4,
    name: 'Fantasy Escapes',
    description: 'Lose yourself in another world.',
    userId: 'charlie',
    likes: 59,
    comments: 8,
    booksCount: 12,
    books: [
      {
        id: 1,
        coverUrl: bookCover,
        title: 'dummyTitlee',
      },
      {
        id: 2,
        coverUrl: bookCover,
        title: 'dummyTitlee2',
      },
      {
        id: 3,
        coverUrl: bookCover,
        title: 'dummyTitlee3',
      },
      {
        id: 4,
        coverUrl: bookCover,
        title: 'dummyTitlee4',
      },
      {
        id: 35,
        coverUrl: bookCover,
        title: 'dummyTitlee5',
      },
    ],
    createdAt: '2024-06-28',
  },
  {
    id: 5,
    name: 'Fantasy Escapes',
    description: 'Lose yourself in another world.',
    userId: 'charlie',
    likes: 56,
    comments: 9,
    booksCount: 12,
    books: [
      {
        id: 1,
        coverUrl: bookCover,
        title: 'dummyTitlee',
      },
      {
        id: 2,
        coverUrl: bookCover,
        title: 'dummyTitlee2',
      },
      {
        id: 3,
        coverUrl: bookCover,
        title: 'dummyTitlee3',
      },
      {
        id: 4,
        coverUrl: bookCover,
        title: 'dummyTitlee4',
      },
      {
        id: 35,
        coverUrl: bookCover,
        title: 'dummyTitlee5',
      },
    ],
    createdAt: '2024-06-28',
  },
]
