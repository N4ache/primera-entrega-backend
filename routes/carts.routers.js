const express = require('express');
const fs = require('fs/promises');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const data = await fs.readFile('./data/carrito.json', 'utf-8');
    const carts = JSON.parse(data);

    const newCart = {
      id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
      products: [],
    };

    carts.push(newCart);
    await fs.writeFile('./data/carrito.json', JSON.stringify(carts, null, 2));

    res.status(201).json({ message: 'Carrito creado exitosamente', cart: newCart });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const data = await fs.readFile('./data/carrito.json', 'utf-8');
    const carts = JSON.parse(data);
    const cart = carts.find((c) => c.id === parseInt(cid));

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el carrito' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cartsData = await fs.readFile('./data/carrito.json', 'utf-8');
    const productsData = await fs.readFile('./data/productos.json', 'utf-8');
    const carts = JSON.parse(cartsData);
    const products = JSON.parse(productsData);

    const cart = carts.find((c) => c.id === parseInt(cid));
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const product = products.find((p) => p.id === parseInt(pid));
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cartProduct = cart.products.find((p) => p.product === parseInt(pid));
    if (cartProduct) {
      cartProduct.quantity += 1;
    } else {
      cart.products.push({ product: parseInt(pid), quantity: 1 });
    }

    await fs.writeFile('./data/carrito.json', JSON.stringify(carts, null, 2));
    res.json({ message: 'Producto agregado al carrito exitosamente', cart });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
});

module.exports = router;