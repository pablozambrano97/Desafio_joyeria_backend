import { Router } from "express";
import { joyasController } from "../controllers/joyas_controller.js";

const router = Router();

const reportarConsulta = async (req, res, next) => {
    const parametros = req.params
    const querys = req.query
    const url = req.url
    console.log(`
    Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url} 
    con los parámetros y querys:
    `, parametros, querys)
    next() // informa el codigo y continua al siguiente bloque
}

// GET /joyas
router.get("/", reportarConsulta, joyasController.read);

// GET /joyas/filtros
router.get("/filtros", reportarConsulta, joyasController.readByFiltro);

//GET /joyas/:id
router.get("/:id", reportarConsulta, joyasController.readByid)



export default router;