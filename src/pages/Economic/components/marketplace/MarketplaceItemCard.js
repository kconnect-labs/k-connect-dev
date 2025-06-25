    import React from 'react';
    import { Box, Card, CardContent, Typography, CardActionArea } from '@mui/material';
    import { styled } from '@mui/material/styles';
    import { formatDistance } from 'date-fns';

    const StyledCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.02)',
    },
    }));

    const ItemImage = styled('img')({
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    maxHeight: 200,
    });

    const PriceBadge = styled(Box)({
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '4px 8px',
    borderRadius: 12,
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#fff',
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    });

    const KBallsIcon = styled('img')({
    width: '16px',
    height: '16px',
    marginRight: '2px',
    });

    const MarketplaceItemCard = ({ listing, onClick }) => {
    const { item, price, listed_at, seller_name } = listing;
    const timeAgo = formatDistance(new Date(listed_at), new Date(), { addSuffix: true });

    return (
        <StyledCard>
        <CardActionArea onClick={onClick}>
            <Box sx={{ position: 'relative' }}>
            <ItemImage
                src={item.image_url}
                alt={item.item_name}
                loading="lazy"
            />
            <PriceBadge>
                <KBallsIcon src="/static/icons/KBalls.svg" alt="KBalls" />
                {price}
            </PriceBadge>
            </Box>
            <CardContent>
            <Typography variant="h6" gutterBottom>
                {item.item_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Продавец: {seller_name}
            </Typography>
            </CardContent>
        </CardActionArea>
        </StyledCard>
    );
    };

    export default MarketplaceItemCard; 