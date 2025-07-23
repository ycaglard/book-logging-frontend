// Book utility functions
export function cleanBookId(id) {
  if (typeof id === 'string' && id.startsWith('/works/')) id = id.replace('/works/', '');
  if (typeof id === 'string' && id.startsWith('/')) id = id.substring(1);
  return id;
} 

export function getLikedBookIds(userId) {
  const currentUser = useCurrentUser();
  if (!currentUser) return [];

  
  
}
