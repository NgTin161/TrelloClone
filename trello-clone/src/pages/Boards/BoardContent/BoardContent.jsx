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
  defaultDropAnimationSideEffects,
  closestCorners
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

  //Cùng một thời điểm chỉ có một phần tử đang được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

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
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //Nếu là kéo card thì mới thực hiện ành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
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

    //Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, cond nếu kéo card trong chính column ban đầu 
    //của nó thì không làm gì 
    //Vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác
    // ở { handleDragEnd }
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

        // console.log('isBelowOverItem: ', isBelowOverItem)
        // console.log('modifier: ', modifier)
        // console.log('newCardIndex: ', newCardIndex)

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
        console.log('nextColumns', nextColumns)
        return nextColumns
      })
    }
  }
  //Trigger khi kết thúc 1 phần tử hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event

    //Kiểm tra nếu không tồn tại vị trí cuối trả về return
    if (!over || !over) return

    //Xử lý kéo thả Cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDragginCard là card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over

      //Tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return
      //Phải dùng tới activeDragItemData hoặc oldColumnWhenDraggingCard( set vào State từ bước handleDragStart) chứ không phải
      // activeData trong scope hadnleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị 
      // cậpt nhật một lần rồi
      // console.log('oldeColumnWhenDraggingCard: ', oldColumnWhenDraggingCard)
      // console.log('activeColumn', activeColumn)
      // console.log('overColumn', overColumn)
      //Hành động kéo thả card qua 2 column khác nhau 
      if (activeColumn._id !== overColumn._id) {
        
      } else {
        //Hành động kéo thả card trong cùng 1 column

        //Lấy vị trí cữ ( từ oldColumnWhenDragginCard )
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Lấy vị trí mới (từ over)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        //Dùng arayMove kéo card trong column tương tự như logic kéo column trong 1 board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        console.log( 'dndOrderedCards', dndOrderedCards)
        setOrderedColumns(prevColumns =>{
          // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
        const nextColumns = cloneDeep(prevColumns)

        //Tìm tới Column mà đang thả
        const targetColumn = nextColumns.find(column => column._id === overColumn._id)
        
        //Cập nhật lại 2 giá trj mới là card và cardOrderIs trong cái tagerColumn
        targetColumn.cards = dndOrderedCards
        targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id )
        // console.log('targetColumn', targetColumn)
        //Trả về giá trị state mới (chuẩn vị trí)
        return nextColumns
        })
      }
    }
    //Xử lý kéo Columns
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // console.log('Hành động kéo thả Column - Tạm thời không làm gì cả')
      //Vị trí sau khi kéo thả khác vị trí ban đầu
      if (active.id != over.id) {
        //Lấy vị trí cữ ( từ active )
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // Lấy vị trí mới (từ over)
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        //arayMove để sắp xếp dữ liệu mảng ban đầu
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        //console.log dữ liệu đêr gọi api
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds', dndOrderedColumnsIds)

        //cập nhật lại state ban đầu sau khi kéo thả 
        setOrderedColumns(dndOrderedColumns)
      }
    }

    //Những giá trị sau khi kéo thả phải đưa về giá trị null ban đầu 
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
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
      //Thuật toán phát hiện va chạm
      // Nếu không có thì card có cover sẽ không kéo qua được column với card khác được - bị confilict giữa 
      // card và column ( sử dụng closestCorners thay vi closestCenter )
      collisionDetection={closestCorners}
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
