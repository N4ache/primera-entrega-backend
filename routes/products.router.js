const express = require('express');
const fs = require('fs/promises');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile('./data/productos.json', 'utf-8');
    const products = JSON.parse(data);
    const { limit } = req.query;

    if (limit) {
      return res.json(products.slice(0, parseInt(limit)));
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer los productos' });
  }
});

router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const data = await fs.readFile('./data/productos.json', 'utf-8');
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === parseInt(pid));

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer los productos' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails, status } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar presentes' });
  }

  try {
    const data = await fs.readFile('./data/productos.json', 'utf-8');
    const products = JSON.parse(data);

    if (products.find((p) => p.code === code)) {
      return res.status(400).json({ error: 'El código ya está en uso' });
    }

    const newProduct = {
      id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnails || [],
      status: status !== undefined ? status : true,
    };

    products.push(newProduct);
    await fs.writeFile('./data/productos.json', JSON.stringify(products, null, 2));

    res.status(201).json({ message: 'Producto agregado exitosamente', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el producto' });
  }
});

router.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const updates = req.body;

  if (updates.id) {
    return res.status(400).json({ error: 'No se puede actualizar el campo ID' });
  }

  try {
    const data = await fs.readFile('./data/productos.json', 'utf-8');
    const products = JSON.parse(data);
    const index = products.findIndex((p) => p.id === parseInt(pid));

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products[index] = { ...products[index], ...updates };
    await fs.writeFile('./data/productos.json', JSON.stringify(products, null, 2));

    res.json({ message: 'Producto actualizado exitosamente', product: products[index] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

router.delete('/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    const data = await fs.readFile('./data/productos.json', 'utf-8');
    const products = JSON.parse(data);
    const index = products.findIndex((p) => p.id === parseInt(pid));

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const deletedProduct = products.splice(index, 1);
    await fs.writeFile('./data/productos.json', JSON.stringify(products, null, 2));

    res.json({ message: 'Producto eliminado exitosamente', product: deletedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;