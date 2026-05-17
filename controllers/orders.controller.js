const { dishes } = require('../data/menu');
const sheetsService = require('../services/google-sheets.service');

const CATEGORY_ORDER = [
  'Adicional',
  'Comidas Especiales',
  'Bebidas',
  'Tortas',
  'Postres',
  'Paties'
];

const CATEGORY_LABELS = {
  Tortas: 'Dulces / Tortas'
};

function getCategoryRank(group) {
  if (group.dishes.some((dish) => dish.is_main_menu)) {
    return 1;
  }

  const categoryIndex = CATEGORY_ORDER.indexOf(group.name);
  return categoryIndex === -1 ? 99 : categoryIndex + 2;
}

function getActiveDishes() {
  return dishes;
}

function groupDishesByCategory(activeDishes) {
  const groupsByName = new Map();

  activeDishes.forEach((dish) => {
    if (!groupsByName.has(dish.category)) {
      groupsByName.set(dish.category, {
        name: dish.category,
        label: CATEGORY_LABELS[dish.category] || dish.category,
        dishes: []
      });
    }

    groupsByName.get(dish.category).dishes.push(dish);
  });

  return [...groupsByName.values()].sort((left, right) => {
    const rankDifference = getCategoryRank(left) - getCategoryRank(right);
    return rankDifference === 0 ? left.name.localeCompare(right.name, 'es') : rankDifference;
  });
}

function parseQuantities(body) {
  const rawQuantities = body.quantities || {};

  return Object.entries(rawQuantities).reduce((quantities, [dishId, value]) => {
    const normalizedValue = String(value || '').trim();
    const quantity = normalizedValue === '' ? 0 : Number(normalizedValue);
    quantities[dishId] = Number.isNaN(quantity) ? -1 : quantity;
    return quantities;
  }, {});
}

function enforceMainMenuQuantity(quantities, activeDishes) {
  const mainMenu = activeDishes.find((dish) => dish.is_main_menu);

  if (!mainMenu) {
    return quantities;
  }

  if (!Number.isInteger(quantities[mainMenu.id]) || quantities[mainMenu.id] < 1) {
    quantities[mainMenu.id] = 1;
  }

  return quantities;
}

function buildSelectedItems(quantities, activeDishes) {
  const dishesById = new Map(activeDishes.map((dish) => [String(dish.id), dish]));

  return Object.entries(quantities)
    .map(([dishId, quantity]) => {
      const dish = dishesById.get(String(dishId));

      if (!dish || quantity <= 0) {
        return null;
      }

      const unitPrice = dish.price === null ? null : Number(dish.price);
      const subtotal = unitPrice === null ? null : unitPrice * quantity;

      return {
        dish_id: dish.id,
        dish: dish.name,
        category: dish.category,
        quantity,
        unit_price: unitPrice,
        subtotal
      };
    })
    .filter(Boolean);
}

function getOrderTotal(items) {
  return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
}

function hasInvalidQuantity(quantities) {
  return Object.values(quantities).some((quantity) => !Number.isInteger(quantity) || quantity < 0);
}

function renderOrderForm(res, options) {
  const activeDishes = getActiveDishes();

  return res.status(options.status || 200).render('order', {
    title: 'Pedidos afroantillanos',
    dishes: activeDishes,
    dishGroups: groupDishesByCategory(activeDishes),
    error: options.error || null,
    success: options.success || false,
    formData: options.formData || {},
    quantities: enforceMainMenuQuantity(options.quantities || {}, activeDishes)
  });
}

function showOrderForm(req, res) {
  return renderOrderForm(res, {
    success: req.query.success === '1'
  });
}

async function createOrder(req, res, next) {
  const customerName = (req.body.customer_name || '').trim();
  const phone = (req.body.phone || '').trim();
  const activeDishes = getActiveDishes();
  const quantities = enforceMainMenuQuantity(parseQuantities(req.body), activeDishes);
  const selectedItems = buildSelectedItems(quantities, activeDishes);
  const total = getOrderTotal(selectedItems);
  const formData = { customer_name: customerName, phone };

  try {
    if (!customerName || !phone) {
      return renderOrderForm(res, {
        status: 400,
        error: 'Escribe tu nombre y numero celular para continuar.',
        formData,
        quantities
      });
    }

    if (hasInvalidQuantity(quantities)) {
      return renderOrderForm(res, {
        status: 400,
        error: 'Las cantidades deben ser numeros enteros mayores o iguales a 0.',
        formData,
        quantities
      });
    }

    await sheetsService.saveOrder({
      customer_name: customerName,
      phone,
      total,
      created_at: new Date().toISOString(),
      items: selectedItems
    });

    return res.redirect('/pedidos?success=1');
  } catch (error) {
    if (error.message.includes('GOOGLE_SHEETS_WEB_APP_URL')) {
      return renderOrderForm(res, {
        status: 500,
        error: 'Falta configurar Google Sheets para guardar los pedidos.',
        formData,
        quantities
      });
    }

    next(error);
  }
}

module.exports = {
  showOrderForm,
  createOrder
};
