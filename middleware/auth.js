const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    //Leer el token del header.
    const token = req.header('x-auth-token');

    //Revisar si no hay token.
    if(!token) {
        return res.status(401).json({message: 'No hay token. Permiso no válido'});
    }

    //Validar el token.
    try {
        const crypto = jwt.verify(token, 'hasel');
        req.user = crypto.user;
        next();

    } catch (error) {
        res.status(401).json({message: 'Token no válido'});
    }
}