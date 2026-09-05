export function formatMediaItem(media: any) {
  if (!media) return media;
  return {
    ...media,
    url: `/api/media/${media.id}/stream`,
  };
}

export function formatMediaList(mediaList: any[] | undefined | null) {
  if (!Array.isArray(mediaList)) return mediaList;
  return mediaList.map(formatMediaItem);
}

export function getBookCoverUrl(book: { id: string; coverImage?: string | null }): string | null {
  if (!book || !book.coverImage) return book?.coverImage || null;
  const img = book.coverImage;
  if (img.includes('vercel-storage.com') || img.startsWith('/uploads/')) {
    return `/api/books/${book.id}/cover`;
  }
  return img;
}

export function formatLesson(lesson: any) {
  if (!lesson) return lesson;
  return {
    ...lesson,
    media: formatMediaList(lesson.media),
  };
}

export function formatBook(book: any) {
  if (!book) return book;
  const coverUrl = getBookCoverUrl(book);
  return {
    ...book,
    coverImage: coverUrl || book.coverImage,
    thumbnail: coverUrl || book.thumbnail,
    lessons: Array.isArray(book.lessons) ? book.lessons.map(formatLesson) : book.lessons,
  };
}
