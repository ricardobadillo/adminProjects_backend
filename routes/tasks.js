const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator'); 

//Crear una tarea.
//Consulta de la api: api/tasks.
router.post('/', 
    auth,
    [
        check('name').not()
        .isEmpty()
        .withMessage('El nombre es obligatorio'),
        check('project').not()
        .isEmpty()
        .withMessage('El proyecto es obligatorio')
    ],
    async (req, res) => {
    
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(422).json({errores: errores.array()})
        } else {

            try {

                //Extraer el proyecto y comprobar que existe.
                let {project} = req.body;

                const existProject = await Project.findById(project);

                if (!existProject) {
                    return res.status(404).json({message: 'Proyecto no encontrado'});
                }

                //Revisar si el proyecto actual pertenece al usuario autenticado.

                if (existProject.creator.toString() !== req.user.id){
                    return res.status(401).json({message: 'No autorizado'});
                }

                //Crear la tarea.
                const task = new Task(req.body);
                await task.save();
                res.json({task});
                
            } catch (error) {
                console.log(error);
                res.status(500).send('Hubo un error');
            }
        }
    }
);

router.get('/', 
    auth,
    async (req, res) => {

        try {
            //Extraer un proyecto.
            const {project} = req.query;

            const existProject = await Project.findById(project);

            if(!existProject) {
                return res.status(404).json({message: 'Proyecto no encontrado'});
            }

            //Revisar si el proyecto actual pertenece al usuario autenticado.
            if (existProject.creator.toString() !== req.user.id) {
                return res.status(401).json({message: "No autorizado"});
            }

            const tasks = await Task.find({project});
            res.json({tasks});

        } catch (error) {
            console.log(error);
            res.status(500).send('Hubo un error');   
        }
    }
);

router.put('/:id', 
    auth,
    async (req, res) => {
        try {
            //Extraer un proyecto.
            const {project, name, status} = req.body;

            //Si la tarea existe o no.
            let task = await Task.findById(req.params.id);
            
            if(!task) {
                return res.status(404).json({message: 'No existe esa tarea'});
            }

            const existProject = await Project.findById(project);

            //Revisar si el proyecto actual pertenece al usuario autenticado.
            if (existProject.creator.toString() !== req.user.id) {
                return res.status(401).json({message: "No autorizado"});
            }

            //Crear un objeto con la nueva información.
            const newTask = {};
            newTask.name = name;
            newTask.status = status;

            //Guardar la tarea.
            task = await Task.findOneAndUpdate({_id: req.params.id}, newTask, {new: true});
            res.json({task});

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Hubo un error'});
        }
    }
);

router.delete('/:id', 
    auth,
    async (req, res) => {
        try {
            //Extraer un proyecto.
            const {project} = req.query;

            //Si la tarea existe o no.
            let task = await Task.findById(req.params.id);
            
            if(!task) {
                return res.status(404).json({message: 'No existe esa tarea'});
            }

            const existProject = await Project.findById(project);

            //Revisar si el proyecto actual pertenece al usuario autenticado.
            if (existProject.creator.toString() !== req.user.id) {
                return res.status(401).json({message: "No autorizado"});
            }

            //Eliminar.
            await Task.findOneAndRemove({_id: req.params.id});
            res.json({message: 'Tarea eliminada'});

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Hubo un error'});
        }
    }
);

module.exports = router;