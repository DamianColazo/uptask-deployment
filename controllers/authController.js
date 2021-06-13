const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handler/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: './iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Función para revisar si el usuario está logueado o no
exports.usuarioAutenticado = (req, res, next) => {
    //Si el usuario está autenticado adelante
    if(req.isAuthenticated()){
        return next();
    }

    //Sino está autenticado, redirigir al formulario
    return res.redirect('/iniciar-sesion');
}

//Función para cerrar sesión
exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); //al cerrar sesion nos lleva al loguin
    });
}

//genera un token si el usuario es valido
exports.enviarToken = async (req, res) => {
    //verificar que el usuario exista
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where: { email }});

    //Si no existe el usuario
    if(!usuario){
        req.flash ('error', 'No existe esa cuenta');
        res.redirect('/reestablecer');
    }

    //Usuario existe
    usuario.token= crypto.randomBytes(20).toString('hex');
    //console.log(usuario.token);
    usuario.expiracion = Date.now() + 3600000;

    //guardarlos en bd
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //Envía el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Pasword reset',
        resetUrl,
        archivo : 'reestablecer-password'
    });

    //terminar 
    req.flash('correcto', 'Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    //Si no encuentra el usuario
    if(!usuario){
        req.flash('error', 'No valido');
        res.redirect('/reestablecer');
    }

    //Formulario para generar el password
    res.render('resetPassword', {
        nombrePagina: 'Restablecer contraseña'
    })
}

//CAmbia password por uno nuevo
exports.actualizarPassword = async (req, res) => {
    //Verifica el token válido y fecha de expiración
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte]: Date.now()
            }
        }
    });

    //verificamos si el usuario existe
    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/reestablecer');
    }
    

    //hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10) );
    usuario.token = null;
    usuario.expiracion = null;

    //guardamos el nuevo password
    await usuario.save();

    req.flash('correcto', 'Tu password fue modificado correctamente');
    res.redirect('/iniciar-sesion');
    
}