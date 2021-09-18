// Rutas para autenticar usuarios.
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

// Crea un usuario.
//Consulta de la api: api/auth.
router.post('/', 
    async (req, res) => {

        const {email, password} = req.body;
        
        try {
            //Revisar que sea un usuario registrado.
            let user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({message: 'El usuario no existe'});
            }

            //Revisar el password.
            const correctPassword = await bcrypt.compare(password, user.password);
            if (!correctPassword) {
                return res.status(400).json({message: 'Password incorrecto'});
            }

            //Si todo es correcto.
            //Crear y firmar el JWT.
            const payload = {
                user: {
                    id: user.id
                }
            };

            //Firmar el JWT.
            jwt.sign(payload, 'hasel', {
                expiresIn: 3600
            }, (error, token) => {
                if (error) throw error;

                //Mensaje de confirmación.
                res.json({token});
            });

        } catch (error) {
            console.log(error);
        }

    }
);

router.get('/', 
    auth,
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json({user});

        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'Hubo un error'});
        }
    }
)

module.exports = router;