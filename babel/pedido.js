'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var db = firebase.database();
var auth = firebase.auth();

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();

  /* let idPedido = getQueryVariable('id');
  let pedidos = JSON.parse(localStorage.getItem('pedidosEntrada'));
  mostrarDatos(pedidos[idPedido]); */

  var idPedido = getQueryVariable('id');
  db.ref('pedidoEntrada/' + idPedido).on('value', function (datos) {
    var pedido = datos.val();
    mostrarDatos(pedido);
  });
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
      //si hay un usuario
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

$('#btnPerfil').click(function (e) {
  e.preventDefault();

  $('#modalPerfil').modal('show');
});

function mostrarDatos(pedido) {
  var idPedido = getQueryVariable('id');
  var datatable = $('#productos').DataTable({
    destroy: true,
    ordering: false,
    paging: false,
    searching: false,
    dom: 'Bfrtip',
    /* buttons: ['excel'], */
    buttons: [{
      extend: 'excel',
      className: 'btn btn-info',
      text: '<i class="far fa-file-excel"></i> Excel'
    }],
    scrollY: "500px",
    scrollCollapse: true,
    language: {
      sProcessing: 'Procesando...',
      sLengthMenu: 'Mostrar _MENU_ registros',
      sZeroRecords: 'No se encontraron resultados',
      sEmptyTable: 'Ningún dato disponible en esta tabla',
      sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
      sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
      sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
      sInfoPostFix: '',
      sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
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
    }
  });

  /*let datos = pedidos[idPedido],
      encabezado = datos.encabezado,
      detalle = datos.detalle,
      fecha = encabezado.fechaCaptura; */
  var encabezado = pedido.encabezado,
      detalle = pedido.detalle,
      fecha = encabezado.fechaCaptura;

  if (encabezado.numOrden != "" && typeof encabezado.numOrden != "undefined") {
    $('#contenedorDatos').prepend('<p id="numOrden" class="lead"><small>N\xFAm. de orden: <strong>' + encabezado.numOrden + '</strong></small></p>');
  }

  $('#keyPedido').html('' + idPedido);
  $('#clavePedido').html('Pedido: ' + encabezado.clave);
  var diaCaptura = fecha.substr(0, 2),
      mesCaptura = fecha.substr(3, 2),
      añoCaptura = fecha.substr(6, 4),
      fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;

  moment.locale('es');
  var fechaCapturaMostrar = moment(fechaCaptura).format('LL');

  $('#fechaPedido').html('Enviado de: ' + encabezado.ruta + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Recibido el ' + fechaCapturaMostrar);
  $('#tienda').html('' + encabezado.tienda);

  var uid = encabezado.promotora;
  db.ref('usuarios/tiendas/supervisoras/' + uid).once('value', function (promotora) {
    var nombrePromotora = promotora.val().nombre;

    $('#coordinador').html('' + nombrePromotora);
  });

  var cantidadProductos = Object.keys(detalle).length;

  $('#cantidad').html('<small class="lead">' + cantidadProductos + '</small>');
  var filas = "",
      kgTotal = 0,
      degusTotal = 0,
      pedidoPzTotal = 0,
      piezaTotal = 0,
      precioUnitarioTotal = 0,
      cambioFisicoTotal = 0;
  datatable.clear().draw();
  for (var producto in detalle) {
    var datosProducto = detalle[producto];
    kgTotal += datosProducto.totalKg;
    degusTotal += datosProducto.degusPz;
    pedidoPzTotal += datosProducto.pedidoPz;
    piezaTotal += datosProducto.totalPz;
    precioUnitarioTotal += datosProducto.precioUnitario;
    cambioFisicoTotal += datosProducto.cambioFisicoPz;
    filas += '<tr>\n                <td class="text-center">' + datosProducto.clave + '</td>\n                <td>' + datosProducto.nombre + '</td>\n                <td class="text-right">' + datosProducto.pedidoPz + '</td>\n                <td class="text-right">' + datosProducto.degusPz + '</td>\n                <td class="text-right">' + datosProducto.cambioFisicoPz + '</td>\n                <td class="text-right">' + datosProducto.totalPz + '</td>\n                <td class="text-right">' + datosProducto.totalKg + '</td>\n                <td class="text-right">$ ' + datosProducto.precioUnitario + '</td>\n                <td class="text-center">' + datosProducto.unidad + '</td>\n                <td class="text-center"><button class="btn btn-warning btn-xs" onclick="abrirModalEditarProducto(\'' + producto + '\', \'' + datosProducto.clave + '\')"><i class="fas fa-pencil-alt" aria-hidden="true"></i></button></td>\n                <td class="text-center"><button class="btn btn-danger btn-xs" onclick="abrirModalEliminarProducto(\'' + producto + '\', \'' + datosProducto.clave + '\')"><i class="fas fa-trash-alt" aria-hidden="true"></i></button></td>\n              </tr>';
  }
  filas += '<tr>\n              <td></td>\n              <td class="text-right"><strong>Totales</strong></td>\n              <td class="text-right"><strong>' + pedidoPzTotal + '</strong></td>\n              <td class="text-right"><strong>' + degusTotal + '</strong></td>\n              <td class="text-right"><strong>' + cambioFisicoTotal + '</strong></td>\n              <td class="text-right"><strong>' + piezaTotal + '</strong></td>\n              <td class="text-right"><strong>' + kgTotal.toFixed(4) + '</strong></td>\n              <td class="text-right"><strong>$ ' + precioUnitarioTotal.toFixed(4) + '</strong></td>\n              <td></td>\n              <td></td>\n              <td></td>\n            </tr>';

  //$('#productos tbody').html(filas);
  actualizarTotales(kgTotal, piezaTotal);
  datatable.rows.add($(filas)).columns.adjust().draw();
  datatable.buttons().container().appendTo('#example_wrapper .col-md-6:eq(0)');
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
}

function actualizarTotales(kilos, piezas) {
  var idPedido = getQueryVariable('id');
  db.ref('pedidoEntrada/' + idPedido + '/encabezado').update({
    totalKilos: kilos.toFixed(4),
    totalPiezas: piezas
  });
}

function abrirModal() {
  $('#modalAgregarProducto').modal('show');
  llenarSelectProductos();
}

$('#modalAgregarProducto').on('hide.bs.modal', function () {
  $('#listaProductos').val('');
  $('#nombre').val('');
  $('#claveConsorcio').val('');
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#cambioFisicoPz').val('');
  $('#empaque').val('');
  $('#precioUnitario').val('');
  $('#unidad').val('');
  $('#totalPz').val('');
  $('#totalKg').val('');
});

$('#modalEditarProducto').on('hide.bs.modal', function () {
  $('#nombreEditar').val('');
  $('#claveConsorcioEditar').val('');
  $('#pedidoPzEditar').val('');
  $('#degusPzEditar').val('');
  $('#cambioFisicoPzEditar').val('');
  $('#empaqueEditar').val('');
  $('#precioUnitarioEditar').val('');
  $('#unidadEditar').val('');
  $('#totalPzEditar').val('');
  $('#totalKgEditar').val('');
});

function llenarSelectProductos() {
  var idPedido = getQueryVariable('id');
  var pedidoEntradaRef = db.ref('pedidoEntrada/' + idPedido);
  pedidoEntradaRef.on('value', function (snapshot) {
    var consorcio = snapshot.val().encabezado.consorcio;

    var productosRef = db.ref('productos/' + consorcio);
    productosRef.on('value', function (snapshot) {
      var productos = snapshot.val();
      var options = '<option value="Seleccionar" id="SeleccionarProducto">Seleccionar</option>';
      for (var producto in productos) {
        options += '<option value="' + producto + '"> ' + producto + ' ' + productos[producto].nombre + ' ' + productos[producto].empaque + '</option>';
      }
      $('#listaProductos').html(options);
    });
  });
}

$('#listaProductos').change(function () {
  var idProducto = $(this).val();

  if (idProducto != undefined) {
    var idPedido = getQueryVariable('id');
    var pedidoEntradaRef = db.ref('pedidoEntrada/' + idPedido);
    pedidoEntradaRef.on('value', function (snapshot) {
      var consorcio = snapshot.val().encabezado.consorcio;

      var productoActualRef = db.ref('productos/' + consorcio + '/' + idProducto);
      productoActualRef.on('value', function (snapshot) {
        var producto = snapshot.val();
        $('#nombre').val(producto.nombre);
        $('#empaque').val(producto.empaque);
        $('#precioUnitario').val(producto.precioUnitario);
        $('#unidad').val(producto.unidad);
        $('#claveConsorcio').val(producto.claveConsorcio);

        $('#pedidoPz').val('');
        $('#degusPz').val('');
        $('#cambioFisicoPz').val('');
        $('#totalKg').val('');
        $('#totalPz').val('');
      });
    });

    if (this.value != null || this.value != undefined) {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    } else {
      $('#productos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    }
  }
});

$('#pedidoPz').keyup(function () {
  var pedidoPz = Number($(this).val());
  var degusPz = Number($('#degusPz').val());
  var cambioFisicoPz = Number($('#cambioFisicoPz').val());
  var empaque = Number($('#empaque').val());
  var totalPz = pedidoPz + degusPz + cambioFisicoPz;
  var totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if (this.value.length < 1) {
    $('#pedidoPz').parent().addClass('has-error');
    $('#helpblockPedidoPz').show();
  } else {
    $('#pedidoPz').parent().removeClass('has-error');
    $('#helpblockPedidoPz').hide();
  }
});

$("#pedidoPz").bind('keyup change click', function (e) {
  if (!$(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    var pedidoPz = Number($(this).val());
    var degusPz = Number($('#degusPz').val());
    var cambioFisicoPz = Number($('#cambioFisicoPz').val());
    var empaque = Number($('#empaque').val());
    var totalPz = pedidoPz + degusPz + cambioFisicoPz;
    var totalKg = (totalPz * empaque).toFixed(4);

    $('#totalPz').val(totalPz);
    $('#totalKg').val(totalKg);

    if (this.value.length < 1) {
      $('#pedidoPz').parent().addClass('has-error');
      $('#helpblockPedidoPz').show();
    } else {
      $('#pedidoPz').parent().removeClass('has-error');
      $('#helpblockPedidoPz').hide();
    }
  }
});

$('#degusPz').keyup(function () {
  var pedidoPz = Number($('#pedidoPz').val());
  var degusPz = Number($(this).val());
  var cambioFisicoPz = Number($('#cambioFisicoPz').val());
  var empaque = Number($('#empaque').val());
  var totalPz = pedidoPz + degusPz + cambioFisicoPz;
  var totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$("#degusPz").bind('keyup change click', function (e) {
  if (!$(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    var pedidoPz = Number($("#pedidoPz").val());
    var degusPz = Number($(this).val());
    var cambioFisicoPz = Number($('#cambioFisicoPz').val());
    var empaque = Number($('#empaque').val());
    var totalPz = pedidoPz + degusPz + cambioFisicoPz;
    var totalKg = (totalPz * empaque).toFixed(4);

    $('#totalPz').val(totalPz);
    $('#totalKg').val(totalKg);
  }
});

$('#cambioFisicoPz').keyup(function () {
  var pedidoPz = Number($('#pedidoPz').val());
  var degusPz = Number($('#degusPz').val());
  var cambioFisicoPz = Number($(this).val());
  if (cambioFisicoPz == undefined || cambioFisicoPz == null) {
    cambioFisicoPz = 0;
  }
  var empaque = Number($('#empaque').val());
  var totalPz = pedidoPz + degusPz + cambioFisicoPz;
  var totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$("#cambioFisicoPz").bind('keyup change click', function (e) {
  if (!$(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    var pedidoPz = Number($('#pedidoPz').val());
    var degusPz = Number($('#degusPz').val());
    var cambioFisicoPz = Number($(this).val());
    if (cambioFisicoPz == undefined || cambioFisicoPz == null) {
      cambioFisicoPz = 0;
    }
    var empaque = Number($('#empaque').val());
    var totalPz = pedidoPz + degusPz + cambioFisicoPz;
    var totalKg = (totalPz * empaque).toFixed(4);

    $('#totalPz').val(totalPz);
    $('#totalKg').val(totalKg);
  }
});

function agregarProducto() {
  var idPedido = getQueryVariable('id');
  var claveProducto = $('#listaProductos').val();
  var nombre = $('#nombre').val();
  var pedidoPz = Number($('#pedidoPz').val());
  var degusPz = Number($('#degusPz').val());
  var cambioFisicoPz = Number($('#cambioFisicoPz').val());
  var unidad = $('#unidad').val();
  var empaque = Number($('#empaque').val());
  var totalKg = Number($('#totalKg').val());
  var totalPz = Number($('#totalPz').val());
  var precioUnitario = Number($('#precioUnitario').val());
  var claveConsorcio = $('#claveConsorcio').val();
  var pedidoKg = pedidoPz * empaque;

  if (claveProducto != null && claveProducto != undefined && claveProducto != "Seleccionar" && $('#pedidoPz').val().length > 0) {
    if (cambioFisicoPz.length < 1) {
      cambioFisicoPz = 0;
    }
    if (degusPz.length < 1) {
      degusPz = 0;
    }
    var cambioFisicoKg = cambioFisicoPz * empaque;
    var degusKg = degusPz * empaque;

    var datosProducto = {
      cambioFisicoPz: cambioFisicoPz,
      cambioFisicoKg: cambioFisicoKg,
      clave: claveProducto,
      claveConsorcio: claveConsorcio,
      degusKg: degusKg,
      degusPz: degusPz,
      empaque: empaque,
      nombre: nombre,
      pedidoPz: pedidoPz,
      pedidoKg: pedidoKg,
      precioUnitario: precioUnitario,
      totalKg: totalKg,
      totalPz: totalPz,
      unidad: unidad
    };

    var claves = [];

    var $filas = $('#tbodyProductos').children('tr'); //arreglo de hijos (filas)
    $filas.each(function () {
      var clave = $(this)[0].cells[0].innerHTML;
      claves.push(clave);
    });

    if (claves.includes(claveProducto)) {
      $.toaster({ priority: 'warning', title: 'Mensaje de información', message: 'El producto ' + claveProducto + ' ya se encuentra en el pedido' });
    } else {
      var pedidoEntradaRef = db.ref('pedidoEntrada/' + idPedido + '/detalle');
      pedidoEntradaRef.push(datosProducto);

      $.toaster({ priority: 'success', title: 'Mensaje de información', message: 'Se agreg\xF3 el producto ' + claveProducto + ' al pedido' });

      limpiarCampos();

      $('#modalAgregarProducto').modal('hide');
    }
  } else {
    if (claveProducto == null || claveProducto == undefined || claveProducto == "Seleccionar") {
      $('#listaProductos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    } else {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    }
    if (pedidoPz.length < 1) {
      $('#pedidoPz').parent().addClass('has-error');
      $('#helpblockPedidoPz').show();
    } else {
      $('#pedidoPz').parent().removeClass('has-error');
      $('#helpblockPedidoPz').hide();
    }
  }
}

function limpiarCampos() {
  $('#listaProductos').val('');
  $('#nombre').val('');
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#cambioFisicoPz').val('');
  $('#unidad').val('');
  $('#empaque').val('');
  $('#totalKg').val('');
  $('#totalPz').val('');
  $('#precioUnitario').val('');
  $('#claveConsorcio').val('');
}

function abrirModalEditarProducto(idProducto, claveProducto) {
  var idPedido = getQueryVariable('id');
  var pedidoRef = db.ref('pedidoEntrada/' + idPedido);
  pedidoRef.once('value', function (snapshot) {
    var consorcio = snapshot.val().encabezado.consorcio;

    var empaqueRef = db.ref('productos/' + consorcio + '/' + claveProducto);
    empaqueRef.once('value', function (snapshot) {
      var empaque = snapshot.val().empaque;

      var productoRef = db.ref('pedidoEntrada/' + idPedido + '/detalle/' + idProducto);
      productoRef.once('value', function (snapshot) {
        var producto = snapshot.val();

        $('#nombreEditar').val(producto.nombre);
        $('#pedidoPzEditar').val(producto.pedidoPz);
        $('#degusPzEditar').val(producto.degusPz);
        $('#cambioFisicoPzEditar').val(producto.cambioFisicoPz);
        $('#unidadEditar').val(producto.unidad);
        $('#empaqueEditar').val(empaque);
        $('#totalKgEditar').val(producto.totalKg);
        $('#totalPzEditar').val(producto.totalPz);
        $('#precioUnitarioEditar').val(producto.precioUnitario);
        $('#claveConsorcioEditar').val(producto.claveConsorcio);
      });

      $('#modalEditarProducto').modal('show');
      $('#btnActualizarProducto').attr('onclick', 'editarProducto("' + idProducto + '")');
    });
  });
}

$('#pedidoPzEditar').keyup(function () {
  var pedidoPz = Number($(this).val());
  var degusPz = Number($('#degusPzEditar').val());
  var cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
  var empaque = Number($('#empaqueEditar').val());

  var totalPz = pedidoPz + degusPz + cambioFisicoPz;
  var totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);

  if (this.value.length < 1) {
    $('#pedidoPzEditar').parent().addClass('has-error');
    $('#helpblockPedidoPzEditar').show();
  } else {
    $('#pedidoPzEditar').parent().removeClass('has-error');
    $('#helpblockPedidoPzEditar').hide();
  }
});

$("#pedidoPzEditar").bind('keyup change click', function (e) {
  if (!$(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    var pedidoPz = Number($(this).val());
    var degusPz = Number($('#degusPzEditar').val());
    var cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
    var empaque = Number($('#empaqueEditar').val());

    var totalPz = pedidoPz + degusPz + cambioFisicoPz;
    var totalKg = (totalPz * empaque).toFixed(4);

    $('#totalPzEditar').val(totalPz);
    $('#totalKgEditar').val(totalKg);

    if (this.value.length < 1) {
      $('#pedidoPzEditar').parent().addClass('has-error');
      $('#helpblockPedidoPzEditar').show();
    } else {
      $('#pedidoPzEditar').parent().removeClass('has-error');
      $('#helpblockPedidoPzEditar').hide();
    }
  }
});

$('#degusPzEditar').keyup(function () {
  var pedidoPz = Number($('#pedidoPzEditar').val());
  var degusPz = Number($(this).val());
  var cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
  var empaque = Number($('#empaqueEditar').val());
  var totalPz = pedidoPz + degusPz + cambioFisicoPz;
  var totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

$("#degusPzEditar").bind('keyup change click', function (e) {
  if (!$(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    var pedidoPz = Number($('#pedidoPzEditar').val());
    var degusPz = Number($(this).val());
    var cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
    var empaque = Number($('#empaqueEditar').val());
    var totalPz = pedidoPz + degusPz + cambioFisicoPz;
    var totalKg = (totalPz * empaque).toFixed(4);

    $('#totalPzEditar').val(totalPz);
    $('#totalKgEditar').val(totalKg);
  }
});

$('#cambioFisicoPzEditar').keyup(function () {
  var pedidoPz = Number($('#pedidoPzEditar').val());
  var degusPz = Number($('#degusPzEditar').val());
  var cambioFisicoPz = Number($(this).val());
  if (cambioFisicoPz == undefined || cambioFisicoPz == null) {
    cambioFisico = 0;
  }
  var empaque = Number($('#empaqueEditar').val());
  var totalPz = pedidoPz + degusPz + cambioFisicoPz;
  var totalKg = (totalPz * empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

$("#cambioFisicoPzEditar").bind('keyup change click', function (e) {
  if (!$(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    var pedidoPz = Number($('#pedidoPzEditar').val());
    var degusPz = Number($('#degusPzEditar').val());
    var cambioFisicoPz = Number($(this).val());
    if (cambioFisicoPz == undefined || cambioFisicoPz == null) {
      cambioFisico = 0;
    }
    var empaque = Number($('#empaqueEditar').val());
    var totalPz = pedidoPz + degusPz + cambioFisicoPz;
    var totalKg = (totalPz * empaque).toFixed(4);

    $('#totalPzEditar').val(totalPz);
    $('#totalKgEditar').val(totalKg);
  }
});

function editarProducto(idProducto) {
  var idPedido = getQueryVariable('id');
  var productoRef = db.ref('pedidoEntrada/' + idPedido + '/detalle/' + idProducto);

  var pedidoPz = Number($('#pedidoPzEditar').val());
  var degusPz = Number($('#degusPzEditar').val());
  var cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
  var empaque = Number($('#empaqueEditar').val());
  var totalKg = Number($('#totalKgEditar').val());
  var totalPz = Number($('#totalPzEditar').val());
  var cambioFisicoKg = cambioFisicoPz * empaque;
  var degusKg = degusPz * empaque;
  var pedidoKg = pedidoPz * empaque;

  productoRef.update({
    pedidoPz: pedidoPz,
    degusPz: degusPz,
    cambioFisicoPz: cambioFisicoPz,
    empaque: empaque,
    totalKg: totalKg,
    totalPz: totalPz,
    cambioFisicoKg: cambioFisicoKg,
    degusKg: degusKg,
    pedidoKg: pedidoKg
  });

  $('#modalEditarProducto').modal('hide');
  $.toaster({ priority: 'info', title: 'Mensaje de información', message: 'El producto ' + idProducto + ' se actualiz\xF3 correctamente' });
}

function abrirModalEliminarProducto(idProducto, claveProducto) {
  $('#modalConfirmarEliminarProducto').modal('show');
  $('#btnConfirmar').attr('onclick', 'eliminarProducto("' + idProducto + '", "' + claveProducto + '")');
}

function eliminarProducto(idProducto, claveProducto) {
  var idPedido = getQueryVariable('id');
  db.ref('pedidoEntrada/' + idPedido + '/detalle').child(idProducto).remove();
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: 'El producto ' + claveProducto + ' fue eliminado con exito de este pedido' });
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

      lis += '<li>\n                <a>\n                  <div>\n                    <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                    <span class="pull-right text-muted small">' + fecha + '</span>\n                  </div>\n                </a>\n              </li>';
    }
    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
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

function generarPDF() {
  var contenido = document.getElementById('panel').innerHTML;
  var contenidoOriginal = document.body.innerHTML;
  document.body.innerHTML = contenido;
  window.print();
  document.body.innerHTML = contenidoOriginal;
}
/*function generarPDF() {
  let pdf = new jsPDF('p', 'in', 'letter');

  var source = $('#panel')[0];
  var specialElementHandlers = {
    '#bypassme': function(element, renderer) {
    return true;
    }
  };

  pdf.fromHTML(
    source, // HTML string or DOM elem ref.
    0.5, // x coord
    0.5, // y coord
    {
    'width': 7.5, // max width of content on PDF
    'elementHandlers': specialElementHandlers
  });

  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/

/*function generarPDF() {
  let pdf = new jsPDF();

  pdf.fromHTML($('#panel').get(0), 10, 10, {'width': 180});
  //pdf.autoPrint();
  //pdf.output("dataurlnewwindow"); // this opens a new popup,  after this the PDF opens the print window view but there are browser inconsistencies with how this is handled

  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/

$("#btnExcel").click(function (e) {
  var file = new Blob([$('#panel').html()], { type: "application/vnd.ms-excel" });
  var url = URL.createObjectURL(file);
  var a = $("<a />", {
    href: url,
    download: "pedido.xls" }).appendTo("body").get(0).click();
  e.preventDefault();
});

function exportarCSV() {
  var idPedido = getQueryVariable('id');
  var result = void 0,
      ctr = void 0,
      keys = void 0,
      columnDelimiter = void 0,
      lineDelimiter = void 0;
  db.ref('pedidoEntrada/' + idPedido).on('value', function (pedido) {
    var _pedido$val$encabezad = pedido.val().encabezado,
        clave = _pedido$val$encabezad.clave,
        tienda = _pedido$val$encabezad.tienda,
        promotora = _pedido$val$encabezad.promotora,
        fechaCaptura = _pedido$val$encabezad.fechaCaptura,
        ruta = _pedido$val$encabezad.ruta;

    var cantidadProductos = Object.keys(pedido.val().detalle).length;
    var arrayProductos = [];
    var productos = pedido.val().detalle;

    result = '\nPedido: ' + clave + '\n\n              Enviado de: ' + ruta + '\n\n              Recibido el ' + fechaCaptura + '\n\n              Id del pedido: ' + idPedido + '\n\n              Tienda: ' + tienda + '\n\n              Promotor(a): ' + promotora + '\n\n              Productos de este pedido: ' + cantidadProductos + '\n\n              \n';

    Object.keys(productos).forEach(function (key) {
      var _arrayProductos$push;

      var _productos$key = productos[key],
          clave = _productos$key.clave,
          nombre = _productos$key.nombre,
          pedidoPz = _productos$key.pedidoPz,
          degusPz = _productos$key.degusPz,
          cambioFisicoPz = _productos$key.cambioFisicoPz,
          totalPz = _productos$key.totalPz,
          totalKg = _productos$key.totalKg,
          precioUnitario = _productos$key.precioUnitario,
          unidad = _productos$key.unidad;


      arrayProductos.push((_arrayProductos$push = {
        Clave: clave,
        Descripcion: nombre
      }, _defineProperty(_arrayProductos$push, 'Pedido Pz', pedidoPz), _defineProperty(_arrayProductos$push, 'Degustacion', degusPz), _defineProperty(_arrayProductos$push, 'Cambio fisico', cambioFisicoPz), _defineProperty(_arrayProductos$push, 'Total Pz', totalPz), _defineProperty(_arrayProductos$push, 'Total Kg', totalKg), _defineProperty(_arrayProductos$push, 'Precio unit.', precioUnitario), _defineProperty(_arrayProductos$push, 'Unidad', unidad), _arrayProductos$push));
    });
    var data = arrayProductos || null;

    var args = { data: arrayProductos };

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);
    /*     result = ''; */
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
      ctr = 0;
      keys.forEach(function (key) {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    var csv = result;
    if (csv == null) return;
    var filename = 'pedido.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    var datos = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', datos);
    link.setAttribute('download', filename);
    link.click();
  });
}