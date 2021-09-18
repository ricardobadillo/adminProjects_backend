// Rutas para crear usuarios.
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Crea un usuario.
//Consulta de la api: api/users.
router.post('/', 
    [
        check('name')
        .not().isEmpty()
        .withMessage('El nombre es obligatorio'),
        check('email')
        .isEmail()
        .withMessage('Ingresa un email válido'),
        check('password')
        .isLength({min:6})
        .withMessage('Debe tener mínimo 6 caracteres')
    ], async (req, res) => {

        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(422).json({errores: errores.array()})
        } else {

            const {email, password} = req.body;
            
            try {

                // Revisar la unicidad del usuario.
                let user = await User.findOne({ email });
        
                if (user) {
                    return res.status(400).json({
                        message: 'El usuario ya existe'
                    });
                }
        
                // Crear el nuevo usuario.
                user = new User(req.body);
        
                //Hashear el password.
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
        
                //Guardar el nuevo usuario.
                await user.save();

                //Crear y firmar el JWT.
                const payload = {
                    user: {
                        id: user.id
                    }
                };

                //Firmar el JWT.
                jwt.sign(payload, 'hasel', {
                    expiresIn: 3600 * 24 * 30
                }, (error, token) => {
                    if (error) throw error;

                    //Mensaje de confirmación.
                    res.json({token});
                });

                //Mensaje de confirmación.
                // res.json({
                //     message: 'Usuario creado satisfactoriamente'
                // });
        
            } catch (error) {
                console.log(error);
                res.status(400).send('Hubo un error');
            }
        }
    },
);

module.exports = router;