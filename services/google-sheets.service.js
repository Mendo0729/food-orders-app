const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

function ensureSheetsUrl() {
  if (!sheetsUrl || sheetsUrl.includes('TU_WEB_APP_ID')) {
    throw new Error('Falta GOOGLE_SHEETS_WEB_APP_URL en el archivo .env.');
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Google Sheets no devolvio JSON valido: ${text.slice(0, 120)}`);
  }
}

async function saveOrder(order) {
  ensureSheetsUrl();

  const response = await fetch(sheetsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(order)
  });

  const result = await parseJsonResponse(response);

  if (!response.ok || result.ok === false) {
    throw new Error(result.error || 'No se pudo guardar el pedido en Google Sheets.');
  }

  return result;
}

async function getOrders() {
  ensureSheetsUrl();

  const response = await fetch(sheetsUrl);
  const result = await parseJsonResponse(response);

  if (!response.ok || result.ok === false) {
    throw new Error(result.error || 'No se pudieron cargar los pedidos de Google Sheets.');
  }

  return result.orders || [];
}

module.exports = {
  getOrders,
  saveOrder
};
