import mongoose from "mongoose";
import { CHANNEL_COLLECTION_NAME } from "./channel.model.js";
import { USER_COLLECTION_NAME } from "./user.model.js";

/*
Mensaje enviado dentro de un canal:
    - contenido: el texto del mensaje
    - fk_id_canal: referencia al canal al que pertenece el mensaje
    - fk_id_usuario: referencia al autor del mensaje
*/
const channelMessageSchema = new mongoose.Schema(
    {
        contenido: {
            type: String,
            required: true,
            maxlength: 2000,
            trim: true
        },
        fk_id_canal: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: CHANNEL_COLLECTION_NAME
        },
        fk_id_usuario: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: USER_COLLECTION_NAME
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        }
    }
)

export const CHANNEL_MESSAGE_COLLECTION_NAME = 'MensajeCanal'
const ChannelMessage = mongoose.model(CHANNEL_MESSAGE_COLLECTION_NAME, channelMessageSchema)
export default ChannelMessage
