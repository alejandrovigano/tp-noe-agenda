function guardarGrilla(nuevo_div) {
    if (nuevo_div.find(".tipoTarea:contains(Parcial)").length > 0){
        $('#grilla_parcial').append(nuevo_div);
    } else {
        $('#grilla_clase').append(nuevo_div);
    }

}

$("#borrarTodo").click(function () {
    if (confirm("Deseas borrar todo?")) {
        localStorage.clear();
        $(".evento-fila").remove();
    }
})

$('form').on('submit', function () {
    var fecha = $('#fecha').val();
    fecha_inversa = fecha.split("-");
    fecha = fecha_inversa[2] + "/" + fecha_inversa[1] + "/" + fecha_inversa[0];

    var materia = $('#materia').val();
    var tipoDeTarea = $('#tipoDeTarea').val();
    var profesor = $('#profesor').val();
    var condEntrega


    var individual = $("#individual").is(":checked")

    if (individual == true) {
        condEntrega = "Individual"
    } else {
        condEntrega = "Grupal"
    }

    var nuevo_div = $('<div class="evento-fila"></div>');

    // Creo otro dia, para mantener una clase comun a todo. antes se le ponia una clase a todos los elementos, puede dar errores esooo
    var contenido = "<div class='evento evento-pendiente'>" +
        "<div class='realizado'><i class='fa fa-circle-thin'></i><i class='fa fa-check'></i></div>" +
        "<div>" + materia + "</div>" +
        "<div class='fechaEvento'>" + fecha + "</div>" +
        "<div>" + profesor + "</div>" +
        "<div class='condEntrega'>" + condEntrega + "</div>" +
        "<div class='borrar'><i class='fa fa-trash-o'></i></div>" +
        "<div class='tipoTarea'>"+tipoDeTarea+"</div>"
        "</div>";

    nuevo_div.html(contenido);


    guardarGrilla(nuevo_div);

    actualizarEvento(nuevo_div)

    /* Ya creamos y agregamos un nuevo impuesto a la grilla, por ende, llamamos a la función para que guarda en el localStorage todos los impuestos con el nuevo incluido. */

    guardarEventos();

    $.mobile.navigate('#page1');

    return false;
});

$(document).on('pagebeforeshow', '#agregar', function () {
    $("#condicionEntregaForm").hide()
    $("#tipoDeTarea").change(function () {
        if ($(this).val() == "Clase") {
            $("#condicionEntregaForm").hide()
        } else {
            $("#condicionEntregaForm").show()
        }
    })
    $('form').each(function () {
        this.reset();
    });
});


// luego de crear un DIV con Jquery, le asigno los eventos de click a BORRAR y OK
function actualizarEvento(divEvento) {

    //BUSCO DENTRO DEL DIV CREADO Y LE ASIGNO EL BORRAR
    divEvento.find('.borrar').on('click', function () {
        if (confirm("¡Querés borrar este evento?")) {
            divEvento.remove();
            guardarEventos();
        }
    });

    //BUSCO DENTRO DEL DIV CREADO Y LE ASIGNO EL REALIZAR
    divEvento.find('.realizado').on('click', function () {

        divEvento.find(".evento").toggleClass("evento-hecho")
        divEvento.find(".evento").toggleClass("evento-pendiente")
        guardarEventos();
    });
}


/* Agregamos la posibilidad de guardar los cambios en el localStorage del dispositivo. Debemos guardar cada acción que el usuario haga, en relación a los datos que maneja la app. Si agrega un impuesto, debemos guardarlo; si lo modifica porque lo paga, debemos guardarlo y si lo elimina (uno o todos) también debemos guardar ese cambio producido. Por lo tanto en cada una de esas acciones vamos a realizar el mismo procedimiento: 

		- tomamos todos los divs que actualmente tiene la grilla (los impuestos)
		- los guardamos en un array
		- convertimos ese array en JSON
		- guardamos el JSON en el localStorage
		
Como en cada acción debemos hacer este mismo procedimiento, vamos a generar una función que reúna todas esas acciones la cual llamaremos luego de crear, modificar o eliminar impuestos. 
	
Esto nos asegura no perder cada modificación que se realice, pero todavía no nos asegura que el usuario los pueda ver al volver a abrir la app. Por lo tanto al momento de cargar la app (el ready de jQuery) debemos hacer el proceso inverso:

		- traemos el JSON del localStorage
		- lo convertimos en array 
		- recorremos los valores guardados para generar nuevamente exáctamente la misma cantidad de divs que tenía la grilla al momento de cerrarla.


LA FUNCIÓN QUE GUARDA TODO EN EL LOCALSTORAGE:
*/

function guardarEventos() {

    /* Declaramos el array donde guardaremos los impuestos actuales (los divs de la grilla) para luego convertirlos en JSON. */

    var impuestosActuales = new Array();

    /* Tomamos los divs de la grilla (los impuestos) y los recorremos con el bucle each() de jQuery, que recibe como argumento la función con las acciones a realizar en cada iteración del bucle. Dicha acción consiste en guerdar EL CONTENIDO HTML de cada div: sus etiquetas, texto y el CSS que tenga aplicado (por ej si lo marcamos como pagado el texto figura 	tachado) en una posición del array, mediante el método push() que agrega el elemento en la última posición del mismo. */

    $('.evento-fila').each(function () {

        impuestosActuales.push($(this).html());

    });

    /* El objeto JSON de jQuery tiene el método STRINGIFY que recibe como argumento un ARRAY y devuelve un STRING con formato JSON (el cual guardamos en una variable). */

    var impuestosGuardados = JSON.stringify(impuestosActuales);

    /* Ya con el array convertido en texto con formato JSON estamos listos para guardarlo localmente. Utilizamos el método setItem() que recibe como argumentos el nombre del item (la variable local) y su valor (como string), separados por coma.*/

    localStorage.setItem('impuestos', impuestosGuardados);

}// cierra la función guardarEventos

function eventoEsDeFecha(eventoDiv, fecha) {
    return eventoDiv.find("fechaEvento") == fecha
}

function cargarEventos(fecha) {
    /* Para recuperar el item guardado, usamos el método getItem() de localStorage, que recibe como argumento el nombre del item a recuperar. Lo guardamos en una variable. */

    var itemGuardado = window.localStorage.getItem("impuestos");

    /* Ahora vamos a reamar los impuestos guardados, pero SOLO SI teníamos 	algo guardado... (debemos verificarlo para evitar generar un único impuesto con el valor null, undefined o vacío que son las tres formas que puede devolver el navegador cuando le pedimos que traiga un item que no existe) */

    if (itemGuardado != "undefined" && itemGuardado != null && itemGuardado != "") {

        /* El item guardado con todos los impuestos es string pero con formato JSON. Para poder recorrerlo y volver a generar cada div individual, 	primero lo vamos a convertir nuevamente en array, mediante el método parse() de jQuery, que recibe un string con formato JSON como  argumento y devuelve un array. */

        var eventos = JSON.parse(itemGuardado);

        /* Ahora tenemos el ARRAY impuestos que vamos a recorrer con el bucle each(), al cuál lo accedemos desde el objeto $ de jQuery (el core del framework), ya que each(), como cualquier otro mètodo que utilizamos, debe accederse desde un object JQ, NO desde un array. El array a recorrer se pasa como primer argumento del método y la función con las acciones de cada iteración recibe 2 argumentos: el primero guarda el índice de la posición recorrida del array, y el segundo, su valor. En ESTE caso no nos interesa el nombre del índice, pero si su valor, ya que corresponde al contenido de cada div que guardamos originalmente. */

        $.each(eventos, function (indice, valor) {

            /* En cada iteración del bucle vamos a hacer acciones similares al proceso de agregar un nuevo impuesto ya que apenas carga la app no tiene ninguno y, justamente, debemos agregar uno a uno los que guardamos. Primero creamos un div (recordemos que localmente no guardamos el div sino su contenido html)... */

            var eventoDiv = $('<div class="evento-fila"></div>');

            /* ...luego le guardamos su contenido html que corresponde al parámetro valor recuperado en cada vuelta del bucle */

            eventoDiv.html(valor);

            actualizarEvento(eventoDiv)

            // Agregamos el nuevo div a la grilla.
            if (eventoEsDeFecha(eventoDiv, fecha)) {
                guardarGrilla(eventoDiv);
            }


            /* UN PASO MÁS... tenemos la posibilidad que el div guardado y ya vuelto a generar haya sido marcado como pagado. Si esto fue así el strong y el span tienen aplicada la clase pagado(recordar que se guarda el contenido html 	completo, incluso con el css y attrs que tenga aplicado), por lo tanto,	debemos aplicarle el fondo rojo y las letras blancas al div.*/

            if (eventoDiv.children('strong').attr('class') == 'pagado') {

                eventoDiv.css("background", "tomato");

            }
        }); //cierra el each
    } //cierra el if
}


/* El evento READY (el de carga del html), ocurre cuando abrimos la app. En ese preciso momento tenemos que levantar los datos guardados localmente y cargarlos dentro de la grilla. */
$(document).on('ready', function () {
    cargarEventos()
}); //cierra el ready








