// This file contains all your shop's menu data.
// It now ALSO includes the recipe for each item.

export const menuData = {
  // All prices are 10.00
  addons: [
    { id: 'pearl', name: 'Pearl', price: 10.00, recipe: { "toppings/pearl": 1 } },
    { id: 'fruit-jelly', name: 'Fruit Jelly', price: 10.00, recipe: { "toppings/fruit-jelly": 1 } },
    { id: 'nata', name: 'Nata', price: 10.00, recipe: { "toppings/nata": 1 } },
    { id: 'coffee-jelly', name: 'Coffee Jelly', price: 10.00, recipe: { "toppings/coffee-jelly": 1 } },
    { id: 'creamcheese', name: 'Creamcheese', price: 10.00, recipe: { "toppings/creamcheese": 1 } },
    { id: 'crushed-oreo', name: 'Crushed Oreo', price: 10.00, recipe: { "toppings/crushed-oreo": 1 } },
    { id: 'crushed-graham', name: 'Crushed Graham', price: 10.00, recipe: { "toppings/crushed-graham": 1 } },
    { id: 'coffee-shot', name: 'Coffee Shot', price: 10.00, recipe: { "toppings/coffee-shot": 1 } },
  ],
  // Options that don't change the price
  options: {
    sugar: [
      '100% Full Sugar',
      '75% Normal',
      '50% Half Sugar',
      '25% Less Sugar',
      '0% Zero Sugar',
    ],
    ice: [
      'Normal Ice',
      'Less Ice',
      'No Ice'
    ],
  },
  // All your product categories
  categories: [
    {
      id: 'milktea',
      name: 'Milk Tea',
      // All Milk Teas use sealing film and boba straws
      products: [
        { id: 'mt-wintermelon', name: 'Wintermelon', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-okinawa', name: 'Okinawa', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-salted-caramel', name: 'Salted Caramel', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-matcha', name: 'Matcha', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-cheesecake', name: 'Cheesecake', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-taro', name: 'Taro', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-cookies-cream', name: 'Cookies & Cream', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-caramel-macchiato', name: 'Caramel Macchiato', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-cappuccino', name: 'Cappuccino', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-mocha', name: 'Mocha', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-dark-choco', name: 'Dark Choco', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-double-dutch', name: 'Double Dutch', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-rocky-road', name: 'Rocky Road', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-choco-kisses', name: 'Choco Kisses', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-black-forest', name: 'Black Forest', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-red-velvet', name: 'Red Velvet', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-hazelnut', name: 'Hazelnut', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-milky-choco', name: 'Milky Choco', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-avocado', name: 'Avocado', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-buko-pandan', name: 'Buko Pandan', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-melon', name: 'Melon', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-strawberry', name: 'Strawberry', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-ube', name: 'Ube', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'mt-mango', name: 'Mango', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'fruit-tea',
      name: 'Fruit Tea',
      // All Fruit Teas use sealing film and boba straws
      products: [
        { id: 'ft-lemonade', name: 'Lemonade', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-black-tea-lemon', name: 'Black Tea Lemon', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-lychee', name: 'Lychee', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-green-apple', name: 'Green Apple', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-strawberry', name: 'Strawberry', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-blueberry', name: 'Blueberry', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-kiwi', name: 'Kiwi', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-grapes', name: 'Grapes', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-passion-fruit', name: 'Passion Fruit', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ft-mango', name: 'Mango', prices: { medium: 28.00, large: 38.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'soda',
      name: 'Soda Series',
      // All Sodas use sealing film and boba straws
      products: [
        { id: 'soda-lemonade', name: 'Lemonade', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-lychee', name: 'Lychee', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-green-apple', name: 'Green Apple', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-strawberry', name: 'Strawberry', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-kiwi', name: 'Kiwi', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-blueberry', name: 'Blueberry', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-passion-fruit', name: 'Passion Fruit', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-mango', name: 'Mango', prices: { medium: 50.00, large: 60.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'soda-coke-float', name: 'Coke Float', prices: { medium: 40.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } }, // Only one size
      ],
    },
    {
      id: 'milk-series',
      name: 'Milk Series',
      // All Milk Series use sealing film and boba straws
      products: [
        { id: 'ms-strawberry', name: 'Strawberry', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-blueberry', name: 'Blueberry', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-mango', name: 'Mango', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-ube', name: 'Ube', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-dark-choco', name: 'Dark Choco', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-double-dutch', name: 'Double Dutch', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-rocky-road', name: 'Rocky Road', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-choco-kisses', name: 'Choco Kisses', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-black-forest', name: 'Black Forest', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-red-velvet', name: 'Red Velvet', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-hazelnut', name: 'Hazelnut', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-milky-choco', name: 'Milky Choco', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-wintermelon', name: 'Wintermelon', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-okinawa', name: 'Okinawa', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-salted-caramel', name: 'Salted Caramel', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-matcha', name: 'Matcha', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-cheesecake', name: 'Cheesecake', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-taro', name: 'Taro', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-cookies-cream', name: 'Cookies & Cream', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'ms-mocha', name: 'Mocha', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'frappe',
      name: 'Frappe',
      // ** ASSUMPTION: Frappes use DOME LIDS and Boba Straws. Change "consumables/dome-lid" if incorrect! **
      products: [
        { id: 'f-wintermelon', name: 'Wintermelon', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-okinawa', name: 'Okinawa', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-salted-caramel', name: 'Salted Caramel', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-matcha', name: 'Matcha', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-cheesecake', name: 'Cheesecake', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-taro', name: 'Taro', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-cookies-cream', name: 'Cookies & Cream', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-caramel-macchiato', name: 'Caramel Macchiato', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-cappuccino', name: 'Cappuccino', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-mocha', name: 'Mocha', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-ube', name: 'Ube', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-melon', name: 'Melon', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-avocado', name: 'Avocado', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-buko-pandan', name: 'Buko Pandan', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-strawberry', name: 'Strawberry', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-blueberry', name: 'Blueberry', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-mango-graham', name: 'Mango Graham', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-dark-choco', name: 'Dark Choco', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-double-dutch', name: 'Double Dutch', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-choco-kisses', name: 'Choco Kisses', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-black-forest', name: 'Black Forest', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-red-velvet', name: 'Red Velvet', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-hazelnut', name: 'Hazelnut', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
        { id: 'f-milky-choco', name: 'Milky Choco', prices: { medium: 50.00, large: 70.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/dome-lid": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'iced-coffee',
      name: 'Iced Coffee',
      // ** ASSUMPTION: Iced Coffee uses FLAT LIDS and REGULAR STRAWS. Change these if incorrect! **
      products: [
        { id: 'ic-latte', name: 'Iced Coffee Latte', prices: { medium: 38.00, large: 48.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 } } },
        { id: 'ic-caramel-macchiato', name: 'Iced Caramel Macchiato', prices: { medium: 38.00, large: 48.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 } } },
        { id: 'ic-mocha', name: 'Iced Coffee Mocha', prices: { medium: 38.00, large: 48.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 } } },
        { id: 'ic-caramel-mocha', name: 'Iced Caramel Mocha', prices: { medium: 38.00, large: 48.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 } } },
        { id: 'ic-americano', name: 'Iced Americano', prices: { medium: 38.00, large: 48.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 } } },
        { id: 'ic-vanilla', name: 'Iced Coffee Vanilla', prices: { medium: 38.00, large: 48.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/flat-lid": 1, "consumables/regular-straw": 1 } } },
      ],
    },
    {
      id: 'latte-series',
      name: 'Latte Series',
      // Back to sealing film and boba straws
      products: [
        { id: 'l-strawberry', name: 'Strawberry Latte', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'l-matcha', name: 'Matcha Latte', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'l-blueberry', name: 'Blueberry Latte', prices: { medium: 58.00, large: 68.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'l-spanish', name: 'Spanish Latte', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'l-lotus-biscoff', name: 'Lotus Biscoff Latte', prices: { medium: 78.00, large: 88.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'non-coffee',
      name: 'Non-Coffee',
      products: [
        { id: 'nc-cocoa', name: 'Cocoa Latte', prices: { medium: 78.00, large: 88.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'nc-matcha-berry', name: 'Matcha Berry Latte', prices: { medium: 78.00, large: 88.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'hot-drinks',
      name: 'Hot Drinks',
      // ** ASSUMPTION: Hot drinks use HOT CUPS and HOT LIDS. Change these! **
      products: [
        { id: 'h-hot-choco', name: 'Hot Choco', prices: { medium: 48.00 }, recipe: { medium: { "consumables/hot-cup": 1, "consumables/hot-cup-lid": 1 } } },
        { id: 'h-caramel-macchiato', name: 'Caramel Macchiato', prices: { medium: 48.00 }, recipe: { medium: { "consumables/hot-cup": 1, "consumables/hot-cup-lid": 1 } } },
        { id: 'h-cappuccino', name: 'Cappuccino', prices: { medium: 48.00 }, recipe: { medium: { "consumables/hot-cup": 1, "consumables/hot-cup-lid": 1 } } },
        { id: 'h-matcha-coffee', name: 'Matcha Coffee', prices: { medium: 48.00 }, recipe: { medium: { "consumables/hot-cup": 1, "consumables/hot-cup-lid": 1 } } },
        { id: 'h-cocoa-latte', name: 'Hot Cocoa Latte', prices: { medium: 78.00 }, recipe: { medium: { "consumables/hot-cup": 1, "consumables/hot-cup-lid": 1 } } },
      ],
    },
    {
      id: 'yogurt-series',
      name: 'Yogurt Series',
      products: [
        { id: 'y-milk', name: 'Yogurt Milk', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'y-strawberry', name: 'Strawberry', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'y-blueberry', name: 'Blueberry', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'y-mango', name: 'Mango', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'y-green-apple', name: 'Green Apple', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
    {
      id: 'fruit-tea-yogurt',
      name: 'Fruit Tea Yogurt',
      products: [
        { id: 'fty-lemonade', name: 'Lemonade', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'fty-lychee', name: 'Lychee', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'fty-strawberry', name: 'Strawberry', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'fty-blueberry', name: 'Blueberry', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
        { id: 'fty-mango', name: 'Mango', prices: { medium: 68.00, large: 78.00 }, recipe: { medium: { "consumables/medium-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 }, large: { "consumables/large-cup": 1, "consumables/sealing-film": 1, "consumables/boba-straw": 1 } } },
      ],
    },
  ],
};