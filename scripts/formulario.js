// ==========================================================================
//  Formulario de contacto (index.html, #form-contacto)
//
//  Envía la solicitud a FormSubmit por AJAX (misma URL del action, con /ajax/)
//  y, si sale bien, redirige a pages/gracias.html con ruta RELATIVA: así el
//  sitio funciona igual en GitHub Pages que en cualquier dominio propio.
//  Sin JavaScript, el formulario sigue funcionando con el envío normal.
// ==========================================================================
(function () {
    'use strict';

    var form = document.getElementById('form-contacto');
    if (!form) return;

    var boton = form.querySelector('.btn-enviar');
    var estado = document.getElementById('form-estado');
    var textoOriginal = boton.innerHTML;
    var enviando = false;

    var URL_GRACIAS = 'pages/gracias.html';
    var TIEMPO_MAX_MS = 20000;
    var MENSAJE_ERROR =
        'No pudimos enviar su solicitud. Intente de nuevo en un momento o escríbanos por WhatsApp al +52 55 5403 0877.';

    function mostrarError(texto) {
        estado.textContent = texto;
        estado.hidden = false;
    }

    function ocuparBoton(ocupado) {
        enviando = ocupado;
        boton.disabled = ocupado;
        boton.setAttribute('aria-busy', String(ocupado));
        boton.innerHTML = ocupado
            ? '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Enviando…'
            : textoOriginal;
    }

    form.addEventListener('submit', function (evento) {
        // Si el navegador no soporta fetch, se deja el envío normal
        if (!window.fetch) return;

        evento.preventDefault();
        if (enviando) return;

        estado.hidden = true;
        ocuparBoton(true);

        var controlador = window.AbortController ? new AbortController() : null;
        var reloj = setTimeout(function () {
            if (controlador) controlador.abort();
        }, TIEMPO_MAX_MS);

        fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
            signal: controlador ? controlador.signal : undefined
        })
            .then(function (respuesta) {
                return respuesta.json().then(function (datos) {
                    // FormSubmit responde success: "true" (texto) o true
                    if (respuesta.ok && String(datos.success) === 'true') {
                        window.location.assign(URL_GRACIAS);
                        return;
                    }
                    throw new Error(datos.message || 'Respuesta no exitosa');
                });
            })
            .catch(function () {
                mostrarError(MENSAJE_ERROR);
                ocuparBoton(false);
            })
            .then(function () {
                clearTimeout(reloj);
            });
    });
})();
