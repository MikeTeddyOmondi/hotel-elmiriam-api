const { v4: uuidv4 } = require("uuid");

// Load User model
const BarPurchase = require("../models/BarPurchase");
const BarSale = require("../models/BarSale");
const Drink = require("../models/Drink");

// Utils
const { createError } = require("../utils/error");
const { MINIO_API_HOST } = require("../config/config.js");

// Import Bar Service
const {
  saveDrink,
  searchDrink,
  findDrink,
  fetchAllDrinks,
  saveBarPurchase,
  fetchBarPurchases,
  updateStockQuantity,
} = require("../services/bar.service");

const BUCKET_NAME = String("hotel-elmiriam");

exports.apiInfo = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bar API",
    description: "Bar API | Version 1",
  });
};

// ______________________________________
// ADD BAR DRINKS INFORMATION
// ______________________________________

// Bar Drink | Menu Updates | GET (ALL)
exports.getBarDrinks = async (req, res, next) => {
  try {
    const drinks = await fetchAllDrinks();
    res.status(200).json({
      success: true,
      data: { drinks },
    });
  } catch (error) {
    return next(createError(500, "Error fetching drinks"));
  }
};

// Bar Drink | Menu Updates | GET (ONE)
exports.getOneBarDrink = async (req, res, next) => {
  const objectID = req.params.id;
  try {
    const drink = await findDrink(objectID);
    res.status(200).json({
      success: true,
      data: { drink },
    });
  } catch (error) {
    return next(createError(500, "Error fetching the drink"));
  }
};

// Bar Drink | Menu Updates | POST
exports.addBarDrinks = async (req, res, next) => {
  // const bodyData = JSON.parse(req.body);
  const bodyData = req.body;
  const { drinkName, drinkCode, typeOfDrink, uom, buyingPrice, sellingPrice } =
    bodyData;

  const { mimetype, originalname, path } = req.file ?? {};
  console.log({ mimetype, originalname, path });

  let errors = {};

  if (
    !drinkName ||
    !drinkCode ||
    !typeOfDrink ||
    !uom ||
    !buyingPrice ||
    !sellingPrice
  ) {
    errors = { message: "Please enter all fields" };

    return res.status(400).json({
      success: false,
      data: errors,
    });
  }

  if (!mimetype || mimetype.split("/")[0] !== "image") {
    errors = { message: "Only images are allowed" };

    return res.status(400).json({
      success: false,
      data: errors,
    });
  }

  // if (size > 10485760) {
  //   errors = { message: "Image must be less than 10MB" };
  //   return res.status(400).json({
  //     success: false,
  //     data: errors,
  //   });
  // }

  if (
    typeOfDrink !== "spirit" &&
    typeOfDrink !== "beer" &&
    typeOfDrink !== "rtd" &&
    typeOfDrink !== "wine" &&
    typeOfDrink !== "water"
  ) {
    errors = {
      message: "Types of drinks accepted: spirit, beer, rtd, wine or water",
    };
    return res.status(400).json({
      success: false,
      data: errors,
    });
  }

  if (uom !== "bottles" && uom !== "crates") {
    errors = {
      message: "Units of measurement(uom) accepted: bottles or crates",
    };
    return res.status(400).json({
      success: false,
      data: errors,
    });
  }

  // Check if the drink code exists in the database
  const drinkFound = await searchDrink(drinkCode);
  console.log("> Searched drink: ", drinkFound);

  if (drinkFound !== null) {
    errors = { message: `Drink code already exists!` };
    return res.status(500).json({
      success: false,
      data: errors,
    });
  }

  let imageUrl = "";

  if (MINIO_API_HOST == undefined) {
    createError(500, `[#] Minio configuration required!`);
  } else {
    imageUrl = `http://${MINIO_API_HOST}:9003/${BUCKET_NAME}/${path}`;
  }

  if (imageUrl.includes(undefined) || imageUrl === "") {
    return next(
      createError(
        500,
        `Error saving drink information: imageUrl is incorrect! ${imageUrl}`
      )
    );
  }

  const newDrink = new Drink({
    drinkName,
    drinkCode,
    typeOfDrink,
    uom,
    buyingPrice,
    sellingPrice,
    imageUrl,
  });
  console.log({ newDrink });

  saveDrink(newDrink)
    .then((doc) => {
      res.status(200).json({
        success: true,
        data: {
          message: `Drink: ${doc.drinkCode} created successfully!`,
        },
      });
    })
    .catch((err) => {
      console.log({ err });
      return next(
        createError(500, `Error saving drink information: ${err.message}`)
      );
    });
};

// ______________________________________
// ADD BAR PURCHASES INFORMATION
// ______________________________________

// Bar purchases | GET
exports.getBarPurchases = async (req, res, next) => {
  try {
    // Fetching All Bar Purchases
    const purchases = await fetchBarPurchases();
    res.status(200).json({
      success: true,
      data: { purchases },
    });
  } catch (err) {
    return next(createError(500, "Error fetching bar purchases"));
  }
};

// Bar purchases - Add Bar Purchases Form | GET
exports.getBarPurchasesFormPanel = (req, res) => {
  // Initialize drink codes to display
  let drinkCodes = {};

  // fetch all drink codes from database
  fetchAllDrinks()
    .then((allDrinks) => {
      //console.log(allDrinks);

      drinkCodes = allDrinks.map(({ drinkCode }) => drinkCode);

      // render the page
      res.render("admin/barPurchasesForm", {
        drinkCodes,
        user: req.user,
        title: "Bar Purchases - Add List",
        layout: "./layouts/adminLayout.ejs",
      });
    })
    .catch((err) => {
      console.log(`> An error occurred while fetching data: ${err.message}`);
    });
};

// Bar purchases - Add Bar Purchases Form | POST
exports.postBarPurchasesFormPanel = (req, res) => {
  const { receiptNumber, product, quantity, supplier } = req.body;

  console.log({ receiptNumber, product, quantity, supplier });

  let errors = [];
  let drinks = {};
  let drinkCodes = {};
  let buyingPrice = 0;

  // fetch all drink codes from database
  fetchAllDrinks()
    .then((allDrinks) => {
      drinks = allDrinks;
      drinkCodes = allDrinks.map(({ drinkCode }) => drinkCode);

      // Bar Purchases Logic
      if (!receiptNumber || !product || !quantity || !supplier) {
        errors.push({ msg: "Please enter all fields" });
      }

      if (errors.length > 0) {
        res.render("admin/barPurchasesForm", {
          errors,
          quantity,
          availability,
          drinkCodes,
          user: req.user,
          title: "Bar Purchases | Add List",
          layout: "./layouts/adminLayout.ejs",
        });
      } else {
        // Get the buying price after specific product search
        searchDrink(product)
          .then((drinkFound) => {
            // Get the buying price of the product
            buyingPrice = drinkFound.buyingPrice;

            // Calculate Stock value
            let stockValue = buyingPrice * Number(quantity);

            const newPurchase = {
              receiptNumber,
              product: drinkFound._id,
              quantity,
              stockValue,
              supplier,
            };

            // Drink to update stock quantity & inStock status
            const drinkToUpdate = drinkFound;

            // Save Bar Purchase
            saveBarPurchase(newPurchase)
              .then((purchaseMade) => {
                console.log(
                  `> [Controller Logs] New Bar Purchase: ${purchaseMade}`
                );
                req.flash(
                  "success_msg",
                  `Saved the new bar stock purchase successfully! `
                );
              })
              .then(() => {
                // Update Stock Quantity
                updateStockQuantity(drinkToUpdate, quantity)
                  .then(() => {
                    req.flash(
                      "success_msg",
                      `Updated the drink stocks successfully!`
                    );
                    return res.redirect("/admin/bar-purchases/add");
                  })
                  .catch((err) => {
                    throw err;
                  });
              })
              .catch((err) => {
                console.log(
                  `> [Controller Error] An error occurred while saving the data: ${err.message}`
                );
                req.flash(
                  "error_msg",
                  `An error occurred while saving the data!`
                );
                return res.redirect("/admin/bar-purchases/add");
              });
          })
          .catch((err) => {
            console.log(
              `> [Controller Error] Product with that code was not found!!!...`
            );

            req.flash(
              "error_msg",
              `Product with this code ${product} was not found!`
            );
            return res.redirect("/admin/bar-purchases/add");
          });
      }
    })
    .catch((err) => {
      console.log(
        `> [Controller Error] An error occurred while fetching data: ${err.message}`
      );
      req.flash("error_msg", `An error occurred while fetching data!`);
      return res.redirect("/admin/bar-purchases/add");
    });
};
