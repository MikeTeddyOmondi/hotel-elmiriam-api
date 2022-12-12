const express = require("express");
const router = express.Router();

const {
	verifyToken,
	verifyStaff,
	verifyAdmin,
} = require("../utils/verifyToken");

const { imageUploads } = require("../services/drinkImageUpload");

const {
	apiInfo,
	getBarDrinks,
	getOneBarDrink,
	addBarDrinks,
	getBarPurchases,
} = require("../controllers");

// API version information
router.get("/", verifyStaff, apiInfo);

// ___________________________________________
// Get/Post/Put/Delete | Bar Drinks
// ___________________________________________
router.get("/drinks", verifyStaff, getBarDrinks);
router.post("/drinks", verifyAdmin, imageUploads, addBarDrinks);

// Get/Put/Delete | Bar Drinks [ONE]
router.get("/drinks/:id", verifyAdmin, getOneBarDrink);
// router.put("/drinks/:id", verifyAdmin, updateOneBarDrink);
// router.delete("/drinks/:id", verifyAdmin, deleteOneBarDrinks);

// ___________________________________________
// Get/Post/Put/Delete | Bar Purchases
// ___________________________________________
router.get("/purchases", verifyAdmin, getBarPurchases);
// router.post("/purchases", verifyAdmin, postBarPurchases);

// Get/Put/Delete | Bar Purchases [ONE]
// router.get("/purchases", verifyAdmin, updateBarPurchases);
// router.put("/purchases", verifyAdmin, updateBarPurchases);
// router.delete("/purchases", verifyAdmin, deleteBarPurchases);

// ___________________________________________
// // Get/Post/Put/Delete | Bar Sales
// ___________________________________________
// router.get("/sales", verifyAdmin, getBarSales);
// router.post("/sales", verifyAdmin, postBarSales);

// Get/Put/Delete | Bar Sales [ONE]
// router.get("/sales", verifyAdmin, getOneBarSale);
// router.put("/sales", verifyAdmin, updateOneBarSale);
// router.delete("/sales", verifyAdmin, deleteOneBarSales);

module.exports = router;
