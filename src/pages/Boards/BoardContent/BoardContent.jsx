import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep } from 'lodash'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {

  // Chuột di chuyển 10px mới bắt đầu kéo thả
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay:250, tolerance:10 } })
  // const sensors = useSensors(pointerSensor)

  // Ưu tiên dùng cả 2 loại sensor chuột và cảm ứng để hỗ trợ kéo thả trên cả PC và Mobile
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // cùng một thời điểm chỉ có 1 thằng được kéo thả
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumns(orderedColumns)
  }, [board] )

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    // Nên dùng c.card thay vì c.cardOrderIds vì ở bước handleDragOver sẽ làm dữ liệu cho cards hoàn chỉnh trước rời mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }


  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }

  const handleDragOver = (event) => {
    // console.log('handleDragOver', event)
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Không làm gì cả nếu kéo thả column
      return
    }
    const { active, over } = event
    // Khi kéo thả ra khỏi vùng board thì không làm gì cả( tránh crash app )
    if (!active || !over) return
    // Lấy id và data của thằng đang kéo thả
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là thằng card mà thằng đang kéo thả so với card trên hoac dưới nó
    const { id: overCardId } = over

    // Tìm ra column của thằng đang kéo thả theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    // Tìm ra column của thằng over theo cardId
    const overColumn = findColumnByCardId(overCardId)
    // console.log('active column: ', activeColumn)
    // console.log('over column: ', overColumn)

    // Nếu không tìm thấy column nào thì return
    if ( !activeColumn || !overColumn ) return

    // If dưới chỉ chạy khi kéo thả card qua column khác
    // Đây là đoạn xử lý lúc kéo (handleDragOver), lúc thả xong thi sẽ xử lý ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns(prevColumns => {
        // Tìm vị trí (index) của thằng overCard trong column đích (chỗ activeCard sẽ được thả vào)
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

        // Logic tính toán cardIndex mới (trên hoặc dưới của overCard)
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
                active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0

        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại mảng OrderedColumnsState mới
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

        if (nextActiveColumn) {
          //Xóa card ở column cũ (activeColumn)
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
          // Câp nhật lại cardOrderIds ở column cũ (activeColumn)
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }

        if (nextOverColumn) {
          // Kiểm tra xem card có tồn tại trong column đích (overColumn) không, có thì xóa đi
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
          // Thêm card vào column đích (overColumn) theo index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)
          // Câp nhật lại cardOrderIds ở column cũ (activeColumn)
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }
        
        return nextColumns
      })
    }
  }


  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // console.log('Card drag end')
      return
    }

    const { active, over } = event

    // Nếu không có thằng over thì return (keo thả ra ngoài thi không làm gì cả)
    if (!over) return

    // Nếu vị trí sau khi kéo thả khác vị trí ban đầu
    if (active.id !== over.id) {
      // lấy vị trí cũ của thằng active
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      // lấy vị trí mới của thằng over
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)

      //Dùng arrayMove để sắp xếp lại mảng Columns ban đầu
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log(dndOrderedColumns)
      // console.log(dndOrderedColumnsIds)

      setOrderedColumns(dndOrderedColumns)
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}>
      <Box sx={{
        bgcolor: ( theme ) => (theme.palette.mode === 'dark') ? '#34495e' : '#1976d2',
        width:'100%',
        height:(theme) => theme.trelloCustom.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {( !activeDragItemType && null )}
          {( activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {( activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent