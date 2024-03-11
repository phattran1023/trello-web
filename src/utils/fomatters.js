export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}
// Phía FE sẽ tự động tạo thêm 1 card đặc biệt: Placeholdẻ Card, ko liên quan đến BE
//Card này sẽ ẩn ở FE
//Cấu trúc Id card này để unique : "columnId-placeholder-card" (mỗi column sẽ có 1 card placeholder riêng)
// Quan trọng phải tạo đủ (_id, boardId, columnId, FE_PlaceholderCard: true)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}