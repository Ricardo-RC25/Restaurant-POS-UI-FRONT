Sí, con ese formulario tus pruebas en Postman deben manejarse así:

Aplicar a todos los productos marcado     → application_type: "global"
Categorías marcadas                       → application_type: "category"
Productos individuales marcados           → application_type: "product"

Tu endpoint base es:

http://localhost:3000/api/extras
1. Crear extra global

Este caso es cuando marcas:

Aplicar a todos los productos
Postman
POST http://localhost:3000/api/extras
Body
{
  "name": "Salsa extra",
  "description": "Salsa adicional para cualquier producto",
  "price": 5,
  "application_type": "global",
  "active": true,
  "categories": [],
  "products": []
}
Respuesta esperada
{
  "message": "Extra creado correctamente",
  "extraId": "id-generado"
}

En este caso solo se guarda en:

extras

No se guarda nada en:

category_extras
product_extras
2. Crear extra para categorías específicas

Este caso es cuando NO marcas global y seleccionas, por ejemplo:

Tortas
Tacos
Postman
POST http://localhost:3000/api/extras
Body
{
  "name": "Piña",
  "description": "Piña para tacos y tortas",
  "price": 0,
  "application_type": "category",
  "active": true,
  "categories": [
    "Tortas",
    "Tacos"
  ],
  "products": []
}
Respuesta esperada
{
  "message": "Extra creado correctamente",
  "extraId": "id-generado"
}

Esto guarda:

extras
category_extras

Puedes validarlo en MySQL con:

SELECT * FROM extras ORDER BY created_at DESC;
SELECT * FROM category_extras;
3. Crear extra para un producto específico

Este caso es como en tu segunda imagen, donde está marcado:

Pastor

Primero necesitas saber el id real del producto Pastor:

SELECT id, name FROM menu_items;

Supongamos que Pastor tiene este ID:

fcc88c20-2598-44ce-9021-b475ca7ca6a5
Postman
POST http://localhost:3000/api/extras
Body
{
  "name": "Piña",
  "description": "Piña para tacos",
  "price": 0,
  "application_type": "product",
  "active": true,
  "categories": [],
  "products": [
    "fcc88c20-2598-44ce-9021-b475ca7ca6a5"
  ]
}
Respuesta esperada
{
  "message": "Extra creado correctamente",
  "extraId": "id-generado"
}

Esto guarda:

extras
product_extras

Puedes validarlo con:

SELECT * FROM extras ORDER BY created_at DESC;
SELECT * FROM product_extras;
4. Obtener extras
GET http://localhost:3000/api/extras
Respuesta esperada con tu código actual
[
  {
    "id": "id-extra",
    "name": "Piña",
    "description": "Piña para tacos",
    "price": "0.00",
    "application_type": "product",
    "active": 1,
    "created_at": "2026-05-05T..."
  }
]

Pero ojo: con tu código actual, el GET /api/extras no regresa las categorías ni los productos seleccionados.

Eso significa que para el modal de editar, el frontend puede mostrar los datos básicos:

name
description
price
active
application_type

pero no sabrá qué checkbox marcar en:

Tortas
Tacos
Pastor

Para que el formulario de edición funcione como en tu imagen, después vamos a tener que mejorar el GET para que regrese también las relaciones.

5. Actualizar extra global

Si quieres que un extra aplique a todos los productos:

PUT http://localhost:3000/api/extras/ID_DEL_EXTRA
Body
{
  "name": "Piña",
  "description": "Piña disponible para todo el menú",
  "price": 0,
  "application_type": "global",
  "active": true,
  "categories": [],
  "products": []
}
Respuesta esperada
{
  "message": "Extra actualizado correctamente"
}

Tu backend hace esto correctamente:

await extraModel.deleteRelations(connection, id);

Entonces si antes estaba asignado a Pastor, se elimina esa relación y queda como global.

6. Actualizar extra a categorías

Si quieres que aplique solo a categorías:

PUT http://localhost:3000/api/extras/ID_DEL_EXTRA
Body
{
  "name": "Piña",
  "description": "Piña para categorías seleccionadas",
  "price": 0,
  "application_type": "category",
  "active": true,
  "categories": [
    "Tacos"
  ],
  "products": []
}
Respuesta esperada
{
  "message": "Extra actualizado correctamente"
}

Esto debe dejar datos en:

category_extras

y limpiar datos anteriores de:

product_extras
7. Actualizar extra a producto individual

Este es el caso exacto de tu segunda imagen, donde editas el extra y queda marcado Pastor.

PUT http://localhost:3000/api/extras/ID_DEL_EXTRA
Body
{
  "name": "Piña",
  "description": "Piña para tacos",
  "price": 0,
  "application_type": "product",
  "active": true,
  "categories": [],
  "products": [
    "fcc88c20-2598-44ce-9021-b475ca7ca6a5"
  ]
}
Respuesta esperada
{
  "message": "Extra actualizado correctamente"
}

Esto debe guardar en:

product_extras

y limpiar cualquier relación anterior con categorías.

8. Eliminar extra
DELETE http://localhost:3000/api/extras/ID_DEL_EXTRA
Respuesta esperada
{
  "message": "Extra eliminado"
}
Reglas que debe seguir tu frontend

Cuando el usuario marque:

Aplicar a todos los productos

El frontend debe mandar:

{
  "application_type": "global",
  "categories": [],
  "products": []
}
Una o más categorías

El frontend debe mandar:

{
  "application_type": "category",
  "categories": ["Tacos", "Tortas"],
  "products": []
}
Uno o más productos

El frontend debe mandar:

{
  "application_type": "product",
  "categories": [],
  "products": ["id-producto-1", "id-producto-2"]
}
Importante para que funcione como en la imagen

Tu POST y tu PUT están bien para guardar y actualizar.

Pero para que al abrir Editar Extra aparezca marcado Pastor, Tacos o Tortas, tu endpoint GET /api/extras necesita regresar también las relaciones.

Ahorita solo regresa esto:

SELECT *
FROM extras
ORDER BY created_at DESC

Por eso el frontend no tiene forma de saber qué checkboxes venían seleccionados.

La respuesta ideal del GET /api/extras debería ser algo así:

[
  {
    "id": "id-extra",
    "name": "Piña",
    "description": "Piña para tacos",
    "price": "0.00",
    "application_type": "product",
    "active": 1,
    "categories": [],
    "products": [
      "fcc88c20-2598-44ce-9021-b475ca7ca6a5"
    ]
  }
]

Así el modal de edición puede marcar automáticamente el checkbox de Pastor.