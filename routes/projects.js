const express = require('express');
const Project = require('../models/Project');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator'); 

// Crear proyectos.
//Consulta de la api: api/projects.
router.post('/',
    auth,
    [
        check('name')
        .not().isEmpty()
        .withMessage('El nombre del proyecto es obligatorio')
    ],
    async (req, res) => {

        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        } else {
            try {
                //Crear nuevo proyecto.
                const project = new Project(req.body);
        
                //Guardar el creador por medio de JWT.
                project.creator = req.user.id;
        
                //Guardar el proyecto.
                project.save();
                res.json(project);
        
            } catch (error) {
                console.log(error);
                res.status(500).send('Hubo un error');
            }
        }
    },
);

router.get('/', 
    auth,
    [
        check('name')
        .not().isEmpty()
        .withMessage('El nombre del proyecto es obligatorio')
    ],
    async (req, res) => {

        try {
            const projects = await Project.find({creator: req.user.id});
            res.json({projects});
    
        } catch (error) {
            console.log(error);
            res.status(500).send('Hubo un error');
        }
    }
);

router.put('/:id', 
    auth,
    [
        check('name')
        .not().isEmpty()
        .withMessage('El nombre del proyecto es obligatorio')
    ],
    async (req, res) => {

        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(422).json({errores: errores.array()})
        } else {

            //Extraer información del proyecto.
            const { name } = req.body;
            const newProject = {};

            if (name) {
                newProject.name = name;
            }

            try {
                //Revisar el ID.
                let project = await Project.findById(req.params.id);

                //El proyecto existe o no.
                if (!project) {
                    return res.status(404).json({message: 'Proyecto no encontrado'});
                }

                //Verificar el creador del proyecto.
                if (project.creator.toString() !== req.user.id) {
                    return res.status(401).json({message: 'No autorizado'});
                }

                //Actualizar.
                project = await Project.findByIdAndUpdate({_id: req.params.id}, {$set: newProject}, {new: true});;

                res.json({project});

            } catch (error) {
                console.log(error);
                res.status(500).send('Error en el servidor');
            }
        }
    },
);

router.delete('/:id',
    auth,
    async(req, res) => {
        try {
            //Revisar el ID.
            let project = await Project.findById(req.params.id);

            //El proyecto existe o no.
            if (!project) {
                return res.status(404).json({message: 'Proyecto no encontrado'});
            }

            //Verificar el creador del proyecto.
            if (project.creator.toString() !== req.user.id) {
                return res.status(401).json({message: 'No autorizado'});
            }

            //Eliminar.
            await Project.findOneAndRemove({_id: req.params.id});
            res.json({message: 'Proyecto eliminado'});

        } catch (error) {
            console.log(error);
            res.status(500).send('Error en el servidor');
        }
    }
);

module.exports = router;