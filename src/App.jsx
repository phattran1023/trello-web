import Button from '@mui/material/Button'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import ThreeDRotation from '@mui/icons-material/ThreeDRotation'
import  Typography  from '@mui/material/Typography'

function App() {

  return (
    <>
      <div>Hello World</div>
      <Typography variant='body2' color='text.secondary'>Test Typography</Typography>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>

      <br />
      <AccessAlarmIcon />
      <ThreeDRotation />
    </>
  )
}

export default App
