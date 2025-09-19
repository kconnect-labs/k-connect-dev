import {
  Grid,
  Zoom,
  Card,
  Box,
  CardContent,
  Typography,
  Tooltip,
} from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';

function ArtistCard({ artist, index, onClick }) {
  return (
    <Grid item xs={6} sm={4} md={3} lg={2}>
      <Zoom in={true} style={{ transitionDelay: `${150 * (index % 8)}ms` }}>
        <Card
          sx={{
            borderRadius: '16px',
            cursor: 'pointer',
                backgroundColor: 'var(--theme-background, rgba(18,18,18,0.6))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={onClick}
        >
          <Box
            sx={{
              width: '100%',
              paddingTop: '100%',
              position: 'relative',
              borderRadius: '16px 16px 0 0',
              overflow: 'hidden',
            }}
          >
            <Box
              component='img'
              src={
                artist.avatar_url ||
                '/static/uploads/system/artist_placeholder.jpg'
              }
              alt={artist.name}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>
          <CardContent sx={{ p: 1.5, pb: 2, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant='body1'
                fontWeight='500'
                noWrap
                sx={{ flexGrow: 1, color: '#fff' }}
              >
                {artist.name}
              </Typography>
              {artist.verified && (
                <Tooltip title='Верифицированный артист'>
                  <VerifiedUser
                    sx={{
                      fontSize: 16,
                      ml: 0.5,
                      color: '#D0BCFF',
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    </Grid>
  );
}

export { ArtistCard };
