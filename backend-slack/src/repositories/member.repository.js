import Member from "../models/member.model.js"

class MemberRepository {
    async create(userId, workspaceId, role) {
        const member_created = await Member.create({
            fk_id_usuario: userId,
            fk_id_espacio_trabajo: workspaceId,
            rol: role,
            activo: true

        })

        //Populamos el usuario para que la respuesta incluya su nombre y email (ademas del rol)
        await member_created.populate('fk_id_usuario', 'nombre email')

        return member_created
    }

    //Crear una membresia que todavia no fue aceptada (el miembro fue invitado por mail)
    async createInvitation(userId, workspaceId, role) {
        return await Member.create({
            fk_id_usuario: userId,
            fk_id_espacio_trabajo: workspaceId,
            rol: role,
            activo: false,
            invitacion_aceptada: false
        })
    }

    async getById(memberId) {
        return await Member.findById(memberId)
    }

    async deleteById(memberId) {
        const result = await Member.findByIdAndDelete(memberId)
        return result
    }

    async updateById(memberId, update_data) {
        return await Member.findByIdAndUpdate(memberId, update_data, { new: true })
    }

    async updateRoleById(memberId, role) {
        const result = await Member.findByIdAndUpdate(memberId, { rol: role })
        return result
    }


    /* 
    formato: 
        {
            member_id,
            member_role,
            workspace_id,
            workspace_name
            workspace_fecha_creacion
        }

    */
    async getAllWorkspaceByUserId (user_id){
        //Traer todas las membresias de un usuario
        const result = await Member
        .find({fk_id_usuario: user_id})
        .select('rol fecha_creacion fk_id_espacio_trabajo')
        .populate(
            'fk_id_espacio_trabajo',
            'nombre fecha_creacion'
        )

        //Descartamos membresias huerfanas (membresias cuyo workspace ya no existe,
        //el populate de un id inexistente devuelve null)
        return result
        .filter(membership => membership.fk_id_espacio_trabajo)
        .map(
            membership => {
                return {
                    member_id: membership._id,
                    member_rol: membership.rol,
                    workspace_id: membership.fk_id_espacio_trabajo._id,
                    workspace_nombre: membership.fk_id_espacio_trabajo.nombre,
                    workspace_fecha_creacion: membership.fk_id_espacio_trabajo.fecha_creacion
                }
            }
        )
    }

    /*
    formato:
        {
            member_id,
            nombre,
            email,
            member_rol,
            fecha_creacion
        }
    */
    //Traer todos miembros de un espacio de trabajo
    async getAllMembershipsByWorkspaceId(workspace_id){
        const result = await Member
        .find({fk_id_espacio_trabajo: workspace_id})
        .populate('fk_id_usuario', 'nombre email')

        //Descartamos membresias huerfanas (membresias cuyo usuario ya no existe,
        //el populate de un id inexistente devuelve null)
        return result
        .filter(membership => membership.fk_id_usuario)
        .map(
            membership => {
                return {
                    member_id: membership._id,
                    nombre: membership.fk_id_usuario.nombre,
                    email: membership.fk_id_usuario.email,
                    member_rol: membership.rol,
                    fecha_creacion: membership.fecha_creacion
                }
            }
        )
    }

    async getMembershipByUserAndWorkspace (user_id, workspace_id){
        return await Member.findOne({fk_id_usuario:user_id, fk_id_espacio_trabajo: workspace_id })
    }


    //Borrar las membresias de un espacio de trabajo
    async deleteAllMembershipsByWorkspaceId(workspace_id){
        await Member.deleteMany({fk_id_espacio_trabajo: workspace_id})
    }
}
const member_repository = new MemberRepository()
export default member_repository
