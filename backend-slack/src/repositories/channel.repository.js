import Channel from "../models/channel.model.js"

class ChannelRepository {
    async createChannel(name, description, workspace_id) {
        const result = await Channel.create(
            {
                nombre: name,
                descripcion: description,
                fk_id_espacio_trabajo: workspace_id
            }
        )
        return result
    }

    async getById(channel_id) {
        return await Channel.findById(channel_id)
    }

    async deleteById(channel_id) {
        const result = await Channel.findByIdAndDelete(channel_id)
        return result
    }
    async updateById(channel_id, name, description) {
        const result = await Channel.findByIdAndUpdate(
            channel_id, 
            { 
                nombre: name, 
                descripcion: description 
            }, 
            { new: true } //Hace que te devuelva el canal actualizado
        )
        return result
    }
    async getAllChannelsByWorkpaceId(workspace_id) {
        const result = await Channel.find({ fk_id_espacio_trabajo: workspace_id })
        return result
    }
    async getByNameAndWorkspace(name, workspace_id, exclude_channel_id = null) {
        const filter = {
            nombre: name,
            fk_id_espacio_trabajo: workspace_id
        }

        //Al editar, el propio canal no cuenta como duplicado
        if (exclude_channel_id) {
            filter._id = { $ne: exclude_channel_id }
        }

        return await Channel.findOne(filter)
    }
}
const channel_repository = new ChannelRepository()
export default channel_repository