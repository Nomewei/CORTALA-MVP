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
// IMPORTANTE: El ACCESS_TOKEN debe estar configurado como una variable de entorno en Render.
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- Ruta principal para verificar que el servidor funciona ---
app.get('/', (req, res) => {
  res.send('El servidor de Cortala.cl está funcionando correctamente.');
});

// --- RUTA PARA CREAR LA PREFERENCIA DE PAGO (VERSIÓN SEGURA) ---
app.post('/create_preference', async (req, res) => {
  try {
    // 1. RECIBIMOS LOS ITEMS DEL FRONTEND
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'La lista de ítems es inválida.' });
    }

    // 2. DEFINIMOS LOS PRECIOS DE FORMA SEGURA EN EL SERVIDOR
    const prices = {
        'base_service': 14990,
        'extra_protection': 4990
    };

    let totalAmount = 0;
    let description = "Servicio de Privacidad Cortala.cl";

    // 3. CALCULAMOS EL PRECIO TOTAL EN EL SERVIDOR
    items.forEach(itemKey => {
        if (prices[itemKey]) {
            totalAmount += prices[itemKey];
        }
    });

    if (items.includes('extra_protection')) {
        description += " + Protección Extra";
    }

    if (totalAmount === 0) {
        return res.status(400).json({ error: 'No se pudo calcular un total válido.' });
    }

    // 4. CREAMOS LA PREFERENCIA CON EL PRECIO CALCULADO EN EL BACKEND
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: [
          {
            title: description,
            quantity: 1,
            unit_price: totalAmount, // Usamos el precio seguro calculado aquí
            currency_id: 'CLP',
          },
        ],
        back_urls: {
            // IMPORTANTE: Apuntar a tu dominio final
            success: "https://www.cortala.cl", 
            failure: "https://www.cortala.cl",
            pending: "https://www.cortala.cl"
        },
        auto_return: "approved",
      }
    });

    console.log(`Preferencia creada: ${result.id} por un total de $${totalAmount}`);
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
