var express = require('express');
const { route } = require('./user');
var router = express.Router();
var productHelper = require('../Helpers/product-helpers');
const { render, response } = require('../app');
const { Db } = require('mongodb');
const productHelpers = require('../Helpers/product-helpers');
const adminHelpers = require('../Helpers/admin-helpers');


router.get('/',function (req, res,next) {
   productHelper.getAllProducts().then((products) => {
    let orders =  adminHelpers.canceledOrders()
    let helper =  adminHelpers.findHelper()
    numberOfCancel = orders.length - helper
    res.render('admin/view-products', { admin: true, products, numberOfCancel , pageName: "Admin Panel"})

  })


});
router.get('/add-product', function (req, res) {
  res.render('admin/add-product')
});

router.post('/add-product', (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-product')
      } else
        console.log(err)
    })
  })
})

router.get('/delete-product/:id', (req, res) => {
  let productId = req.params.id
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect('/admin')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let productId = req.params.id
  let product = await productHelper.getOneProduct(productId)
  res.render('admin/edit-product', { admin: true, product, pageName: "Edit Product", admin_name: req.session.admin, pageName: "Edit Product" })
})


router.post('/edit-product/:id', (req, res) => {
  let image = './public/product-images/' + req.params.id + '.jpg'
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    image = req.files.Image
    if (image) {
      image.mv('./public/product-images/' + req.params.id + '.jpg',)
    } else {
      res.redirect('/admin')
    }
  })


})

router.get('/user-list', (req, res) => {
  adminHelpers.getAllUsers().then((users) => {
    res.render('admin/user-list', { admin: true, users, pageName: "User List"})
  })
})

router.get('/orders', async (req, res) => {
  let orders = await adminHelpers.getAllOrders()
  res.render('admin/order-list', { admin: true, orders, pageName: "Order List" })
})
router.post('/change-status', (req, res) => {
  adminHelpers.changeOrderStatus(req.body).then((response) => {
    res.json({ status: true })
  })
})


router.get('/canceled-orders',async (req, res) => {
  await adminHelpers.changeHelper()
  let orders = await adminHelpers.canceledOrders()
  res.render('admin/canceled-orders', { admin: true, orders, pageName: "Canceled Orders" })
})
module.exports = router;