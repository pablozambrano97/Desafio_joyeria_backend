import pkg from 'pg';
import format from "pg-format";
const { Pool } = pkg;

const pool = new Pool({
    allowExitOnIdle: true,
});

const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC", page = 1 }) => {
    const [campo, direccion] = order_by.split("_")
    //const offset = page * limits // iniciar en pagina 0
    if(page <= 0){
        page=1;
    }
    const offset = (page - 1) * limits // iniciar en pagina 1

    console.log("campo y forma de ordenamiento: ", campo + " " + direccion)
    console.log("page  y offset: ", page + " " + offset)

    const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);

    const { rows: joyas } = await pool.query(formattedQuery)
    return joyas
}

const obtenerJoyasPorFiltros = async ({ precio_min, precio_max, categoria, metal }) => {
    let filtros = []
    const values = []

    console.log("--------------------------------------------------------------------------------------")
    // una funcion interna para crear los valores parametricos
    const agregarFiltro = (valor) => {
        values.push(valor)
        const { length } = filtros
    }

    //llamando a funcion interna con argumentos definidos
    if (precio_min) agregarFiltro(precio_min);
    console.log("Valor array values con el precio: ", values);

    if (precio_max) agregarFiltro(precio_max);
    console.log("Valor array values con el precio: ", values);

    if (categoria) agregarFiltro(categoria);
    console.log("Valor array values con el precio: ", values);

    if (metal) agregarFiltro(metal);
    console.log("Valor array values con el precio: ", values);

    let consulta = 'SELECT * FROM inventario WHERE precio BETWEEN $1 AND $2 AND categoria = $3 AND metal = $4';
    console.log("Query base: ", consulta)


    const { rows: joyas } = await pool.query(consulta, values); //ejecucion query parametrizada
    return joyas;
}

const obtenerJoyasPorId = async ({id}) => {
    const query = "SELECT * FROM inventario WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

const prepararHATEOAS = async (joyas, limits=10, page=1) => {


    // ya con pagina y limites
    const results = joyas.map((j) => {
        return {
            name: j.nombre,
            price: j.precio,
            url: `http://localhost:3000/joyas/${j.id}`,
        }
    })

    console.log("Valor de Results: ", results)

    // toda la tabla
    const text = "SELECT * FROM inventario";
    const { rows: data } = await pool.query(text);

    // obtener total de elementos
    const total = data.length
    const total_pages = Math.ceil(total / limits);
    console.log("Total registros Limits Total Paginas: ", total, limits, total_pages)

    //HATEOAS COMO RESPUESTA
    const HATEOAS = {
        total,
        results, 
        meta: {
            total: total,
            limit: parseInt(limits),
            page: parseInt(page),
            total_pages: total_pages,
            next:
                total_pages <= page
                    ? null
                    : `http://localhost:3000/joyas?limits=${limits}&page=${parseInt(page) + 1
                    }`,
            previous:
                page <= 1
                    ? null
                    : `http://localhost:3000/joyas?limits=${limits}&page=${parseInt(page) - 1
                    }`,
        }
    }

    console.log("Valor de HATEOAS: ", HATEOAS)

    return HATEOAS
}

export {prepararHATEOAS, obtenerJoyas, obtenerJoyasPorFiltros, obtenerJoyasPorId}