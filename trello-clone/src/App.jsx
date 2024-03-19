import Button from '@mui/material/Button'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import { pink } from '@mui/material/colors'
import ThreeDRotation from '@mui/icons-material/ThreeDRotation'
import HomeIcon from '@mui/icons-material/Home'
import Typography  from '@mui/material/Typography'

function App() {


  return (
    <>
      <div>tinnguyentrung2002</div>
      <Typography variant="body2" color="text.secondary"> Test Typoraphy</Typography>
       
      <Button variant="text" color="success">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <br></br>
      <AccessAlarmIcon/>
      <ThreeDRotation/>
      <HomeIcon />
<HomeIcon color="primary" />
<HomeIcon color="secondary" />
<HomeIcon color="success" />
<HomeIcon color="action" />
<HomeIcon color="disabled" />
<HomeIcon sx={{ color: pink[500] }} />

    </>
  )
}

export default App
