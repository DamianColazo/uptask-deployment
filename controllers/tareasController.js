const { removeAttribute } = require('../models/Proyectos');
const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.agregarTarea = async (req, res, next) => {
    //console.log(req.params.url);
    
    
    //obtenemos el Proyecto actual
    const proyecto = await Proyectos.findOne({where: { url: req.params.url }});

    //leer el valor
    const {tarea} = req.body;

    //estado 0 y id del proyecto
    const estado = 0;
    const proyectoId = proyecto.id;

    //Insertar en BD
    const resultado = await Tareas.create({ tarea, estado, proyectoId});

    if(!resultado){
        return next;
    }

    //Redireccionar 
    res.redirect(`/proyectos/${req.params.url}`);
}

exports.cambiarEstadoTarea = async (req, res) => {
    const { id } = req.params;
    const tarea = await Tareas.findOne({where: { id }});
    
    let estado = 0;
    if (tarea.estado === estado){
        estado = 1;
    }

    tarea.estado = estado;

    const resultado = await tarea.save();

    if(!resultado) return next();
    
    res.status(200).send('Actualizado');
}

exports.eliminarTarea = async (req, res) => {
    const { id } = req.params;

    //Eliminar tarea
    const resultado = await Tareas.destroy({where: { id }});

    if(!resultado) return next();

    res.status(200).send('Tarea Eliminada correctamente');
}