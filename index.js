const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//Extraer valores de variables.env
require('dotenv').config({ path: 'variables.env'})

//helpers con algunas funciones
const helpers = require('./helpers');

//Crear conexion a BD
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos'); 
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then (() => console.log('Conectado al Servidor'))
    .catch (error => console.log(error));

//Crear una aplicación de Express
const app = express();

//Habilitar bodyParser para leer datos del form
app.use(bodyParser.urlencoded({extended: true}));

//Donde cargar los archivos estáticos
app.use(express.static('public'));

//Habilitar pug
app.set('view engine', 'pug');

//Añadir carpetas de vistas
app.set('views', path.join(__dirname, './views'))

//agregar flash messages
app.use(flash());

app.use(cookieParser());

//sessiones nos permiten navegar entre distintas páginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Pasar var dump a la aplicación
app.use((req, res, next) =>{
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});

//Aprendiendo Middleware
app.use((req, res, next) =>{
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});;




app.use('/', routes());

//Servidor y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor está funcionando')
});
