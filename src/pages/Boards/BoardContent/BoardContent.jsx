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
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  closestCenter
} from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/fomatters'
const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {

  // Chuột di chuyển 10px mới bắt đầu kéo thả
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay:200, tolerance:6 } })
  // const sensors = useSensors(pointerSensor)

  // Ưu tiên dùng cả 2 loại sensor chuột và cảm ứng để hỗ trợ kéo thả trên cả PC và Mobile
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // cùng một thời điểm chỉ có 1 thằng được kéo thả
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Lưu lại id của thằng over cuối cùng
  const lastOverId = useRef(null)

  useEffect(() => {
    const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumns(orderedColumns)
  }, [board] )

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    // Nên dùng c.card thay vì c.cardOrderIds vì ở bước handleDragOver sẽ làm dữ liệu cho cards hoàn chỉnh trước rời mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Function chung xử lý việc update state khi di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
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

      // nextActiveColumn : column cũ
      if (nextActiveColumn) {
        //Xóa card ở column cũ (activeColumn)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // Them placeholder  nếu column cũ rỗng
        if (isEmpty(nextActiveColumn.cards)) {
          console.log('card cuoi cung bi keo di', nextActiveColumn.title)
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // Câp nhật lại cardOrderIds ở column cũ (activeColumn)
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      // nextOverColumn : column đích
      if (nextOverColumn) {
        // Kiểm tra xem card có tồn tại trong column đích (overColumn) không, có thì xóa đi
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // Cập nhật lại columnId của card đang kéo thả
        const rebuild_activeDraggingCardData = { ...activeDraggingCardData, columnId: overColumn._id }
        // Thêm card vào column đích (overColumn) theo index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Xóa placeholder nếu có
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
        // Câp nhật lại cardOrderIds ở column cũ (activeColumn)
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      //Nếu là kéo card thì lưu lại column cũ của card đó
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
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


    // Nếu không tìm thấy column nào thì return
    if ( !activeColumn || !overColumn ) return

    // If dưới chỉ chạy khi kéo thả card qua column khác
    // Đây là đoạn xử lý lúc kéo (handleDragOver), lúc thả xong thi sẽ xử lý ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }


  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event

    // Nếu không có thằng over thì return (keo thả ra ngoài thi không làm gì cả)
    if (!over) return

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const { active, over } = event

      // Lấy id và data của thằng đang kéo thả
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là thằng card mà thằng đang kéo thả so với card trên hoac dưới nó
      const { id: overCardId } = over

      // Tìm ra column của thằng đang kéo thả theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      // Tìm ra column của thằng over theo cardId
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tìm thấy column nào thì return
      if ( !activeColumn || !overColumn ) return

      // Hành động kéo thả card qua column khác
      // Phải dùng activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set state từ handleDragStart) thay vì activeData
      //trong handleDragEnd vì sau khi đi qua handleDragOver thì activeData sẽ bị thay đổi

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // Hành động kéo thả card trong cùng 1 column
        // lấy vị trí cũ của thằng oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // lấy vị trí mới của thằng overColumn
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        // Dùng arrayMove vì kéo card trong cùng 1 column giống như kéo column
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
          // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại mảng OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm column chuẩn bị thả card vào
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại cardOrderIds ở column đích
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)
          return nextColumns
        })
      }
    }

    // Xu ly khi keo tha column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác vị trí ban đầu
      if (active.id !== over.id) {
        // lấy vị trí cũ của thằng active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // lấy vị trí mới của thằng over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)

        //Dùng arrayMove để sắp xếp lại mảng Columns ban đầu
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log(dndOrderedColumns)
        // console.log(dndOrderedColumnsIds)

        setOrderedColumns(dndOrderedColumns)
      }
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
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
  //Custom lại thuật toán xử lý va chạm giữa các card khi kéo thả
  const collisionDetectionStrategy = useCallback((args) => {

    //Truong hợp kéo thả column thì sẽ dùng thuật toán closestCorners
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    // Tìm các điểm giao nhau giữa thằng đang kéo thả và các thằng khác
    const pointerIntersections = pointerWithin(args)

    //
    const intersections = !!pointerIntersections?.length ? pointerIntersections : rectIntersection(args)
    let overId = getFirstCollision(intersections, 'id')
    if (overId) {
      // Nếu over là column thì sẽ tìm đến cái cardId gần nhất bên trong khu vực va chạm
      //dựa vào thuật toán closestCenter or closestCorners đều ok
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        //console.log('overId before', overId)
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && ( checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId after', overId)
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      sensors={sensors}
      // Thuật toán xử lý va chạm giữa các card khi kéo thả
      // Chỉ dùng closestCorners sẽ bị bug flicker + sai dữ liệu khi kéo thả card giữa các column khác nhau
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}

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