import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/service', serviceRoutes);
app.use('/appointment', appointmentRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🐶 PetShop API rodando em http://localhost:${PORT}`);
});