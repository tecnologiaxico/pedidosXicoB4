'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var db = firebase.database();
var auth = firebase.auth();

var LANGUAGE = {
  searchPlaceholder: "Buscar",
  sProcessing: 'Procesando...',
  sLengthMenu: 'Mostrar _MENU_ registros',
  sZeroRecords: 'No se encontraron resultados',
  sEmptyTable: 'Ningún dato disponible en esta tabla',
  sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
  sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
  sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
  sInfoPostFix: '',
  sSearch: '<i style="color: #4388E5;" class="fas fa-search"></i>',
  sUrl: '',
  sInfoThousands: ',',
  sLoadingRecords: 'Cargando...',
  oPaginate: {
    sFirst: 'Primero',
    sLast: 'Último',
    sNext: 'Siguiente',
    sPrevious: 'Anterior'
  },
  oAria: {
    sSortAscending: ': Activar para ordenar la columna de manera ascendente',
    sSortDescending: ': Activar para ordenar la columna de manera descendente'
  }
};

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    startDate: "today",
    language: "es"
  });

  mostrarChequeos();
});

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>\n                  <a>\n                    <div>\n                      <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                      <span class="pull-right text-muted small">' + fecha + '</span>\n                    </div>\n                  </a>\n                </li>';
    }
    $('#contenedorNotificaciones').html(lis);
  });
}

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}

function mostrarChequeos() {
  var datatable = $('#tablaChequeos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    language: LANGUAGE,
    dom: 'Bfrtip',
    /* buttons: ['excel'], */
    buttons: [{
      extend: 'excel',
      className: 'btn btn-success',
      text: '<i class="far fa-file-excel"></i> Excel'
    }],
    scrollY: "500px",
    scrollCollapse: true
  });

  db.ref('chequeosPrecios').on('value', function (chequeosPrecios) {
    var filas = '';
    var chequeos = chequeosPrecios.val();
    var arrChequeosPrecios = [];
    chequeosPrecios.forEach(function (chequeo) {
      arrChequeosPrecios.unshift(_extends({
        id: chequeo.key
      }, chequeo.val()));
    });

    arrChequeosPrecios.forEach(function (chequeo) {
      var id = chequeo.id,
          consorcio = chequeo.consorcio,
          fechaCaptura = chequeo.fechaCaptura,
          zona = chequeo.zona;


      filas += '<tr>\n                  <td>' + consorcio + '</td>\n                  <td>' + fechaCaptura + '</td>\n                  <td>' + zona + '</td>\n                  <td class="text-center"><a class="btn btn-xs btn-primary" href="chequeo.html?id=' + id + '"><i class="fas fa-eye"></i></a></td>\n                  <td class="text-center"><button class="btn btn-xs btn-danger" onclick="eliminarChequeo(\'' + id + '\')"><i class="fas fa-trash-alt"></i></button></td>\n                </tr>';
    });

    datatable.clear().draw();
    datatable.rows.add($(filas)).columns.adjust().draw();
    datatable.buttons().container().appendTo('#example_wrapper .col-md-6:eq(0)');
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });
}

function eliminarChequeo(idChequeo) {
  swal({
    title: 'Advertencia',
    text: '\xBFEst\xE1 seguro de eliminar este chequeo?',
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#aaa',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Eliminar',
    reverseButtons: true
  }).then(function (result) {
    if (result.value) {
      db.ref('chequeosPrecios').child(idVentaDiaria).remove();

      swal({
        type: 'success',
        title: 'Mensaje',
        text: 'Se ha eliminado el chequeo'
      });
    }
  });
}