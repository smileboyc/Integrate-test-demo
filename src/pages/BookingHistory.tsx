import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

interface Booking {
  id: string;
  type: 'hotel' | 'flight';
  item: any;
  user: string;
  date: string;
}

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = allBookings.filter((b: any) => b.user === 'example@gmail.com');
    setBookings(userBookings);
    setLoading(false);
  }, []);

  if (loading) return <Typography>Loading booking history...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Booking History</Typography>
      {bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {bookings.map(booking => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={booking.id}>
              <Card>
                {booking.type === 'hotel' && booking.item.image && (
                  <CardMedia component="img" height="120" image={booking.item.image} alt={booking.item.name} />
                )}
                {booking.type === 'flight' && booking.item.image && (
                  <CardMedia component="img" height="120" image={booking.item.image} alt={booking.item.airline} />
                )}
                <CardContent>
                  <Typography variant="h6">
                    {booking.type === 'hotel' ? booking.item.name : booking.item.airline}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {booking.type === 'hotel'
                      ? booking.item.location
                      : `${booking.item.from} → ${booking.item.to}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(booking.date).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${booking.item.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BookingHistory; 