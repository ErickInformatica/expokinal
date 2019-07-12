'use strict'

var Charla = require('../models/conferencia');
var User = require('../models/user');
const nodemailer = require('nodemailer');

function registrarCharla(req, res) {
    var charla = new Charla();
    var params = req.body;
    
    if(params.nombreCharla && params.descripcion &&params.comunicador && params.salon && params.numeroAsiento && params.fecha){
        charla.nombreCharla = params.nombreCharla;
        charla.descripcion = params.descripcion;
        charla.comunicador = params.comunicador;
        charla.salon = params.salon;
        charla.numeroAsiento = params.numeroAsiento;
        charla.fecha = params.fecha;
        charla.capacidad = params.numeroAsiento;
        charla.image = params.image;
        charla.ocupados = [];
        charla.confirmado = 0;
        Charla.find({$or: [
            {nombreCharla: charla.nombreCharla}
        ]}).exec((err, charlas)=>{
            
            if(err) return res.status(500).send({message: 'Error en la peticion de usuario'})
            
            if(charla && charlas.length >= 1){
                return res.status(500).send({message: 'el evento ya existe'});
            }else{

                    charla.save((err, charlaGuardada)=>{
                        if(err) return res.status(500).send({message: 'Error al guardar el evento'}) 
                        
                        if(charlaGuardada){
                            res.status(200).send({charla: charlaGuardada})
                        }else{
                            res.status(404).send({message: 'no se a podido registrar el evento'})
                        }
                    })
                
            }
        })
    }else{
        res.status(200).send({
            message: 'rellene los datos necesarios'
        })
    }
}


function editarCharla(req, res) {
    var charlaId = req.params.id;
    var params = req.body;
    console.log("WACHA ESTO"+params.nombreCharla)
    var conteo = 0;
    var conteo2 = 0;
    Charla.findById(charlaId, (err, enc)=>{
        for (let i = 0; i < enc.ocupados.length; i++) {
            if (enc.ocupados[i] != null) {
                conteo +=1
            }      
        }
        delete params.ocupados;
        params.capacidad = params.numeroAsiento - conteo;
        Charla.findByIdAndUpdate(charlaId , params, {new:true},(err, charlaActualizada)=>{
            if(err) return res.status(500).send({message: 'error en la peticion'});

            if(!charlaActualizada) return res.status(404).send({message: 'no se a podido actualizar el evento'});

            return res.status(200).send({charla: charlaActualizada});
        })
    })
}

function eliminarCharla(req, res) {
    var charlaId = req.params.id;
    var params = req.body;

    Charla.findByIdAndDelete(charlaId,(err, charlaEliminada)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!charlaEliminada) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({conferencia: charlaEliminada});
    })
}

function listarCharlas(req, res) {


    Charla.find((err, charlas)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!charlas) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({charlas: charlas});
    })
}

function buscarId(req,res) {
    var id = req.params.id;

    Charla.findById(id, (err, enc)=>{
        if (err) return res.status(500).send({message: 'error en la peticion'});

        if(!enc) return res.status(404).send({message: 'sin charlas'});
 
        return res.status(200).send({charla: enc});
    })
}
var documento;
function ocuparAsiento(req,res) {
    
    var charlaId = req.params.id;
    var userId = req.user.sub


    //SS
    var params = req.body;
    console.log("WACHA ESTO"+params.variable+"::Termina")

     var recorrer = params.variable;
     var recorrer2 = params.variable;
    //  for (const prop in recorrer) {
    //      console.log(`obj.${prop} = ${recorrer[prop]}`);
    //    }

       var posicion = recorrer.indexOf("src=");
       var posicionFinal = recorrer2.indexOf("></div>");
       
if (posicion == -1)
    console.log("posi"+posicion+"No estamos hablando de un gato");
else
console.log("posi"+posicion+"Este texto habla sobre un gato");

var modificado = recorrer.slice(posicion+5, posicionFinal-1)
console.log("Comienza:::"+modificado+":::::::::FUNCIONA MIERDA")


    // console.log("CONTROLLER"+docs)
    // documento = docs;
    Charla.findById(charlaId, (err,enc)=>{
       
        if (err) return res.status(500).send({message: 'error en la peticion'});
        if(!enc) return res.status(404).send({message: 'la charla no existe'});
        if(enc.capacidad == 0) return res.status(200).send({message: 'Evento lleno, por favor, busque otro'});

        var nuevosOcupados = enc.ocupados
        var nuevaCapacidad = enc.capacidad

        for (let i = 0; i < nuevosOcupados.length+1; i++) {
            if (nuevosOcupados[i] == userId) return res.status(200).send({message: 'ya esta registrado a este evento'});
            if (i < nuevosOcupados.length+1) {
                nuevosOcupados[i] = userId;
                nuevaCapacidad = nuevaCapacidad - 1;
                break;
            }            
        }
        Charla.findByIdAndUpdate(charlaId, {ocupados : nuevosOcupados, capacidad : nuevaCapacidad},{new: true}, (err, newOcupado)=>{
            if(err) return res.status(500).send({message: 'error en la peticion'});

            if(!newOcupado) return res.status(404).send({message: 'no se ha podido generar una inscripcion'});
            
            
            console.log("DD"+documento)
            var transporter = nodemailer.createTransport({
                service: "gmail",
            
                secure: false, // true for 465, false for other ports
                auth: {
                    user: `noreplykinal@gmail.com`, // Cambialo por tu email
                    pass: `encriptado2019` // Cambialo por tu password
                }
            });
            const mailOptions = {
                from: `"Kinal no reply" `,
                to: `elmerfermejor1@gmail.com`, // Cambia esta parte por el destinatario
                subject: `Confirmacion`,
                html: `
                ${params.variable}
                <img src="data:image/png;base64,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" >
                <td style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px;border-radius:10px 10px 0 0px;background-color:#FBAA68;background-position:left top;" bgcolor="#0b5394" align="left"> 
                              <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                <tr style="border-collapse:collapse;"> 
                                 <td width="560" valign="top" align="center" style="padding:0;Margin:0;"> 
                                  <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                    <tr style="border-collapse:collapse;"> 
                                    <td align="center" style="padding:0;Margin:0;padding-top:10px;"> <a href="${modificado}">LINK</a></td> 

                                     <td align="center" style="padding:0;Margin:0;padding-top:10px;">                 <img src="https://www.nocturnar.com/imagenes/imagenes-bonitas/Imagenes-con-mensajes-chidos-de-amor.jpg" >
                                     <ngx-qrcode  qrc-element-type="url" [qrc-value]="www.facebook.com">Hora</ngx-qrcode>
</td> 
                                    </tr> 
                                  </table> </td> 
                                </tr> 
                              </table> </td>
        `
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err)
                else
                    console.log(info);
            });
        })
    })
}


function correoRestablecerPassword(req, res) {
    var params = req.body;
    var userId=req.user.sub;
    var correoE;
    var password;
    var nombre;
    User.findById({_id:userId},(err,usuarioEncontrado)=>{
        if(err) return res.status(500).send({message:'No se ha podido encontrar la peticion'});
        if(usuarioEncontrado) {
            correoE=usuarioEncontrado.email;
            password=usuarioEncontrado.password;
            nombre = usuarioEncontrado.nombre;
            console.log(correoE,password);
            
            var transporter = nodemailer.createTransport({
                service: "gmail",
            
                secure: false, // true for 465, false for other ports
                auth: {
                    user: `noreplykinal@gmail.com`, // Cambialo por tu email
                    pass: `encriptado2019` // Cambialo por tu password
                }
            });
            const mailOptions = {
                from: `"Kinal no reply" `,
                to: `elmerfermejor1@gmail.com`, // Cambia esta parte por el destinatario
                subject: `Confirmacion`,
                html: `
                <strong>Nombre:</strong> ${documento} <br/>
        `
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err)
                else
                    console.log(info);
            });
        }else{
        return res.status(404).send({message:'No hay ningun usuario en existencia'});
        }
    });
}

function confirmarEntrada(req, res) {
    var charlaId = req.params.id;
    var userId = req.params.user;
    var registrado = false;

    Charla.findByIdAndUpdate(charlaId, {$inc: {confirmado: 1}},{new: true}, (err, newOcupado)=>{
        console.log(err)
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!newOcupado) return res.status(404).send({message: 'error al confirmar asistencia'});
        
        return res.status(200).send({message: 'gracias por presentarse, pase'});

    })
}

module.exports = {
    registrarCharla,
    editarCharla,
    listarCharlas,
    eliminarCharla,
    buscarId,
    ocuparAsiento,
    confirmarEntrada
}