// Public variable 
var countryCity; var countryName;
var currentYear = (new Date()).getFullYear();

$(document).ready(function() {
    $("#currentYear").text(currentYear);
});
// Select Element Rule Function
$.validator.addMethod("valueNotEquals", function(value, element, arg){
    return arg != value;
}, "Value must not equal arg.");

$.validator.addMethod("alphanumeric", function(value, element) {
    return this.optional(element) || /^\w+$/i.test(value);
}, "Letters, numbers, and underscores only please but not whitespaces and arrobas");

$.validator.addMethod("nameRegex", function(value, element) {
    return this.optional(element) || /^[a-z0-9\ \s]+$/i.test(value);
}, "Name must contain only letters, number &  space");

$('.download').on('click', function () {
    var data =  $(this).attr('data-file');
    SaveToDisk('/files/'+ data + '.png', 'CURSO ' + data.toUpperCase() );
});

// Forzar descarga de un archivo
function SaveToDisk(fileURL, fileName) {
    // para navegadores que no son IE
    if (!window.ActiveXObject) {
        var save = document.createElement('a');
        save.href = fileURL;
        save.target = '_blank';
        save.download = fileName || 'unknown';

        var evt = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': false
        });
        save.dispatchEvent(evt);

        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }

    // para IE < 11
    else if ( !! window.ActiveXObject && document.execCommand)     {
        var _window = window.open(fileURL, '_blank');
        _window.document.close();
        _window.document.execCommand('SaveAs', true, fileName || fileURL)
        _window.close();
    }
}
// Registration Form Validation
$(document).ready(function(){
    // Intl-Telf-Input
    
    var input1 = document.querySelector("#txtTelf");
   
    var iti1 = window.intlTelInput(input1, {        
        onlyCountries: [ "cl", "co", "cr", "cu",  "ec", "sv",
         "gt", "hn", "mx", "ni", "pa", "py", "pe", "do", "uy", "ve", "bo"],
        localizedCountries : {
            "do": "Republica Dominicana", "pe": "Peru",
            "mx": "Mexico", "pa": "Panama"
        },
        separateDialCode: true,
        initialCountry: "auto",
        geoIpLookup: function(callback) {
            $.getJSON('https://freegeoip.app/json/', function() {}, "jsonp").always(function(resp) {
              var countryCode = resp.country_code;
              countryCity = resp.city;
              countryName = resp.country_name;
              callback(countryCode);              
            });
        },
        utilsScript: "/js/utils.js" // just for formatting/placeholders etc
    }
    );
    var validator = $('#itsystems-form').validate({
        rules:{
            txtNom:{
                required:true,
                nameRegex:true
            },
            txtTelf:{
                required:true,
                digits:true,
                minlength: 7,
                alphanumeric:true
            },
            txtEmpresa:{
                required: true,
                nameRegex:true
            },
            txtCargo:{
                required: true,
                nameRegex:true
            },
            txtEmail:{
                required:true,
                email: true
            },
            chkAuto:{
                required: true
            }
        },
        messages:{
            txtNom:{
                required:"Ingrese sus nombres completos",
                nameRegex:"Ingrese numeros o letras"
            },
            txtTelf:{
                required: "Ingrese su numero telefonico",
                digits: "Ingrese solo numeros",
                minlength: "Minimo 7 caracteres",
                alphanumeric:"Ingrese solo numeros"
            },
            txtEmpresa:{
                required: "Ingrese el nombre de la empresa en la que pertenece",
                nameRegex:"Ingrese numeros o letras"
            },
            txtEmail:{
                required:"Ingrese su Correo electrónico",
                email:"Correo invalido"
            },
            chkAuto:{
                required: "Este campo es obligatorio"
            }
        },
        errorPlacement: function( label, element ) {
            if( element.attr( "name" ) === "audience[]" || element.attr( "name" ) === "event_services[]" ) {
                element.parent().append( label ); // this would append the label after all your checkboxes/labels (so the error-label will be the last element in <div class="controls"> )
            } else if (element.attr("name") == "txtTelf"){
                label.insertBefore(".telf-error");
            } else {
                label.insertBefore( element ); // standard behaviour
            }
        }
        ,
        submitHandler: function(form) {
            // Mientras carga el envio se bloquea el boton y luego realiza la animacion de carga.
            $('.btn-enviar').attr('disabled', 'true');
            $('.btn-enviar')
            .append('<span id="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

            // Variables para el envio
            var nombre = $('#itsystems-form').find('input[name="txtNom"]').val();
            var digit1 = iti1.getSelectedCountryData().dialCode;
            var digit2 = $('#itsystems-form').find('input[name="txtTelf"]').val();
            var telf = digit1 + digit2;
            var empresa = $('#itsystems-form').find('input[name="txtEmpresa"]').val();
            var cargo = $('#itsystems-form').find('input[name="txtCargo"]').val();
            var email = $('#itsystems-form').find('input[name="txtEmail"]').val();
            var paisSel = iti1.getSelectedCountryData().name;
            var ciudad = countryCity;
            var paisR = countryName;
            // Nombre del temario

            $.ajax({
                url: '',
                type: 'POST',
                // TODO: Cambiar los valores por el formulario actual 
                data: {
                    "entry.1608581245": paisSel,
                    "entry.1666539079": paisR,
                    "entry.1016680850":ciudad,
                    "entry.20737030": nombre,
                    "entry.1412086532": email,
                    "entry.1444273475": telf,
                    "entry.2054711039": cargo,
                    "entry.1811869299": empresa
                },
                success: function(data) {
                    console.log(data);
                    // Remover la etiqueta loading del botón Enviar
                    $('#loading').remove();
                    // Eliminar el bloque completo de ambos formularios
                    $('.after-post').remove();
                    // Deshabilitar el atributo disabled del botón Enviar
                    $('.btn-enviar').attr('disabled', 'false');
                    // Ejecutar la impresión de PDF 
                    // SaveToDisk("files/"+ temario +".pdf", temario);
                    var src_icon = 'img/icons/exito.png';
                    var mensaje = 'Se envió el mensaje con éxito.';
                    $('.response').append("<img class='mx-auto pt-5 w-50' src='"+ src_icon +"'>");
                    $('.response').append("<h4 class='mx-auto pb-5 text-center mt-4' style='color: rgb(35,38,38);'>"+mensaje+"</h4>");
                    /*$('.response')
                    .append("<p class='mx-auto text-center text-white'>Se descargará el temario del curso.</p>");
                    $('.response')
                    .append("<p class='mx-auto pb-6 text-center text-white'>Si no se descarga el archivo, haga click <a target='_blank' href='files/"+temario+".pdf'>Aquí</a>.</p>");*/
                    // Clear the form
					validator.resetForm();
                },
                error: function (e) {
                    console.log(e);
                }            
            });
            return false;
        }
    });
});

