<?php
require 'api/db.php';

try {
    // 1. Limpiar descripciones en la tabla products
    $updates = [
        'Galletas' => "Exquisitas galletas artesanales horneadas al punto perfecto: suaves por dentro y crujientes por fuera.",
        'Jugos naturales' => "Refrescantes jugos elaborados 100% con pura pulpa de fruta natural, perfectos para acompañar tus comidas.",
        'Pasteles hojaldrados' => "Deliciosos pasteles de masa de hojaldre crujiente, horneados a la perfección y rellenos con ingredientes frescos de la mejor calidad.",
        'Deditos' => "Irresistibles deditos horneados, crujientes y deliciosos, ideales para matar cualquier antojo.",
        'Deditos de queso o bocadillo y queso' => "Irresistibles deditos horneados, crujientes y deliciosos.",
        'Frappé' => "Bebida fría y dulce, mezclada a la perfección con hielo frappé y coronada con crema chantilly.",
        'Capuccino' => "Clásico café espumoso preparado caliente con nuestra mezcla especial de granos seleccionados.",
        'Avena cubana' => "Bebida cremosa, espesa y tradicional de avena. Perfecta para disfrutar bien fría en cualquier momento del día.",
        'Arequipe artesanal' => "Auténtico arequipe artesanal, suave, cremoso y con el dulzor perfecto para acompañar todos tus postres."
    ];

    $stmtUpdateDesc = $pdo->prepare("UPDATE products SET description = ?, shortDescription = ? WHERE name = ?");
    
    foreach ($updates as $name => $desc) {
        $short = strlen($desc) > 150 ? substr($desc, 0, 147) . '...' : $desc;
        $stmtUpdateDesc->execute([$desc, $short, $name]);
    }
    echo "Descripciones estáticas actualizadas.\n";

    // 2. Limpiar automáticamente la basura de "Porcion $X" y "8 porciones" de las tortas
    $stmtProducts = $pdo->query("SELECT id, name, description FROM products");
    $products = $stmtProducts->fetchAll();

    foreach ($products as $p) {
        $desc = $p['description'];
        $original = $desc;
        
        // Expresiones regulares para borrar líneas con precios de porciones y tamaños
        $desc = preg_replace('/Porci[oó]n\s*\$?\s*[\d\.,]+/i', '', $desc);
        $desc = preg_replace('/\d+\s*porciones?/i', '', $desc);
        $desc = preg_replace('/Torta\s+100%\s+libre\s+de\s+gluten/i', "Torta 100% libre de gluten\nEndulzada con estevia.", $desc);
        $desc = preg_replace('/Torta\s*8\s*sabores/i', "Torta de 8 sabores combinados.", $desc);
        $desc = preg_replace('/Litro\s*\$?\s*[\d\.,]+/i', '', $desc);
        $desc = preg_replace('/Vaso\s*\$?\s*[\d\.,]+/i', '', $desc);
        $desc = preg_replace('/Tres presentaciones/i', '', $desc);
        $desc = preg_replace('/Grande.*gramos.*\d+/i', '', $desc);
        $desc = preg_replace('/Mediano.*gramos.*\d+/i', '', $desc);
        $desc = preg_replace('/Pequeño.*gramos.*\d+/i', '', $desc);
        
        // Limpiar saltos de línea y espacios extras que queden huérfanos
        $desc = trim(preg_replace('/\n\s*\n/', "\n", $desc));
        $desc = trim(preg_replace('/^\s*o\s*$/m', '', $desc)); // borrar " o " huérfano

        if ($desc !== $original) {
            // Si quedó muy vacía, dejar la primera frase
            if (empty($desc)) $desc = "Deliciosa " . $p['name'] . " elaborada artesanalmente.";
            $short = strlen($desc) > 150 ? substr($desc, 0, 147) . '...' : $desc;
            $stmtUpdateDesc->execute([$desc, $short, $p['name']]);
        }
    }
    echo "Limpieza de precios en descripciones completada.\n";

    // 3. Mejorar los nombres de los sabores de las galletas (Sizes en la BD por ser de precio variable)
    $stmtGetGalleta = $pdo->prepare("SELECT id FROM products WHERE name = 'Galletas'");
    $stmtGetGalleta->execute();
    $galletaId = $stmtGetGalleta->fetchColumn();

    if ($galletaId) {
        // Actualizar los nombres
        $pdo->exec("UPDATE product_sizes SET name = 'Red Velvet (Rellena crema queso)' WHERE product_id = $galletaId AND name = 'Red Velvet'");
        $pdo->exec("UPDATE product_sizes SET name = 'Chip Chocolate (Rellena nutella)' WHERE product_id = $galletaId AND name = 'Chip Chocolate'");
        $pdo->exec("UPDATE product_sizes SET name = 'Frutos secos (Nueces y almendras)' WHERE product_id = $galletaId AND name = 'Frutos secos'");
        echo "Opciones de galletas mejoradas.\n";
    }

    // 4. Agregar los Sabores de los Jugos Naturales (además de sus bases de agua/leche)
    $stmtGetJugos = $pdo->prepare("SELECT id FROM products WHERE name = 'Jugos naturales'");
    $stmtGetJugos->execute();
    $jugosId = $stmtGetJugos->fetchColumn();

    if ($jugosId) {
        // Limpiar sabores de jugo si existen y volver a meter
        $pdo->exec("DELETE FROM product_flavors WHERE product_id = $jugosId");
        
        $saboresJugos = ['Maracuyá', 'Naranja', 'Banano con Milo', 'Mango', 'Guayaba', 'Guanábana', 'Mora', 'Fresa', 'Lulo'];
        $stmtInsertFlavor = $pdo->prepare('INSERT INTO product_flavors (product_id, name) VALUES (?, ?)');
        
        foreach ($saboresJugos as $sabor) {
            $stmtInsertFlavor->execute([$jugosId, $sabor]);
        }
        echo "Sabores de Jugos naturales inyectados correctamente.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
