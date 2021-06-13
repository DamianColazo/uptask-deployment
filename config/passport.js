const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

// REferencia al modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

//local strategy - Login con credenciales propias (usuario - password)
passport.use(
    new localStrategy(
        //por default passport espera un usuario y password
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try{
                const usuario = await Usuarios.findOne({
                    where: { 
                        email,
                        activo:1
                    }
                });
                //El usuario existe, pero el password es incorrecto
                if(!usuario.verificarPassword(password)){
                    return done(null, false, {
                        message : 'Password incorrecto'
                    })
                }

                //El mail existe y el password es correcto
                return done(null, usuario)
            } catch (error){
                //Ese usuario no existe
                return done(null, false, {
                    message : 'Esa cuenta no existe'
                })
            }
        }
    )
);

//serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
})

//deserealizar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
})

//Exportar
module.exports = passport;