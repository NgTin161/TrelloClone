import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'


const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  //Yêu cầu chuôjt di chuyển 10px mới gọi event , fix trường hợp click tại chỗ gọi event
  //Sử dụng PointerSensor phải để CSS touch-action: none ở những phần tử kéo thả nhưng vẫn còn bug
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  //delay 250ms dung sai 500px mới kích hoạt event 
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // const sensors = useSensors(pointerSensor)

  //sử dụng 2 loại sensor này để có trải nghiệm mobile tốt nhất 
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  //Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    //Đoạn này lưu ý nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ 
    // làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }
  //Trigger khi bắt đầu kéo 1 phần tử hành động kéo (drag)
  const handleDragStart = (event) => {
    console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }
  // Trigger trong quá trình kéo (drag) một phần tử
  const handleDragOver = (event) => {

    //Không làm gì thêm nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //Còn nếu kéo card thì xử lý thêm để còn xử lý kéo thả card giữa các column
    // console.log('handleDragOver', event)
    const { active, over } = event

    //Kiểm tra nếu không tồn tại over ( kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    //Cần đảm báo nếu không tồn tại active hoặ over( khi kéo ra khỏi phạm vi container thì không làm gì
    //(tránh crash trang)
    if (!over || !over) return

    //activeDragginCard là card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id: overCardId } = over

    //Tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)
    // console.log('activeColumn: ', activeColumn)
    // console.log('overColumn: ', overColumn)

    //Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns(prevColumns => {
        // Tìm vị trí (index) overCard trong column đihcs ( nơi mà activeCard sắp được thả)
        const overCardIndex = overColumn?.cards.findIndex(card => card._id === overCardId)
        // console.log ('overCardIndex ', overCardIndex)

        //logic tính toán "cardIndex mới" ( trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        console.log('isBelowOverItem: ', isBelowOverItem)
        console.log('modifier: ', modifier)
        console.log('newCardIndex: ', newCardIndex)

        // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
        // Column cũ
        if (nextActiveColumn) {
          // Xóa card ở column active ( cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
          //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }
        //Column mới
        if (nextOverColumn) {
          //Kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardData)

          // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDragItemData)

          //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }
        console.log('nextColumns' , nextColumns)
        return nextColumns
      })
    }
  }
  //Trigger khi kết thúc 1 phần tử hành động thả (drop)
  const handleDragEnd = (event) => {
    console.log('handleDragEnd', event)

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // console.log('Hành động kéo thả Card - Tạm thời không làm gì cả')
       return
    }
    const { active, over } = event

    //Kiểm tra nếu không tồn tại vị trí cuối trả về return 
    if (!over || !over) return

    //Vị trí sau khi kéo thả khác vị trí ban đầu 
    if (active.id != over.id) {
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)

      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      //arayMove để sắp xếp dữ liệu mảng ban đầu 
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      //console.log dữ liệu đêr gọi api
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log('dndOrderedColumns', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds', dndOrderedColumnsIds)

      //cập nhật lại state ban đầu sau khi kéo thả 
      setOrderedColumns(dndOrderedColumns)
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }

  // console.log('activeDragItemId', activeDragItemId)
  // console.log('handleDragItemType', activeDragItemType)
  // console.log('handleDragItemData', activeDragItemData)


  //Animation khi thả drop phần tử -test bằng cach kéo xong thả trực tiếp và nhìn phần giữ chỗ Overplay
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
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2 '),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
