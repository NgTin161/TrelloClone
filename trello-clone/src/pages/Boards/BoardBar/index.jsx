import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const MENU_STYLE = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root':{
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar() {
  return (
    <Box sx={{ 
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingX: 2,
      gap: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2 ' ),
      borderBottom: '1px solid white'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx = {MENU_STYLE}
          icon={<DashboardIcon />}
          label="zztinnguyenzz"
          clickable
        />
        <Chip
          sx = {MENU_STYLE}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx = {MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx = {MENU_STYLE}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx = {MENU_STYLE}
          icon={<FilterListIcon />}
          label="Automation"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx ={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>
        <AvatarGroup max={3}
          sx = {{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: 16,
              border: 'none'
            }
          }}
        >
          <Tooltip title="zztinnguyenzz">
            <Avatar
              alt="zztinnguyenzz"
              src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/428600225_2503879639820760_6609521754103213029_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_ohc=ZXLtg1mCpggAX_6DZVR&_nc_ht=scontent.fsgn8-4.fna&oh=00_AfAtxG9GUeiX5QnP28rxE9So_fvy68bvaCXcSbamr0ppAA&oe=66003BC9" />
          </Tooltip>
          <Tooltip title="zztinnguyenzz">
            <Avatar
              alt="zztinnguyenzz"
              src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/428600225_2503879639820760_6609521754103213029_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_ohc=ZXLtg1mCpggAX_6DZVR&_nc_ht=scontent.fsgn8-4.fna&oh=00_AfAtxG9GUeiX5QnP28rxE9So_fvy68bvaCXcSbamr0ppAA&oe=66003BC9" />
          </Tooltip>
          <Tooltip title="zztinnguyenzz">
            <Avatar
              alt="zztinnguyenzz"
              src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/428600225_2503879639820760_6609521754103213029_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_ohc=ZXLtg1mCpggAX_6DZVR&_nc_ht=scontent.fsgn8-4.fna&oh=00_AfAtxG9GUeiX5QnP28rxE9So_fvy68bvaCXcSbamr0ppAA&oe=66003BC9" />
          </Tooltip>
          <Tooltip title="zztinnguyenzz">
            <Avatar
              alt="zztinnguyenzz"
              src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/428600225_2503879639820760_6609521754103213029_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_ohc=ZXLtg1mCpggAX_6DZVR&_nc_ht=scontent.fsgn8-4.fna&oh=00_AfAtxG9GUeiX5QnP28rxE9So_fvy68bvaCXcSbamr0ppAA&oe=66003BC9" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
