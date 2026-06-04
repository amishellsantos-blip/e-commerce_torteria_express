<?php
require 'api/db.php';

try {
    // 1. Disable FK checks to safely truncate
    $pdo->exec('SET FOREIGN_KEY_CHECKS=0;');
    
    // 2. Truncate tables to ensure clean state and reset IDs
    $pdo->exec('TRUNCATE TABLE products;');
    
    // Opcional: limpiar pedidos de prueba para evitar referencias rotas a productos antiguos
    $pdo->exec('TRUNCATE TABLE order_items;');
    $pdo->exec('TRUNCATE TABLE orders;');
    
    $pdo->exec('SET FOREIGN_KEY_CHECKS=1;');
    
    // 3. Prepare the insert statement
    $stmt = $pdo->prepare('INSERT INTO products (name, description, shortDescription, price, category, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    $products = [
        ['Torta artesanal de 3quesos con fruta', "Torta artesanal de 3quesos con crema chantilly y fruta \n Porcion $7.000", 45000, 'tortas', 'assets/img/product/torta_3quesos_confruta.jpg'],
        ['Torta artesanal de almendras', "Torta 100% libre de gluten \n endulzada con estevia \n harina de almendras \n nueces ,almendras y uvas pasas \n Torta 8 porciones o \n porción $8.000", 60000, 'tortas', 'assets/img/product/torta_almendras.jpg'],
        ['Croisant jamón y queso', "Croisant de jamón y queso", 3500, 'hojaldres', 'assets/img/product/croissant.jpg'],
        ['Deditos', "Deditos de queso\nDeditos de bocadillo y queso", 3500, 'hojaldres', 'assets/img/product/deditos.jpg'],
        ['Pasteles hojaldrados', "Pasteles hojaldrados \n Pollo\n carne\n Mixto carne pollo\n Pollo y champiñones \n Pollo , maíz y queso \n Pollo cabano\n Pollo butifarra \n Hawaiano \n Arequipe\n Bocadillo y queso", 6000, 'hojaldres', 'assets/img/product/pastel_hojaldre.jpg'],
        ['Torta artesanal quesadillo', "Torta artesanal de 3quesos con bocadillo\n 8 porciones \n Porcion $4.000", 26000, 'tortas', 'assets/img/product/torta_quesadillo.jpg'],
        ['Torta artesanal de piña coco', "Torta artesanal de piña coco \n 8 porciones \n Porcion $4.000", 26000, 'tortas', 'assets/img/product/torta_piña_coco.jpg'],
        ['Torta artesanal de ahuyama', "Torta artesanal de ahuyama con bocadillo y queso \n 8 porciones\n Porcion $3.800", 24000, 'tortas', 'assets/img/product/torta_ahuyama.jpg'],
        ['Capuccino', "Capuccino tradicional $5.000\n Capuccino vainilla $5500", 5000, 'bebidas', 'assets/img/product/capuccino.jpg'],
        ['Frappé', "Milo\n Oreo\n Café", 9000, 'bebidas', 'assets/img/product/frappe.jpg'],
        ['Avena cubana', "Avena cubana\n Litro $20000\n Vaso $4500", 4500, 'bebidas', 'assets/img/product/avena.jpg'],
        ['Torta artesanal de 3quesos', "Torta artesanal de 3quesos\n 8 porciones\n Porcion $3800", 24000, 'tortas', 'assets/img/product/torta_3quesos.jpg'],
        ['Quesillo', "Suave, cremoso y con delicioso caramelo", 7000, 'postres', 'assets/img/product/quesillo.jpg'],
        ['Soda con limón', "Soda de Limón Natural\n Refrescante, burbujeante y con el toque perfecto de limón natural", 5000, 'bebidas', 'assets/img/product/soda_limon.jpg'],
        ['Jugos naturales', "Jugos naturales agua o leche", 7000, 'bebidas', 'assets/img/product/jugo_natural.jpg'],
        ['Torta artesanal de vainilla y chocolate', "Torta artesanal de vainilla y chocolate", 22000, 'tortas', 'assets/img/product/torta_vainilla_chocolate.jpg'],
        ['Torta artesanal de 3quesos mini', "Torta artesanal de 3quesos mini \n 4 porciones", 14000, 'tortas', 'assets/img/product/torta_3quesos_mini.jpg'],
        ['Torta 3quesos con Arándanos', "Torta artesanal de 3quesos con Arándanos \n 8 porciones \n $4000", 26000, 'tortas', 'assets/img/product/torta_3quesos_arandanos.jpg'],
        ['Ponquesitos 3quesos', "Ponquesitos de 3quesos", 1700, 'postres', 'assets/img/product/ponquesitos.jpg'],
        ['Copete Morrocoyero', "Durazno\n Frutos rojos\n Arequipe\n Queso\n Torta vainilla\n Agua", 12000, 'postres', 'assets/img/product/copete_morrocoyero.jpg'],
        ['Deditos de queso o bocadillo y queso', "Deditos de queso\n Deditos de bocadillo y queso", 3500, 'hojaldres', 'assets/img/product/deditos.jpg'],
        ['Mini 3quesos semi-decorada', "2 tortas 3quesos mini con relleno, cobertura de frutos rojos y arequipe", 34000, 'tortas', 'assets/img/product/torta_3quesos_mini.jpg'],
        ['Torta artesanal de 3quesos cumpleaños', "Torta artesanal de 3quesos con frutos rojos y feliz cumpleaños en crema chantilly", 40000, 'tortas', 'assets/img/product/torta_3quesos_frutosrojos.jpg'],
        ['Torta artesanal choco arequipe', "Torta artesanal de chocolate con arequipe \n Torta artesanal de vainilla con cobertura de chocolate \n Porción $7000", 44000, 'tortas', 'assets/img/product/torta_choco_arequipe.jpg'],
        ['Torta artesanal de piña volteada', "Torta artesanal de piña con rodajas caramelizadas y cerezas", 40000, 'tortas', 'assets/img/product/torta_piña.jpg'],
        ['Torta artesanal de 3quesos con frutos rojos', "Torta artesanal de 3quesos con frutos rojos y perlas en crema chantilly", 40000, 'tortas', 'assets/img/product/torta_3quesos_frutosrojos.jpg'],
        ['Torta artesanal con toppings', "1 torta 8 sabores con toppings \n Porcion $7000", 42000, 'tortas', 'assets/img/product/torta_toppings.jpg'],
        ['Torta artesanal de chocolate mini y cereza', "Torta artesanal de chocolate mini con relleno de arequipe y ganache de chocolate", 26000, 'tortas', 'assets/img/product/torta_chocolate_mini.jpg'],
        ['Torta artesanal de chocolate y arequipe mini', "Torta artesanal de chocolate mini con relleno y cobertura de chocolate y cereza", 26000, 'tortas', 'assets/img/product/torta_chocolate_mini.jpg'],
        ['Torta artesanal de vainilla y mani', "Torta artesanal de vainilla con relleno cobertura de arequipe, mani y frutos rojos", 26000, 'tortas', 'assets/img/product/torta_vainilla.jpg'],
        ['Torta artesanal de 3quesos mini frutal', "Torta artesanal de 3quesos mini con crema chantilly y fruta", 26000, 'tortas', 'assets/img/product/torta_3quesos_mini.jpg'],
        ['Torta artesanal de vainilla y arequipe', "Torta artesanal de vainilla rellena de arequipe con cobertura y grajeas de chocolate \n Porcion $7.000", 40000, 'tortas', 'assets/img/product/torta_vainilla.jpg'],
        ['Torta artesanal de 3quesos con toppings', "Torta artesanal de 3quesos con arequipe, leche condensada y grajeas \n 8 porciones", 34000, 'tortas', 'assets/img/product/torta_3quesos.jpg'],
        ['Torta rey chocolate', "Torta artesanal de chocolate rellena de arequipe con ganache y grajeas\n Porcion 7500", 44000, 'tortas', 'assets/img/product/torta_chocolate.jpg'],
        ['Torta artesanal de tres quesos semi decorada', "Torta artesanal de tres quesos con frutos rojos y arequipe con grajeas \n Hasta 10 porciones", 34000, 'tortas', 'assets/img/product/torta_3quesos.jpg'],
        ['Torta artesanal mixta', "1 Torta artesanal \n 8 sabores", 26000, 'tortas', 'assets/img/product/torta_mixta.jpg'],
        ['Torta artesanal de naranja', "Torta artesanal de naranja \n 12 porciones \n Porcion $3800", 24000, 'tortas', 'assets/img/product/torta_naranja.jpg'],
        ['Torta artesanal de maracuya', "Torta artesanal de Maracuya \n 8 porciones \n Porcion $4.000", 26000, 'tortas', 'assets/img/product/torta_maracuya.jpg'],
        ['Torta artesanal de zanahoria', "Torta artesanal de zanahoria con nueces y almendras \n 8 porciones \n Porcion $4000", 26000, 'tortas', 'assets/img/product/torta_zanahoria.jpg'],
        ['Torta artesanal de chocolate', "Torta artesanal de chocolate tipo Brownie \n 8 porciones\n Porcion $3800", 24000, 'tortas', 'assets/img/product/torta_chocolate.jpg'],
        ['Torta artesanal de avena', "Torta artesanal de avena con nueces, almendras y uvas pasas endulzada con stevia \n 8 porciones\n Porcion 3800", 26000, 'tortas', 'assets/img/product/torta_avena.jpg'],
        ['Torta artesanal de piña', "Torta artesanal de piña \n 8 porciones\n Porcion $3800", 24000, 'tortas', 'assets/img/product/torta_piña.jpg'],
        ['Galletas', "Galleta red velvet rellena de crema de queso $5.000\n Galleta chip chocolate rellena de nutella $5.000\n Galleta de pistacho $5.000\n Galleta frutos secos(nueces, almendras) $4.000", 5000, 'postres', 'assets/img/product/galletas.jpg'],
        ['Torta artesanal de 3quesos con fruta y mani', "3 Tortas artesanales de 3quesos con relleno de arequipe con fruta y mani", 100000, 'tortas', 'assets/img/product/torta_3quesos_confruta.jpg'],
        ['Arequipe artesanal', "Tres presentaciones \n Grande 135 gramos $4.500\n Mediano 105 gramos $3.500\n Pequeño 40 gramos $2.500", 2500, 'postres', 'assets/img/product/arequipe.jpg']
    ];
    
    foreach ($products as $p) {
        $short = strlen($p[1]) > 150 ? substr($p[1], 0, 147) . '...' : $p[1];
        $stmt->execute([$p[0], $p[1], $short, $p[2], $p[3], $p[4], 1]);
    }
    
    echo "¡Productos actualizados con éxito! Se insertaron " . count($products) . " productos.";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
