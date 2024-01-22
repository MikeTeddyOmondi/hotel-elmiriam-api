// Models
const BarPurchase = require("../models/BarPurchase");
const BarSale = require("../models/BarSale");
const Drink = require("../models/Drink");

// Bar Service
module.exports = {
  saveDrink: async (drink) => {
    // Logic here
    const {
      drinkName,
      drinkCode,
      typeOfDrink,
      uom,
      buyingPrice,
      sellingPrice,
      imageUrl,
    } = drink;

    let newDrink = new Drink({
      drinkName,
      drinkCode,
      typeOfDrink,
      uom,
      buyingPrice,
      sellingPrice,
      imageUrl,
    });

    await newDrink
      .save()
      .then(() => {
        console.log("> Saved a new drink!");
      })
      .catch((err) => {
        console.log(
          "> [Bar Service] An error occurred while saving the drink information - ",
          err.message
        );
        return err;
      });
    return newDrink;
  },
  searchDrink: async (drinkCode) => {
    // Searching for drink given the unique drink code
    let drink;

    try {
      const drinkExists = await Drink.findOne({
        drinkCode: String(drinkCode),
      });

      drinkExists ? (drink = drinkExists) : (drink = null);
      console.log(`> Drink Found: ${drinkExists}`);
      return drink;
    } catch (err) {
      console.log(
        `> [Bar Service] An error occurred while searching for that drink (${drinkCode}) - ${err}`
      );
      return (drink = null);
    }
  },
  findDrink: async (objectID) => {
    // Searching for drink given the unique Object ID
    let drink = {};

    await Drink.findOne({ _id: objectID })
      .then(({_doc}) => {
        console.log(`> Drink found: ${_doc._id}`);
        drink = { ..._doc };
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while finding the single drink - ${err.message}`
        );
        drink = {};
      });

    return drink;
  },
  fetchAllDrinks: async () => {
    // Logic here
    let allDrinks = {};

    await Drink.find({})
      .then((drinks) => {
        //allDrinkCodes = drinks.map(({ drinkCode }) => drinkCode);
        allDrinks = drinks;
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while fetching data - ${err.message}`
        );
        return (allDrinks = {});
      });

    return allDrinks;
  },
  saveBarPurchase: async (barPurchase) => {
    // Bar purchase Service Logic
    const { receiptNumber, product, quantity, stockValue, supplier } =
      barPurchase;

    let newBarPurchase = new BarPurchase({
      receiptNumber,
      product,
      quantity,
      stockValue,
      supplier,
    });

    newBarPurchase
      .save()
      .then(() => {
        console.log("> Saved a new bar purchase!");
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while saving the bar purchase (${barPurchase}) - ${err.message}`
        );
        return;
      });
    return newBarPurchase;
  },
  fetchBarPurchases: async () => {
    // Logic here
    let allPurchases = [];

    await BarPurchase.find({})
      .populate("product")
      .then((purchasesMade) => {
        // console.log(purchasesMade);
        allPurchases = [...purchasesMade];
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while fetching data - ${err.message}`
        );

        return allPurchases;
      });

    return allPurchases;
  },
  updateStockQuantity: async (drink, quantity) => {
    await Drink.updateOne(
      { _id: drink._id },
      {
        $set: {
          inStock: true,
          stockQty: parseInt(drink.stockQty) + parseInt(quantity),
        },
      }
    )
      .then(() => {
        console.log(
          `> [Bar Service] Updated drink ${drink.drinkCode} stock data successfully`
        );
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while updating drink data - ${err.message}`
        );
        return err;
      });
  },
  saveBarSale: async (barSale) => {
    const { customer, drinksBought } = barSale;

    let newBarSale = new BarSale({
      customer,
      drinks: drinksBought,
    });

    await newBarSale
      .save()
      .then(() => {
        console.log(`> [Bar Service] Added a drink sale data successfully`);
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while saving the drink sale data - ${err.message}`
        );
        return { error: err };
      });

    return newBarSale;
  },
  fetchBarSale: async (saleID) => {
    // Logic here
    let sale;

    await BarSale.find({ _id: saleID })
      .populate("customer")
      .populate("drinks.productID", "Drink")
      .then((saleMade) => {
        console.log(saleMade);
        sale = saleMade;
      })
      .catch((err) => {
        console.log(
          `> [Bar Service] An error occurred while fetching the sale data - ${err.message}`
        );
        sale = {};
        return err;
      });

    return sale;
  },
};
