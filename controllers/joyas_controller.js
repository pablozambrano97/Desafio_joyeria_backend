import { obtenerJoyas, prepararHATEOAS, obtenerJoyasPorFiltros, obtenerJoyasPorId } from "../datebase/consultas.js";
import { handleError } from "../handleError.js";

const read = async (req, res) => {

    try {
            const {limits, order_by, page} = req.query;

            const isPageValid = /^[1-4]\d*$/.test(page);
            
            if (!isPageValid) {
                return res.status(400).json({ message: "Invalid page number, number > 0" });
            }
            console.log("Valor limits,  order_by, page  antes de llamado: ", limits, order_by, page)

            const joyas = await obtenerJoyas({limits, order_by, page})

            const HATEOAS = await prepararHATEOAS(joyas, limits, page )
            res.json(HATEOAS); // respuesta del servidor

    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, result: message })
};
}

const readByFiltro = async (req, res) => {
    const { precio_min, precio_max, categoria, metal } = req.query;
    if( !precio_min || !precio_max || !categoria || !metal ){
        return res.status(404).json({ok:false, message: 'campos obligatorios faltantes'});
    }
    try {
        const joyas = await obtenerJoyasPorFiltros({precio_min, precio_max, categoria, metal});
        if (!joyas) {
        res.status(404).json({ message: "joyas not found" });
    }
        const HATEOAS = await prepararHATEOAS(joyas)
        res.json(HATEOAS); // respuesta del servidor
    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, result: message });
    };
}

const readByid = async (req, res) => {
    const {id} = req.params;
    console.log('id captado por params' + id);
    try {
        console.log('antes de entrar a la funcion obtenerJoyasPor Id');
        const joyas = await obtenerJoyasPorId({id});
        if (!joyas) {
            res.status(404).json({ message: "joyas not found" });
        }
            res.json(joyas); 
    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, result: message });
    }
}

    export const joyasController = {
    read,
    readByFiltro,
    readByid
}