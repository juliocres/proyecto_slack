import ChannelMessage from "../models/channelMessage.model.js"

class ChannelMessageRepository {
    //Traer el historial de mensajes de un canal (del mas viejo al mas nuevo)
    async getAllByChannelId(channel_id) {
        const result = await ChannelMessage
            .find({ fk_id_canal: channel_id })
            .populate('fk_id_usuario', 'nombre email')
            .sort({ fecha_creacion: 1 })
        return result
    }
}
const channelMessage_repository = new ChannelMessageRepository()
export default channelMessage_repository
