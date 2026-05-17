const SHEET_NAME = 'Pedidos';
const HEADERS = [
  'order_id',
  'created_at',
  'customer_name',
  'phone',
  'dish_id',
  'dish',
  'category',
  'quantity',
  'unit_price',
  'subtotal',
  'total'
];

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = HEADERS.some((header, index) => firstRow[index] !== header);

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function doPost(event) {
  try {
    const sheet = getSheet();
    const order = JSON.parse(event.postData.contents);
    const orderId = `ORD-${Date.now()}`;
    const createdAt = order.created_at || new Date().toISOString();
    const rows = order.items.map((item) => [
      orderId,
      createdAt,
      order.customer_name,
      order.phone,
      item.dish_id,
      item.dish,
      item.category,
      item.quantity,
      item.unit_price,
      item.subtotal,
      order.total
    ]);

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    }

    return jsonResponse({ ok: true, order_id: orderId });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function doGet() {
  try {
    const sheet = getSheet();
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1);
    const ordersById = {};

    rows.forEach((row) => {
      const record = HEADERS.reduce((data, header, index) => {
        data[header] = row[index];
        return data;
      }, {});

      if (!record.order_id) {
        return;
      }

      if (!ordersById[record.order_id]) {
        ordersById[record.order_id] = {
          id: record.order_id,
          created_at: record.created_at,
          customer_name: record.customer_name,
          phone: record.phone,
          total: toNumber(record.total) || 0,
          items: []
        };
      }

      ordersById[record.order_id].items.push({
        dish_id: record.dish_id,
        dish: record.dish,
        category: record.category,
        quantity: Number(record.quantity) || 0,
        unit_price: toNumber(record.unit_price),
        subtotal: toNumber(record.subtotal)
      });
    });

    const orders = Object.values(ordersById).sort((left, right) => {
      return new Date(right.created_at) - new Date(left.created_at);
    });

    return jsonResponse({ ok: true, orders });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}
