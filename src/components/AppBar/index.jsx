import { useState } from 'react'
import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as trelloLogo } from '../../assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Profiles from './Menus/Profiles'
import AddIcon from '@mui/icons-material/Add'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
function AppBar() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <Box sx={{
      width:'100%',
      height: (theme) => theme.trelloCustom.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      overflowX: 'auto',
      paddingX: 2,
      bgcolor: ( theme ) => (theme.palette.mode === 'dark') ? '#2c3e50' : '#1565c0'
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <AppsIcon sx={{ color:'white' }}></AppsIcon>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>

          {/* Import SVG icon as React components */}
          <SvgIcon sx={{ color:'white' }} fontSize='small' component={trelloLogo} inheritViewBox />
          <Typography variant='span' sx={{ fontSize:'1.2rem', fontWeight:'bold', color:'white' }}>Trello</Typography>
        </Box>
        <Box sx={{ display:{ xs: 'none', md: 'flex' }, gap: 1 }}>
          <Workspaces/>
          <Recent/>
          <Starred/>
          <Templates/>
          <Button
            sx={{ color: 'white', border: 'none', '&:hover': { border:'none' } }}
            startIcon={<AddIcon/>} variant="outlined">Create</Button>
        </Box>
      </Box>

      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <TextField
          id="outlined-search"
          label="Search"
          type='text'
          size='small'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color:'white' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <CloseIcon sx={{ color:searchValue ? 'white':'transparent', cursor:'pointer', fontSize: 'small' }} onClick = {() => setSearchValue('')}/>
              </InputAdornment>
            )
          }}
          sx={{
            minWidth: '120px',
            maxWidth: '170px',
            '& label': { color: 'white' },
            '& input': { color: 'white' },
            '& label.Mui-focused': { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white'
              },
              '&:hover fieldset': {
                borderColor: 'white'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white'
              }
            }
          }}
        />
        <ModeSelect/>
        <Tooltip title="Notifications">
          <Badge color="warning" variant="dot" sx={{ cursor:'pointer' }}>
            <NotificationsNoneIcon sx={{ color:'white' }} />
          </Badge>
        </Tooltip>
        <Tooltip title="Helps">
          <HelpOutlineIcon sx={{ cursor:'pointer', color:'white' }}/>
        </Tooltip>
        <Profiles/>
      </Box>
    </Box>
  )
}

export default AppBar
