import axios from 'axios';
import Swal from 'sweetalert2';

const btnEliminar = document.querySelector('#eliminar-proyecto');

if (btnEliminar){
    btnEliminar.addEventListener ('click', e => {
        const urlProyecto = e.target.dataset.proyectoUrl;
        //console.log(urlProyecto);

        Swal.fire({
            title: '¿Deseas borrar el proyecto?',
            text: "Un proyecto eliminado no se recupera",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'No, cancelar'
        })
            .then((result) => {
                if (result.value) {
                    //enviar petición a axios
                    const url = `${location.origin}/proyectos/${urlProyecto}`;  
                    //console.log(url);
                    
                    axios.delete(url, {params: {urlProyecto}})
                        .then(function(respuesta){
                            //console.log(respuesta)

                                Swal.fire(
                                    'Proyecto eliminado!',
                                    respuesta.data,
                                    'success'
                                );
                                
                                //redireccion a inicio
                                setTimeout(() => {
                                    window.location.href = '/'
                                }, 3000);
                        })
                        .catch(() => {
                            Swal.fire({
                                type:'error',
                                title: 'Hubo un error',
                                text: 'No se pudo eliminar el proyecto'
                            })
                        })
                }
            
            })
    })
}

export default btnEliminar;

