import Box from '@mui/material/Box'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Chip from '@mui/material/Chip'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Button, Tooltip } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { capitalizeFirstLetter } from '~/utils/fomatters'
const menu_style = {
  color:'white',
  bgcolor:'transparent',
  border:'none',
  px:5,
  borderRadius:'4px',
  '.MuiSvgIcon-root':{
    color:'white'
  },
  '&:hover': {
    backgroundColor:'primary.50'
  }
}

function BoardBar({ board }) {
  return (
    <Box sx={{
      width:'100%',
      height:(theme) => theme.trelloCustom.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      overflowX: 'auto',
      borderBottom:'1px solid #e6e6e6',
      px:2,
      bgcolor: ( theme ) => (theme.palette.mode === 'dark') ? '#34495e' : '#1976d2',
      '&::-webkit-scrollbar-track': {
        m:2
      }
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Chip icon={<DashboardIcon />}
          sx={menu_style}
          label={ board?.title }
          clickable
        />
        <Chip icon={<VpnLockIcon />}
          sx={menu_style}
          label={ capitalizeFirstLetter(board?.type) }
          clickable
        />
        <Chip icon={<AddToDriveIcon />}
          sx={menu_style}
          label="Add To GDrive"
          clickable
        />
        <Chip icon={<BoltIcon />}
          sx={menu_style}
          label="Automation"
          clickable
        />
        <Chip icon={<FilterListIcon />}
          sx={menu_style}
          label="Add To GDrive"
          clickable
        />
      </Box>
      {/* Avatar */}
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Button variant="outlined"
          startIcon={<PersonAddIcon/>}
          sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor:'white' } }}
        >
          Invite
        </Button>
        <AvatarGroup max={4} sx={{
          gap: '10px',
          '& .MuiAvatar-root':{
            width: 34,
            height: 34,
            fontSize:14,
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            '&:first-of-type':{ bgcolor: '#a4b0be' }
          }
        }}>
          <Tooltip title='Phat'>
            <Avatar alt="Remy Sharp" src="https://laputafarm.com/wp-content/uploads/2021/12/6222590fa85a62043b4b.jpg"/>
          </Tooltip>
          <Tooltip title='Phat'>
            <Avatar alt="Remy Sharp" src="https://media.istockphoto.com/id/1197121742/vi/anh/ch%C3%BAc-m%E1%BB%ABng-ch%C3%B3-shiba-inu-m%C3%A0u-v%C3%A0ng-ch%C3%A2n-dung-n%E1%BB%A5-c%C6%B0%E1%BB%9Di-ch%C3%B3-nh%E1%BA%ADt-l%C3%B4ng-%C4%91%E1%BB%8F.jpg?s=612x612&w=0&k=20&c=jjwlQxt9vsqcZLocFNAFhe6IQuNCi-t9QFi-vuSM-F0="/>
          </Tooltip>
          <Tooltip title='Phat'>
            <Avatar alt="Remy Sharp" src="https://laputafarm.com/wp-content/uploads/2021/12/6222590fa85a62043b4b.jpg"/>
          </Tooltip>
          <Tooltip title='Phat'>
            <Avatar alt="Remy Sharp" src="https://laputafarm.com/wp-content/uploads/2021/12/6222590fa85a62043b4b.jpg"/>
          </Tooltip>
          <Tooltip title='Phat'>
            <Avatar alt="Remy Sharp" src="https://media.istockphoto.com/id/1197121742/vi/anh/ch%C3%BAc-m%E1%BB%ABng-ch%C3%B3-shiba-inu-m%C3%A0u-v%C3%A0ng-ch%C3%A2n-dung-n%E1%BB%A5-c%C6%B0%E1%BB%9Di-ch%C3%B3-nh%E1%BA%ADt-l%C3%B4ng-%C4%91%E1%BB%8F.jpg?s=612x612&w=0&k=20&c=jjwlQxt9vsqcZLocFNAFhe6IQuNCi-t9QFi-vuSM-F0="/>
          </Tooltip>
          <Tooltip title='Phat'>
            <Avatar alt="Remy Sharp" src="https://laputafarm.com/wp-content/uploads/2021/12/6222590fa85a62043b4b.jpg"/>
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
