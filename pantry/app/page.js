import { Box, Stack, Typography } from '@mui/material';

const item = ['tomato', 'carrots', 'potato', 'ginger', 'carrots', 'potato', 'ginger']; // Remove duplicate

export default function Home() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <Box border={'1px solid #333'}>

         
      <Box width="800px" height="100px" bgcolor={'#800080'} display={'flex'} justifyContent={'center'} alignItems={'center'} border={'1px solid #333'} borderRadius={'2'}>
        <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow={'auto'} borderRadius={'2'}>
        {item.map((i) => (
          <Box
            key={i}
            width="100%"
            height="300px"
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            borderRadius={'2'}
            boxShadow={'1'}
          >
            <Typography
              variant={'h5'}
              color={'#333'}
              textAlign={'center'}
              fontWeight={'bold'}
            >
              {
                // Capitalize 
                i.charAt(0).toUpperCase() + i.slice(1)
              }
            </Typography>
          </Box>
        ))}
      </Stack>
      </Box>
    </Box>
  )
}
