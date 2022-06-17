//Variables y Selectores
const formulario = document.getElementById('agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

//Eventos 
eventListeners();

function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
}

//Clases
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);   
        this.gastos = []; 
    }
    
    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];//Tomamos una copia del arreglo y agregamos el nuevo al final
        this.calcularRestante();
    }
    
    calcularRestante(){ 
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0) 
        this.restante = this.presupuesto - gastado;
        
    }
    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto => gasto.id !== id); //Filtramos el arreglo para que solo queden los que no sean el id que se paso por parametro
        this.calcularRestante(); // Iterara sobre los gastos y nos dira cuanto hemos gastado
    }

}

class UI {
    insertarPresupuesto (cantidad){
        //Extraemos los valores
        const {presupuesto, restante } = cantidad;
        //Agregar al html
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        //Crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center','alert');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{  
            divMensaje.classList.add('alert-success');
        }
        //Mensaje de error
        divMensaje.textContent = mensaje

        //Insertar en el HTML

        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        //Quitar el HTML
        setTimeout( () => {
            divMensaje.remove();
        },3000);
    }
    mostrarGastos(gastos){
        this.limpiarHTML(); //elimina el html previo

        //Iterar sobre los gastos
        gastos.forEach(gasto => {

            const {cantidad, nombre, id} = gasto;
            //Crear un li
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center'
            nuevoGasto.setAttribute('data-id', id);// Agregamos un atributo a un elemento HTML, ya no se aconseja tanto hacerlo
            nuevoGasto.dataset.id = id; //Esta agrega el prefijo data-, es la forma de usarlo actualmente.

            //Agregar el html del gasto 
            nuevoGasto.innerHTML = ` ${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>`;

            //Boton para borrar el gasto 
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar x'
            btnBorrar.onclick = () =>{
                eliminarGasto(id); //Esta es la forma para pasarle el parametro si lo pasamos de la forma habitual, llamaria la funcion directamente contrario a lo que queremos, que es que la llame al hacer click.
            }
            nuevoGasto.appendChild(btnBorrar);

            //Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
        })
    }

    limpiarHTML(){
        while ( gastoListado.firstChild ){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }
    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }
    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        //Comprobar 25% del presupuesto
        if( (presupuesto / 4) > restante ){
            restanteDiv.classList.remove('alert-success','alert-warning');//En caso de que exista warning tambien lo borrara
            restanteDiv.classList.add('alert-danger'); 
        } else if((presupuesto / 2) > restante){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger','alert-warning');
            restanteDiv.classList.add('alert-success');
        }
        formulario.querySelector('button[type="submit"]').disabled = false;

        //Si el total es 0 o menor

        if (restante <= 0){
            ui.imprimirAlerta('Presupuesto Agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;// Deshabilitamos para que no agreguen mas gastos
        }
    }
}

const ui = new UI();
let presupuesto;

//Funciones

function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('Cual es tu presupuesto?')
    // console.log(Number (presupuestoUsuario));
    if(presupuestoUsuario === null || presupuestoUsuario === '' || presupuestoUsuario === 0 || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        preguntarPresupuesto();
    }  
    //Presupuesto valido
     presupuesto = new Presupuesto(presupuestoUsuario);

     ui.insertarPresupuesto(presupuesto)
}
//Añade gastos
function agregarGasto(e){
    e.preventDefault();

    //Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number (document.querySelector('#cantidad').value);

    //Validar
    if (nombre === ''|| cantidad === '' ){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');

        return;
    }else if ( cantidad <= 0 ||  isNaN(cantidad)){
        ui.imprimirAlerta('Cantidad no valida','error');

        return;
    }

    //Generar un objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() } 

    //Agrega un nuevo gasto
    presupuesto.nuevoGasto( gasto );

    //Mensaje todo bn
    ui.imprimirAlerta('Gasto Agregado Correctamente');

    //Imprimir los gastos
    const { gastos, restante } = presupuesto // Le pasamos solo los datos a este metodo
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    //Reinicio el formulario
    formulario.reset();

}

function eliminarGasto (id){
    //Eliminar el gasto del objeto
    presupuesto.eliminarGasto(id);
    //Elimina los gastos del html
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
}