import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, TextField, Button, Box, Snackbar, Tabs, Tab } from '@mui/material';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  description: string;
}
interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  price: number;
  image: string;
  description: string;
}

const Search: React.FC = () => {
  const [tab, setTab] = useState(0);
  // Hotels
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelLocation, setHotelLocation] = useState('');
  // Flights
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  // Booking
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lastBooked, setLastBooked] = useState<{ type: 'hotel' | 'flight'; item: Hotel | Flight | null } | null>(null);

  // Default local data for fallback
  const defaultHotels: Hotel[] = [
    { id: 'h1', name: 'Grand Hotel', location: 'City Center', price: 120, image: '', description: 'A luxury hotel in the city center.' },
    { id: 'h2', name: 'Beach Resort', location: 'Beachside', price: 200, image: '', description: 'Relax by the sea at this beautiful resort.' },
  ];
  const defaultFlights: Flight[] = [
    { id: 'f1', airline: 'AirX', from: 'NYC', to: 'LAX', price: 350, image: '', description: 'Direct flight from NYC to LAX.' },
    { id: 'f2', airline: 'SkyJet', from: 'SFO', to: 'ORD', price: 280, image: '', description: 'Comfortable flight from SFO to Chicago.' },
  ];

  // Fetch hotels
  useEffect(() => {
    fetch(`/api/hotels${hotelLocation ? `?location=${encodeURIComponent(hotelLocation)}` : ''}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setHotels(data);
        else setHotels(defaultHotels.filter(h => !hotelLocation || h.location.toLowerCase().includes(hotelLocation.toLowerCase())));
      })
      .catch(() => setHotels(defaultHotels.filter(h => !hotelLocation || h.location.toLowerCase().includes(hotelLocation.toLowerCase()))));
  }, [hotelLocation]);

  // Fetch flights
  useEffect(() => {
    let url = '/api/flights';
    const params = [];
    if (flightFrom) params.push(`from=${encodeURIComponent(flightFrom)}`);
    if (flightTo) params.push(`to=${encodeURIComponent(flightTo)}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setFlights(data);
        else setFlights(defaultFlights.filter(f => (!flightFrom || f.from.toLowerCase().includes(flightFrom.toLowerCase())) && (!flightTo || f.to.toLowerCase().includes(flightTo.toLowerCase()))));
      })
      .catch(() => setFlights(defaultFlights.filter(f => (!flightFrom || f.from.toLowerCase().includes(flightFrom.toLowerCase())) && (!flightTo || f.to.toLowerCase().includes(flightTo.toLowerCase())))));
  }, [flightFrom, flightTo]);

  const handleBook = (type: 'hotel' | 'flight', itemId: string) => {
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to book.' });
      return;
    }
    // Find the item
    const item = type === 'hotel' ? hotels.find(h => h.id === itemId) : flights.find(f => f.id === itemId);
    if (!item) {
      setSnackbar({ open: true, message: 'Item not found.' });
      return;
    }
    // Store booking in localStorage
    const booking = {
      id: `${type}-${itemId}-${Date.now()}`,
      type,
      item,
      user: 'example@gmail.com',
      date: new Date().toISOString(),
    };
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    setSnackbar({ open: true, message: 'Booking successful!' });
    setLastBooked({ type, item });
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Hotels" />
        <Tab label="Flights" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <TextField
            label="Location"
            value={hotelLocation}
            onChange={e => setHotelLocation(e.target.value)}
            sx={{ mb: 2 }}
          />
          {hotels.length === 0 ? (
            <Typography>No hotels found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {hotels.map(hotel => (
                <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                  <Card>
                    {hotel.image && (
                      <CardMedia component="img" height="140" image={hotel.image} alt={hotel.name} />
                    )}
                    <CardContent>
                      <Typography variant="h6">{hotel.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{hotel.location}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>Price: ${hotel.price}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{hotel.description}</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleBook('hotel', hotel.id)}
                      >
                        Book
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <TextField
            label="From"
            value={flightFrom}
            onChange={e => setFlightFrom(e.target.value)}
            sx={{ mb: 2, mr: 2 }}
          />
          <TextField
            label="To"
            value={flightTo}
            onChange={e => setFlightTo(e.target.value)}
            sx={{ mb: 2 }}
          />
          {flights.length === 0 ? (
            <Typography>No flights found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {flights.map(flight => (
                <Grid item xs={12} sm={6} md={4} key={flight.id}>
                  <Card>
                    {flight.image && (
                      <CardMedia component="img" height="140" image={flight.image} alt={flight.airline} />
                    )}
                    <CardContent>
                      <Typography variant="h6">{flight.airline}</Typography>
                      <Typography variant="body2" color="text.secondary">{flight.from} → {flight.to}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>Price: ${flight.price}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{flight.description}</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleBook('flight', flight.id)}
                      >
                        Book
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
      {lastBooked && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6">Booking confirmed for {lastBooked.type === 'hotel' ? (lastBooked.item as Hotel)?.name : (lastBooked.item as Flight)?.airline}!</Typography>
          <Button variant="outlined" onClick={() => navigate('/reviews', { state: { type: lastBooked.type, itemId: lastBooked.type === 'hotel' ? (lastBooked.item as Hotel)?.id : (lastBooked.item as Flight)?.id } })}>
            Write Review
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Search; 