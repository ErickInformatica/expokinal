'use strict'

var Charla = require('../models/conferencia');
var User = require('../models/user');
const nodemailer = require('nodemailer');
var inlineBase64 = require('nodemailer-plugin-inline-base64');
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
console.log("Comienza:::"+modificado+":::::::::termina")


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
            transporter.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));
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