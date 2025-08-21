// --- NAVEGACIÓN ENTRE PÁGINAS ---
const landingPage = document.getElementById('landing-page');
const formPage = document.getElementById('form-page');
const paymentPage = document.getElementById('payment-page');
const successPage = document.getElementById('success-page');

const startButton = document.getElementById('start-button');
const customerForm = document.getElementById('customer-form');

const backToLandingBtn = document.getElementById('back-to-landing');
const backToFormBtn = document.getElementById('back-to-form');

// --- FUNCIONALIDAD DEL MENÚ ---
const menuButton = document.getElementById('menu-button');
const closeMenuButton = document.getElementById('close-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

menuButton.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
});

closeMenuButton.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
});

// Función para cambiar de vista
function showPage(pageToShow) {
    landingPage.classList.add('hidden');
    formPage.classList.add('hidden');
    paymentPage.classList.add('hidden');
    successPage.classList.add('hidden');
    pageToShow.classList.remove('hidden');
    pageToShow.classList.add('flex');
}

// Event Listeners para la navegación
startButton.addEventListener('click', () => showPage(formPage));
backToLandingBtn.addEventListener('click', () => showPage(landingPage));
backToFormBtn.addEventListener('click', () => showPage(formPage));

// --- MANEJO DEL FORMULARIO Y DATOS ---
let customerData = {};

customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Guardar datos del formulario
    const formData = new FormData(customerForm);
    customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        code: formData.get('code'),
        timestamp: new Date().toISOString()
    };
    
    console.log('Datos del cliente:', customerData);

    // 2. Enviar datos a Google Sheets
    await sendDataToGoogleSheets(customerData);

    // 3. Navegar a la página de pago
    showPage(paymentPage);
    
    // 4. Iniciar el proceso de Mercado Pago
    initializeMercadoPagoCheckout();
});

// --- INTEGRACIÓN CON GOOGLE SHEETS ---
async function sendDataToGoogleSheets(data) {
    // IMPORTANTE: Reemplaza esta URL con la URL de tu Web App de Google Apps Script.
    const googleSheetsUrl = 'URL_DE_TU_GOOGLE_APPS_SCRIPT_AQUI';

    // Muestra un mensaje en la consola para recordar al usuario que configure la URL.
    if (googleSheetsUrl === 'URL_DE_TU_GOOGLE_APPS_SCRIPT_AQUI') {
        console.warn('ADVERTENCIA: Debes configurar la URL de Google Apps Script para que el formulario funcione.');
    }

    try {
        await fetch(googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors', // Importante para evitar errores de CORS con Google Scripts
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        console.log('Datos enviados a Google Sheets correctamente.');
    } catch (error) {
        console.error('Error al enviar datos a Google Sheets:', error);
    }
}

// --- INTEGRACIÓN CON MERCADO PAGO ---
// IMPORTANTE: Reemplaza 'TU_PUBLIC_KEY' con tu clave pública de Mercado Pago.
const mp = new MercadoPago('TU_PUBLIC_KEY', {
    locale: 'es-CL'
});

async function initializeMercadoPagoCheckout() {
    const loadingElement = document.getElementById('loading-payment');
    const walletContainer = document.getElementById('wallet_container');
    walletContainer.innerHTML = ''; // Limpiar contenedor
    loadingElement.classList.remove('hidden');

    try {
        // En una aplicación real, llamarías a tu backend para crear una "preferencia de pago".
        // Tu backend usaría tu CLAVE SECRETA de Mercado Pago para esto.
        const preferenceId = await createPaymentPreference();

        if (!preferenceId) {
            throw new Error('No se pudo obtener el ID de preferencia.');
        }
        
        // Renderizar el botón de pago
        mp.bricks().create("wallet", "wallet_container", {
            initialization: {
                preferenceId: preferenceId,
            },
            callbacks: {
                onReady: () => {
                    loadingElement.classList.add('hidden');
                    console.log('Checkout de Mercado Pago listo.');
                },
                onSubmit: () => {
                    console.log('Pago enviado.');
                },
                onError: (error) => {
                    console.error('Error en checkout de Mercado Pago:', error);
                    // Evita usar alert() en producción
                    walletContainer.innerHTML = "<p class='text-red-500'>Ocurrió un error al procesar el pago.</p>";
                },
            },
        });

    } catch (error) {
        console.error('Error al inicializar Mercado Pago:', error);
        loadingElement.innerText = 'Error al cargar el checkout. Intenta de nuevo.';
    }
}

// Función SIMULADA para crear la preferencia.
// DEBES reemplazar esto con una llamada a tu propio servidor (backend).
async function createPaymentPreference() {
    console.log("Creando preferencia de pago (simulado)...");
    
    // Para este ejemplo, usaremos un ID de preferencia de prueba de la documentación.
    // Es crucial que generes el tuyo desde tu backend para que funcione de verdad.
    return "20596395-f6e1e359-5254-4a5d-a486-5f11bd39b935"; 
}

// --- SIMULACIÓN DE CALLBACK DE PAGO EXITOSO ---
// Mercado Pago te notificará a través de webhooks o redirigirá al usuario a una URL de éxito.
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'approved') {
        showPage(successPage);
        const paymentId = urlParams.get('payment_id');
        console.log(`Pago aprobado: ${paymentId}`);
        sendDataToGoogleSheets({ ...customerData, paymentStatus: 'approved', paymentId: paymentId });
    }
}

// Revisa el estado del pago al cargar la página
window.addEventListener('load', checkPaymentStatus);
