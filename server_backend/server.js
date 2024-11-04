const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./user'); // Mengimpor file user.js
const adminRoutes = require('./admin');
const superadminRoutes = require('./superadmin');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Berhasil Diakses');
});

// Menggunakan route dari user.js
app.use('/api', userRoutes);
app.use('/admin', adminRoutes);          
app.use('/superadmin', superadminRoutes); 

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});