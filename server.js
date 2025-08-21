// --- Importaciones necesarias ---
import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import cors from 'cors';

// --- Inicialización del servidor ---
const app = express();
const port = process.env.PORT || 3000;

// --- Configuración ---
app.use(express.json()); // Permite al servidor entender JSON
app.use(cors()); // Permite que tu página web se comunique con este servidor

// --- Configuración del cliente de Mercado Pago ---
// El ACCESS_TOKEN se leerá de una variable de entorno segura.
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- Ruta principal para verificar que el servidor funciona ---
app.get('/', (req, res) => {
  res.send('El servidor de Cortala.cl está funcionando correctamente.');
});

// --- RUTA PARA CREAR LA PREFERENCIA DE PAGO ---
app.post('/create_preference', async (req, res) => {
  try {
    const { title, quantity, unit_price } = req.body;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: title,
            quantity: Number(quantity),
            unit_price: Number(unit_price),
            currency_id: 'CLP',
          },
        ],
        // URLs a las que Mercado Pago redirigirá al usuario después del pago.
        back_urls: {
            success: "https://cortala-mvp.onrender.com",
            failure: "https://cortala-mvp.onrender.com",
            pending: "https://cortala-mvp.onrender.com"
        },
        auto_return: "approved", // Regresa automáticamente al sitio si el pago es aprobado.
      },
    });

    console.log('Preferencia creada:', result.id);
    res.json({ id: result.id });

  } catch (error) {
    console.error('Error al crear la preferencia:', error);
    res.status(500).json({ error: 'No se pudo crear la preferencia de pago' });
  }
});

// --- Iniciar el servidor ---
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
