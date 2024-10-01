const express = require('express');
const app = express();
const path = require('path');
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const cookieParser = require('cookie-parser');

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.urlencoded({ extended: true }));

// Use routes from the "routes" directory
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
