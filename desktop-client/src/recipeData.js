// This is your "Recipe Book"
// It links product IDs (from menuData.js) to your inventory documents.

// IMPORTANT: The keys (e.g., 'taro-powder') MUST match the
// field names in your Firestore inventory documents.

export const recipes = {
  // --- ADDON RECIPES ---
  // These are for the addons themselves
  "addons": {
    "pearl": { "toppings/pearl": 1 },
    "nata": { "toppings/nata": 1 },
    "fruit-jelly": { "toppings/fruit-jelly": 1 },
    "coffee-jelly": { "toppings/coffee-jelly": 1 },
    "creamcheese": { "toppings/creamcheese": 1 },
    "crushed-oreo": { "toppings/crushed-oreo": 1 },
    "crushed-graham": { "toppings/crushed-graham": 1 },
    "coffee-shot": { "toppings/coffee-shot": 1 },
  },

  // --- DRINK RECIPES ---
  // You must define a recipe for EVERY size of EVERY drink.
  "products": {
    // --- Milk Tea Series ---
    "mt-taro": {
      "medium": {
        "consumables/medium-cup": 1,
        "consumables/sealing-film": 1,
        "consumables/boba-straw": 1,
        "powders/taro-powder": 30, // 30g
        "powders/creamer": 20, // 20g
        "syrups/fructose": 20, // 20ml
        "bases/black-tea": 150, // 150ml
      },
      "large": {
        "consumables/large-cup": 1,
        "consumables/sealing-film": 1,
        "consumables/boba-straw": 1,
        "powders/taro-powder": 40,
        "powders/creamer": 25,
        "syrups/fructose": 25,
        "bases/black-tea": 200,
      }
    },
    "mt-okinawa": {
      "medium": {
        "consumables/medium-cup": 1,
        "consumables/sealing-film": 1,
        "consumables/boba-straw": 1,
        "powders/okinawa-powder": 30,
        "powders/creamer": 20,
        "syrups/fructose": 10, // Less fructose for brown sugar drinks
        "syrups/brown-sugar": 15,
        "bases/black-tea": 150,
      },
      "large": {
        "consumables/large-cup": 1,
        "consumables/sealing-film": 1,
        "consumables/boba-straw": 1,
        "powders/okinawa-powder": 40,
        "powders/creamer": 25,
        "syrups/fructose": 15,
        "syrups/brown-sugar": 20,
        "bases/black-tea": 200,
      }
    },
    "mt-matcha": {
        "medium": {
            "consumables/medium-cup": 1,
            "consumables/sealing-film": 1,
            "consumables/boba-straw": 1,
            "powders/matcha-powder": 25,
            "powders/creamer": 20,
            "syrups/fructose": 20,
            "bases/black-tea": 150,
        },
        "large": {
            "consumables/large-cup": 1,
            "consumables/sealing-film": 1,
            "consumables/boba-straw": 1,
            "powders/matcha-powder": 35,
            "powders/creamer": 25,
            "syrups/fructose": 25,
            "bases/black-tea": 200,
        }
    },
    
    // --- (EXAMPLE) Iced Coffee Series ---
    "ic-latte": {
        "medium": {
            "consumables/medium-cup": 1,
            "consumables/sealing-film": 1,
            "consumables/boba-straw": 1,
            "bases/coffee-beans": 18, // 18g for a shot
            "syrups/fructose": 15,
            // "bases/milk": 150, // (Add 'milk' to inventory/bases if you track it)
        },
        "large": {
            "consumables/large-cup": 1,
            "consumables/sealing-film": 1,
            "consumables/boba-straw": 1,
            "bases/coffee-beans": 36, // 36g for a double shot
            "syrups/fructose": 20,
            // "bases/milk": 200,
        }
    }

    // --- (TODO) ---
    // You MUST continue to add recipes for ALL your other
    // products from menuData.js here (Fruit Tea, Soda, Frappe, etc.)
  }
};